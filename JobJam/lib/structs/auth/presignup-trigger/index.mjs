import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();
const TableName = process.env.DYNAMODB_TABLE_NAME;

export async function handler(event) {
	if (event.triggerSource === "PreSignUp_AdminCreateUser") {
		event.response.autoConfirmUser = true;
		event.response.autoVerifyEmail = true;
		event.response.autoVerifyPhone = true;
		const role = event.request.userAttributes["custom:role"];

		if (role !== "hiring-manager" || role !== "interviewer") {
			throw new Error(
				"only hiring-manager or interviewer can be created by admin"
			);
		} else if (role === "hiring-manager" || role === "interviewer") {
			const params = {
				TableName,
				Item: {
					pk: {
						S: `${
							role === "hiring-manager" ? "HiringManager" : "Interviewer"
						}#${event.request.userAttributes.sub}`,
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
		}
		const res = await client.send(new PutItemCommand(params));

		console.log(res);
	}

	return event;
}
