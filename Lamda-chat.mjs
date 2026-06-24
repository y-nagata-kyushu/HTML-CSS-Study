// Lambda関数名: helpdesk-chat（新規作成）
// ランタイム: Node.js 20.x
// 環境変数:
//   BEDROCK_MODEL  使用するモデルID（例: anthropic.claude-3-haiku-20240307-v1:0）
// IAM権限:
//   bedrock:InvokeModel （helpdesk-create-inquiryと同じポリシーをアタッチ）
// タイムアウト: 30秒と長めに設定すること

import {BedrockRuntimeClient, ConverseCommand} from "@aws-sdk/client-bedrock-runtime"
const bedrockClient = new BedrockRuntimeClient({ region: "ap-northeast-1" });
const BEDROCK_MODEL = process.env.BEDROCK_MODEL;

const SYSTEM_PROMPT = `
あなたは世界各地の魚や魚料理、郷土料理について博学な専門家です。
ユーザーからの質問に対して、おすすめの魚料理や魚の食べ方、味付けの仕方などを回答してください。

## 回答の形式
- 丁寧語を主とした日本語で回答する
- 出力は質問に対する直接の質問のみで構成する。追加の質問や提案はしない。
- maxTokensは512以下とする
## 回答の方針
- 日本人の食文化に近い料理から優先的に回答する
- 200〜300字程度を目安に、わかりやすく回答する
- 回答に必要な知識が不足している場合は、Web検索を実行する
## 回答の制限
- 魚料理に関連しない質問に対しては「専門外ですね...すみませんが回答できません」と回答する
`.trim();

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { message } = body;

    if (!message || !message.trim()) {
      return respond(400, { error: "message は必須です" });
    }

    const res = await bedrockClient.send(new ConverseCommand({
      modelId: BEDROCK_MODEL,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{ role: "user", content: [{ text: message.trim() }] }],
      inferenceConfig: { maxTokens: 512, temperature: 0.3 }
    }));

    const reply = res.output.message.content[0].text;
    return respond(200, { reply });

  } catch (err) {
    console.error(err);
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