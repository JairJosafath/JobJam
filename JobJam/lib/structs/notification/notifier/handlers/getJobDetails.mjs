import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();

export async function getJobDetails(pk) {
  const params = {
    TableName: process.env.TABLENAME,
    Key: {
      pk: { S: pk },
      sk: { S: "Info" },
    },
  };
  const command = new GetItemCommand(params);
  const response = await client.send(command);
  console.log("Fetched job details:", JSON.stringify(response.Item));
  return response.Item;
}
