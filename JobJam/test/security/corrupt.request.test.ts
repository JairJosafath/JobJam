import { UserPool } from "aws-cdk-lib/aws-cognito";
import { User } from "aws-cdk-lib/aws-iam";
import { JwtPayload } from "aws-jwt-verify/jwt-model";
import { config } from "dotenv";
import { decode, sign } from "jsonwebtoken";

config();

const endpoint = process.env.MOCK_ENDPOINT_URL;
const secret = "secret";

test("send a request with a corrupt idtoken", async () => {
	// interviewer login via api
	const res = await fetch(endpoint + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-interviewer",
			password: process.env.NEW_TEST_INTERVIEWER_PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test interviewer logged in successfully");
		expect(res.status).toBe(200);
	} else {
		console.log("Test interviewer login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}

	// now that I am logged in as an interviewer, I will change my idtoken and change my role to an admin
	const idtoken = data.AuthenticationResult.IdToken;

	// Decode the token
	const decodedToken = decode(idtoken, { complete: true });

	// Modify the token payload
	(decodedToken?.payload as JwtPayload)["custom:role"] = "admin";

	// Re-encode the token
	if (!decodedToken) throw new Error("decodedToken is null");

	const modifiedToken = sign(decodedToken.payload, secret, {
		algorithm: "HS256",
	});

	// now I am going to make an admin request to make a new hiring manager
	const resAdmin = await fetch(endpoint + "/hiring-manager", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: modifiedToken,
		},
		body: JSON.stringify({
			username: "corrupt-test-hiring-manager",
			password: "123!@#QWEASDDZDZDZDZD-dummypassword",
			email: "fake@email.com",
		}),
	});

	const dataAdmin = await resAdmin.json();
	console.log(resAdmin.status);

	if (resAdmin.status === 200) {
		console.log("Corrupt request with modified idtoken successful");
		expect(resAdmin.status).not.toBe(200);
	} else {
		console.log("Corrupt request with modified idtoken failed");
		console.log(dataAdmin);
		expect(resAdmin.status).not.toBe(200);
	}

	// I will send my own body based on aws service integration API
	const resAdmin2 = await fetch(endpoint + "/hiring-manager", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: modifiedToken,
		},
		body: JSON.stringify({
			TemporaryPassword: "123!@#QWEASDDZDZDZDZD-dummypassword",
			Username: "corrupt-test-hiring-manager",
			UserPoolId: "random one or scenario where it is leaked",
			UserAttributes: [
				{
					Name: "custom:role",
					Value: "admin",
				},
				{
					Name: "custom:access",
					Value: "Jeff Bezos level access, which is a joke of course",
				},
			],
		}),
	});

	const dataAdmin2 = await resAdmin2.json();
	console.log(resAdmin2.status);

	if (resAdmin2.status === 200) {
		console.log("Corrupt  with corrupt body successful");
		expect(resAdmin2.status).not.toBe(200);
	} else {
		console.log("Corrupt request with corrupt body failed");
		console.log(dataAdmin2);
		expect(resAdmin2.status).not.toBe(200);
	}
});
