// custom lambda request authorizer

export default async function handler(event) {
	const token = event.authorizationToken;
	const methodArn = event.methodArn;
	const method = event.httpMethod;
	const role = event.requestContext.authorizer.claims["custom:role"];
	const userId = event.requestContext.authorizer.claims["sub"];
	const email = event.requestContext.authorizer.claims["email"];
	const confirmed = event.requestContext.authorizer.claims["email_verified"];

	console.log({ token, methodArn, method, role, userId, email });

	if (!token || !confirmed) {
		return {
			statusCode: 401,
			body: JSON.stringify({ message: "Unauthorized" }),
		};
	} else if (role === "admin") {
		return generatePolicy(userId, "Allow", methodArn);
	} else if (role === "interviewer") {
		return generatePolicy(userId, "Allow", methodArn);

		return {
			statusCode: 403,
			body: JSON.stringify({ message: "Forbidden" }),
		};
	}
}

function generatePolicy(principalId, effect, resource) {
	const authResponse = {};
	authResponse.principalId = principalId;
	if (effect && resource) {
		const policyDocument = {};
		policyDocument.Version = "2012-10-17";
		policyDocument.Statement = [];
		const statementOne = {};
		statementOne.Action = "execute-api:Invoke";
		statementOne.Effect = effect;
		statementOne.Resource = resource;
		policyDocument.Statement[0] = statementOne;
		authResponse.policyDocument = policyDocument;
	}
	return authResponse;
}
