// Lambda関数名の例: osakana-list-board
// ランタイム: Node.js 20.x
// 環境変数:
//   TABLE_NAME  DynamoDBのテーブル名（Lambda-index.mjsと同じテーブルを指定）
// IAM権限:
//   dynamodb:Scan
// タイムアウト: 10秒

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export const handler = async () => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: tableName }));

    // createdAtの降順（新しい投稿が先頭）に並び替え
    const items = (result.Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // emailは一覧ページに表示しない（プライバシー配慮）
    const publicItems = items.map(({ email, ...rest }) => rest);

    return respond(200, publicItems);
  } catch (err) {
    console.error(err);
    return respond(500, { error: "データの取得に失敗しました" });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
