import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from "dotenv";

config();
const client = new CognitoIdentityProviderClient();
const endpoint = process.env.API_ENDPOINT;

export async function create_admin(): Promise<{
  status: number;
  username: string;
}> {
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

  const res = await client.send(command);
  if (res.$metadata.httpStatusCode === 200) {
    console.log("Test admin created successfully");
    return {
      status: res.$metadata.httpStatusCode,
      username: res.User?.Username || "",
    };
  }
  return {
    status: 0,
    username: "",
  };
}
export async function initial_login(): Promise<boolean> {
  const res = await fetch(endpoint + "auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "test-admin",
      password: process.env.PASSWORD,
    }),
  });

  const data = await res.json();

  if (res.status !== 200) {
    console.log("Test admin login failed");
    console.log(data);
    return false;
  }
  const resChallenge = await fetch(endpoint + "auth/challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      challengeName: data.ChallengeName,
      username: "test-admin",
      newPassword: process.env.NEW_PASSWORD,
      session: data.Session,
    }),
  });

  if (resChallenge.status === 200) {
    console.log("Test admin password reset successfully");
    return true;
  } else {
    console.log("Test admin password reset failed");
    console.log(await resChallenge.json());
    return false;
  }
}

export async function login(): Promise<string> {
  const res = await fetch(endpoint + "auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "test-admin",
      password: process.env.NEW_PASSWORD,
    }),
  });
  const data = await res.json();
  if (res.status === 200) {
    console.log("Test admin logged in successfully");
    return data.AuthenticationResult.IdToken as string;
  } else {
    console.log("Test admin login failed");
    console.log(await res.json());
    return "";
  }
}

export async function create_hiringmanager(token: string) {
  const resHiringManager = await fetch(endpoint + "admin/hiring-manager", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      username: "test-hiring-manager",
      department: "Engineering",
      email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
      password: process.env.PASSWORD,
    }),
  });
  const dataHiringManager = await resHiringManager.json();
  if (resHiringManager.status === 200) {
    console.log("Test hiring-manager created successfully");
    return 200;
  } else {
    console.log("Test hiring-manager creation failed");
    console.log(dataHiringManager);
    return 400;
  }
}

export async function create_interviewer(token: string) {
  const resInterviewer = await fetch(endpoint + "admin/interviewer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      username: "test-interviewer",
      department: "Marketing",
      email: process.env.EMAIL?.replace("@", "+interviewer@"),
      password: process.env.PASSWORD,
    }),
  });
  const dataInterviewer = await resInterviewer.json();
  if (resInterviewer.status === 200) {
    return 200;
  } else {
    console.log("Test interviewer creation failed");
    console.log(dataInterviewer);
    return 400;
  }
}
