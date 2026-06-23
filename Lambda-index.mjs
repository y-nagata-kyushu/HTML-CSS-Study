import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, DynamoDBDocumentClient,
  PutCommand, } from '@aws-sdk/lib-dynamodb';
// uuid生成のための準備
import crypto from 'node:crypto'

// DynamoDBへの接続クライアントの作成
const client = new DynamoDBClient({});
// よしなにしてくれるドキュメントクライアントへの変換
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */

// 外部から呼び出すことができるようにハンドラを作成
export const handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    
    try {
        const body = JSON.parse(event.body || "{}");
        const { name, email, subject, message } = body;
        
        if (!name || !email || !subject || !message) {
            return respond(400, { error: "リクエストが不正です" });
          }

        const item = {
            id: crypto.randomUUID(),
            name,
            email,
            subject,
            message,
            createdAt: new Date().toISOString(),
          };

        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item,
          }));

        return respond(201, { message: "作成に成功しました" });

    } catch (error) {
        console.error(error);
        return respond(500, { error: "サーバーエラーが発生しました" });
    }    
};

function respond(statusCode, body) {
    return {
      statusCode: statusCode,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
  }
