import {
	AdminCreateUserCommand,
	CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

import { config } from "dotenv";

config();
const client = new CognitoIdentityProviderClient();

test("admin can be created",async ()=>{
    const command = new AdminCreateUserCommand({
		UserPoolId: process.env.USER_POOL_ID,
		Username: "test-admin",
		DesiredDeliveryMediums: ["EMAIL"],
		MessageAction: "SUPPRESS",
		TemporaryPassword: process.env.PASSWORD,
		UserAttributes: [
			{
				Name: "email",
				Value: process.env.EMAIL,
			},
			{
				Name: "email_verified",
				Value: "true",
			},
			{
				Name: "custom:role",
				Value: "admin",
			},
		],
	});

	const res1 = await client.send(command);
	if (res1.$metadata.httpStatusCode === 200) {
		console.log("Test admin created successfully");
		expect({
			status: res1.$metadata.httpStatusCode,
			username: res1.User?.Username,
		}).toStrictEqual({ status: 200, username: "test-admin" });
	}
})