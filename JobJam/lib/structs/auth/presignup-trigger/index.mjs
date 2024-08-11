import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();
const TableName = process.env.DYNAMODB_TABLE_NAME;
const ENV = process.env.ENV || "";
const TEST_EMAIL = process.env.TEST_EMAIL || "";
console.log({ENV, TEST_EMAIL});

export async function handler(event) {
  if (event.triggerSource === "PreSignUp_AdminCreateUser") {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    event.response.autoVerifyPhone = true;
    const role = event.request.userAttributes["custom:role"];

    console.log(JSON.stringify(event));

    if (role === "admin") {
      const params = {
        TableName,
        Item: {
          pk: {
            S: `Admin#${event.request.userAttributes.email}`,
          },
          sk: {
            S: "Info",
          },
          Email: {
            S: event.request.userAttributes.email,
          },
          Role: {
            S: role,
          },
        },
      };
      const res = await client.send(new PutItemCommand(params));

      console.log(res);

      return event;
    }

    if (role === "hiring-manager" || role === "interviewer") {
      const params = {
        TableName,
        Item: {
          pk: {
            S: `${
              role === "hiring-manager" ? "HiringManager" : "Interviewer"
            }#${event.request.userAttributes.email}`,
          },
          sk: {
            S: "Info",
          },
          Email: {
            S: event.request.userAttributes.email,
          },
          Department: {
            S: event.request.userAttributes["custom:department"],
          },
          Role: {
            S: role,
          },
        },
      };
      const res = await client.send(new PutItemCommand(params));

      console.log(res);
    } else
      throw new Error(
        "only hiring-manager or interviewer can be created by admin"
      );
  }
  // auto confirm test users
  else if (event.triggerSource === "PreSignUp_SignUp") {
    if (ENV === "dev" && event.request.userAttributes.email.includes(TEST_EMAIL.split("+")[0])) {
      event.response.autoConfirmUser = true;
      event.response.autoVerifyEmail = true;
    }
  }
  return event;
}
