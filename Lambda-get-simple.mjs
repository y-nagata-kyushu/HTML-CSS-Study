// console.log('Loading function');

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    return respond(201,{message:"GETリクエストに成功しました。"}); 
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