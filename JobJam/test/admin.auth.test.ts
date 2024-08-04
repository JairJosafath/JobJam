import { config } from "dotenv";
import {
	AdminCreateUserCommand,
	AdminDeleteUserCommand,
	CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
config();

const client = new CognitoIdentityProviderClient({});
const endpoint = process.env.MOCK_ENDPOINT_URL;
const DELETE_USERS = false;
const CREATE_USERS = false;

if (CREATE_USERS) {
	test("create admin user", async () => {
		// create test-admin user
		const command = new AdminCreateUserCommand({
			UserPoolId: process.env.USER_POOL_ID,
			Username: "test-admin",
			DesiredDeliveryMediums: ["EMAIL"],
			MessageAction: "SUPPRESS",
			TemporaryPassword: process.env.TEST_ADMIN_PASSWORD,
			UserAttributes: [
				{
					Name: "email",
					Value: process.env.TEST_ADMIN_EMAIL,
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

		const res = await client.send(command);
		if (res.$metadata.httpStatusCode === 200) {
			console.log("Test admin created successfully");
			expect({
				status: res.$metadata.httpStatusCode,
				username: res.User?.Username,
			}).toStrictEqual({ status: 200, username: "test-admin" });
		}
	});
}

test("admin first time login", async () => {
	// post to login resource with username and password
	const res = await fetch(endpoint + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-admin",
			password: process.env.TEST_ADMIN_PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test admin logged in successfully");
	}

	// post to challenge resource with challenge name, session, and new password
	const resChallenge = await fetch(endpoint + "/challenge", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			challengeName: data.ChallengeName,
			username: "test-admin",
			newPassword: process.env.NEW_TEST_ADMIN_PASSWORD,
			session: data.Session,
		}),
	});

	if (resChallenge.status === 200) {
		console.log("Test admin password reset successfully");
		const dataChallenge = await resChallenge.json();

		expect(dataChallenge.AuthenticationResult.AccessToken).toBeDefined();
		expect({
			username: data.ChallengeParameters.USER_ID_FOR_SRP,
			challengeName: data.ChallengeName,
		}).toStrictEqual({
			username: "test-admin",
			challengeName: "NEW_PASSWORD_REQUIRED",
		});
	} else {
		console.log("Test admin password reset failed");
		// reason of failure
		console.log(await resChallenge.json());
		expect(resChallenge.status).toBe(200);
	}
});

if (DELETE_USERS) {
	test("delete admin user", async () => {
		// delete test-admin user
		const command = new AdminDeleteUserCommand({
			UserPoolId: process.env.USER_POOL_ID,
			Username: "test-admin",
		});
		const resDelete = await client.send(command);
		if (resDelete.$metadata.httpStatusCode === 200) {
			console.log("Test admin deleted successfully");
			expect(resDelete.$metadata.httpStatusCode).toBe(200);
		}
	});
}
