import { config } from "dotenv";
import {
	AdminCreateUserCommand,
	AdminDeleteUserCommand,
	CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import exp = require("constants");
config();

const client = new CognitoIdentityProviderClient({});
const endpoint = process.env.MOCK_ENDPOINT_URL;
const DELETE_USERS = false;
const CREATE_USERS = true;

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

test("create interviewer", async () => {
	// admin login via api
	const res = await fetch(endpoint + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-admin",
			password: process.env.NEW_TEST_ADMIN_PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test admin logged in successfully");
		expect(data.AuthenticationResult.AccessToken).toBeDefined();
		expect(data.AuthenticationResult.IdToken).toBeDefined();
		expect(res.status).toBe(200); //redundant but okay
	} else {
		console.log("Test admin login failed");
		console.log(await res.json());
		expect(res.status).toBe(200);
	}
	// admin adds interviewer via api
	const resInterviewer = await fetch(endpoint + "/interviewer", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: data.AuthenticationResult.IdToken,
		},
		body: JSON.stringify({
			username: "test-interviewer",
			password: process.env.TEST_INTERVIEWER_PASSWORD,
			email: process.env.TEST_INTERVIEWER_EMAIL,
		}),
	});

	const dataInterviewer = await resInterviewer.json();

	if (resInterviewer.status === 200) {
		console.log("Test interviewer created successfully");
		expect(resInterviewer.status).toBe(200);
		expect({
			username: dataInterviewer.username,
			email: dataInterviewer.email,
		}).toStrictEqual({
			username: "test-interviewer",
			email: process.env.TEST_INTERVIEWER_EMAIL,
		});
	} else {
		console.log("Test interviewer creation failed");
		console.log(await resInterviewer.json());
		expect(resInterviewer.status).toBe(200);
	}
});

test("login interviewer", async () => {
	// interviewer login via api
	const res = await fetch(endpoint + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-interviewer",
			password: process.env.TEST_INTERVIEWER_PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test interviewer logged in successfully");
		expect(data.AuthenticationResult.AccessToken).toBeDefined();
		expect(data.AuthenticationResult.IdToken).toBeDefined();
		expect(res.status).toBe(200);
	} else {
		console.log("Test interviewer login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}

	// interviewer resets password via api
	const resChallenge = await fetch(endpoint + "/challenge", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			challengeName: data.ChallengeName,
			username: "test-interviewer",
			newPassword: process.env.NEW_TEST_INTERVIEWER_PASSWORD,
			session: data.Session,
		}),
	});

	if (resChallenge.status === 200) {
		console.log("Test interviewer password reset successfully");
		const dataChallenge = await resChallenge.json();

		expect(dataChallenge.AuthenticationResult.AccessToken).toBeDefined();
		expect({
			username: dataChallenge.ChallengeParameters.USER_ID_FOR_SRP,
			challengeName: dataChallenge.ChallengeName,
		}).toStrictEqual({
			username: "test-interviewer",
			challengeName: "NEW_PASSWORD_REQUIRED",
		});
	} else {
		console.log("Test interviewer password reset failed");
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

	test("delete interviewer user", async () => {
		// delete test-interviewer user
		const command = new AdminDeleteUserCommand({
			UserPoolId: process.env.USER_POOL_ID,
			Username: "test-interviewer",
		});
		const resDelete = await client.send(command);
		if (resDelete.$metadata.httpStatusCode === 200) {
			console.log("Test interviewer deleted successfully");
			expect(resDelete.$metadata.httpStatusCode).toBe(200);
		}
	});
}
