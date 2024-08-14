import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
console.log({ userPoolId, clientId });
/**
 *
 * @description This authorizer function handles all the custom authorizations for the API Gateway
 */
export async function handler(event) {
  const jwtVerifier = new CognitoJwtVerifier({
    userPoolId,
    clientId,
    tokenUse: "id",
  });

  const token = event.headers.Authorization;
  const resource = event.resource;
  const httpMethod = event.httpMethod;

  try {
    const claims = await jwtVerifier.verify(token);
    const role = claims["custom:role"];
    const emailVerified = claims.email_verified;
    const principalId = claims.sub;

    console.log({
      claims,
      role,
      emailVerified,
      principalId,
      resource,
      httpMethod,
    });

    if (!emailVerified) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Email not verified" }),
      };
    }

    if (role === "admin") {
      console.log("Admin role");
      return allow(principalId, { claims: JSON.stringify(claims) });
    }

    if (
      [
        "/applications",
        "/applications/query",
        "/interviews/offer",
        "/interviews",
        "/interviews/feedback",
      ].includes(resource) &&
      ["admin", "interviewer", "hiring-manager"].includes(role)
    ) {
      console.log("Applications modifier role");
      return allow(principalId, { claims: JSON.stringify(claims) });
    }

    if (
      ["/applications/query"].includes(resource) &&
      role === "applicant" &&
      httpMethod === "GET"
    ) {
      console.log("Applications query role for applicant");
      return allow(principalId, { claims: JSON.stringify(claims) });
    }

    if (
      resource === "/jobs" &&
      httpMethod === "POST" &&
      role === "hiring-manager"
    ) {
      return allow(principalId, { claims: JSON.stringify(claims) });
    }
  } catch (error) {
    console.error(error);
  }
  return {
    statusCode: 401,
    body: JSON.stringify({ message: "Unauthorized" }),
  };
}

function allow(principalId, context) {
  console.log({
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: "*",
        },
      ],
    },
    context,
  });
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: "*",
        },
      ],
    },
    context,
  };
}
