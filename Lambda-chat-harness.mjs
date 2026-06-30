import {
  BedrockAgentCoreClient,
  InvokeHarnessCommand,
} from "@aws-sdk/client-bedrock-agentcore";

const client = new BedrockAgentCoreClient({
  region: "us-east-1",
});

const HARNESS_ARN = process.env.HARNESS_ARN;

// Lambdaが強制終了される前に自発的にタイムアウトするバッファ（ミリ秒）
// この時間だけ早めに切り上げ、クライアントにエラーを返す
const TIMEOUT_BUFFER_MSEC = process.env.TIMEOUT_BUFFER_MSEC||1000;

// Harness呼び出し＋ストリーム読み取りを1つのPromiseにまとめる
async function fetchReply(command) {
  const res = await client.send(command);
  let reply = "";

  if (res.stream) {
    for await (const streamEvent of res.stream) {
      const delta = streamEvent.contentBlockDelta?.delta?.text;
      if (delta) reply += delta;
    }
  }

  return reply;
}

export const handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { message } = body;

    if (!message || !message.trim()) {
      return respond(400, { error: "message は必須です" });
    }

    const sessionId = body.sessionId || crypto.randomUUID();

    const command = new InvokeHarnessCommand({
      harnessArn: HARNESS_ARN,
      runtimeSessionId: sessionId,
      messages: [
        {
          role: "user",
          content: [{ text: message.trim() }],
        },
      ],
    });

    // Lambdaの残り実行時間からバッファを引いた時間でタイムアウトを仕掛ける
    const timeoutMs = context.getRemainingTimeInMillis() - TIMEOUT_BUFFER_MSEC;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        const err = new Error("LAMBDA_TIMEOUT");
        err.isTimeout = true;
        reject(err);
      }, timeoutMs)
    );

    // Harnessの応答 vs 自前タイムアウトを競争させる
    const reply = await Promise.race([fetchReply(command), timeoutPromise]);

    return respond(200, { reply });

  } catch (error) {
    if (error.isTimeout) {
      console.warn("Self-timeout fired before Lambda hard limit.");
      return respond(504, {
        error: "AIの応答に時間がかかりすぎてタイムアウトしました。しばらくしてから再度お試しください。",
      });
    }

    console.error("InvokeHarness failed:", error);
    return respond(500, {
      error: "AIの応答取得に失敗しました。時間をおいて再度お試しください。",
    });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
