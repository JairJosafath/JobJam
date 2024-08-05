import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

export async function handler(event) {
	const jwtVerifier = new CognitoJwtVerifier({
		userPoolId,
		clientId,
		tokenUse: "id",
	});

	const token = event.headers.Authorization;
	const methodArn = event.methodArn;
	const resource = event.resource;
	const method = event.httpMethod;

	try {
		const claims = await jwtVerifier.verify(token);
		const role = claims["custom:role"];
		const emailVerified = claims.email_verified;
		const principalId = claims.sub;

		if (!emailVerified) {
			return {
				statusCode: 401,
				body: JSON.stringify({ message: "Email not verified" }),
			};
		}
		if (
			(resource === "/interviewer" || resource === "/hiring-manager") &&
			method === "POST" &&
			role !== "admin"
		) {
			return {
				statusCode: 401,
				body: JSON.stringify({ message: "Unauthorized" }),
			};
		}
		if (role === "admin") {
			console.log("Admin access granted");
			return {
				principalId: principalId,
				policyDocument: {
					Version: "2012-10-17",
					Statement: [
						{
							Action: "execute-api:Invoke",
							Effect: "Allow",
							Resource: methodArn,
						},
					],
				},
			};
		}

		return {
			statusCode: 401,
			body: JSON.stringify({ message: "Unauthorized" }),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 401,
			body: JSON.stringify({ message: "Unauthorized" }),
		};
	}
}
