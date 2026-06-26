import {
  BedrockAgentCoreClient,
  InvokeHarnessCommand,
} from "@aws-sdk/client-bedrock-agentcore";

const client = new BedrockAgentCoreClient({
  region: "us-east-1",
});

const HARNESS_ARN = process.env.HARNESS_ARN;

export const handler = async (event) => {
  try {
    const body =JSON.parse(event.body || "{}");
    const { message } = body;

    if (!message || !message.trim()) {
      return respond(400, { error: "message は必須です" });
    }

    const sessionId =
      body.sessionId || crypto.randomUUID();

    const command = new InvokeHarnessCommand({
      harnessArn: HARNESS_ARN,
      runtimeSessionId: sessionId,
      messages: [
        {
          role: "user",
          content: [
            {
              text: message.trim(),
            },
          ],
        },
      ],
    });

    const res = await client.send(command);

    let reply = "";

    if (res.stream) {
      for await (const streamEvent of res.stream) {
        const delta =
          streamEvent.contentBlockDelta?.delta?.text;

        if (delta) {
          reply += delta;
        }
      }
    }
    
    return respond(200,{reply});
    
  } catch (error) {
    console.error("InvokeHarness failed:", error);
    return respond(500, { error: "AIの応答取得に失敗しました。時間をおいて再度お試しください。" });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}