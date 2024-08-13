import { config } from "dotenv";

config();
const endpoint = process.env.API_ENDPOINT;

export async function initial_login(): Promise<boolean> {
  const res = await fetch(endpoint + "auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "test-interviewer",
      password: process.env.PASSWORD,
    }),
  });

  const data = await res.json();

  if (res.status === 200) {
    console.log("Test interviewer logged in successfully");
  } else {
    console.log("Test interviewer initial login failed");
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
      username: "test-interviewer",
      newPassword: process.env.NEW_PASSWORD,
      session: data.Session,
    }),
  });

  if (resChallenge.status === 200) {
    console.log("Test interviewer password reset successfully");
    return true;
  } else {
    console.log("Test interviewer password reset failed");
    console.log(await resChallenge.json());
    return false;
  }
}

export async function login(): Promise<string> {
  const resLogin = await fetch(`${endpoint}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      username: "test-interviewer",
      password: process.env.NEW_PASSWORD,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await resLogin.json();

  if (resLogin.status === 200) {
    console.log("Test interviewer logged in successfully");
    return data.AuthenticationResult.IdToken;
  } else {
    console.log("Test interviewer login failed");
    console.log(data);
    return "";
  }
}

export async function query_interviews(token: string): Promise<any[]> {
  const res = await fetch(
    endpoint + "interviews?index=InterviewsByInterviewer&key=InterviewerEmail",
    {
      headers: {
        Authorization: token,
      },
      method: "GET",
    }
  );

  if (res.status === 200) {
    console.log("Test interviewer queried interviews successfully");
    const interviews = await res.json();
    console.log(interviews.Items);
    return interviews.Items;
  } else {
    console.log("Test interviewer query interviews failed");
    console.log(await res.json());
    return [];
  }
}

export async function schedule_interview(
  application: any,
  token: string
): Promise<boolean> {
  const res = await fetch(endpoint + "interviews/", {
    method: "PATCH",
    body: JSON.stringify({
      jobId: application.pk.S,
      applicationId: application.sk.S,
      time: "2028-09-30T10:00:00Z",
      location: "Online",
      date: "2027-09-30",
    }),
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 200) {
    console.log("Test interviewer scheduled interview successfully");
    return true;
  } else {
    console.log("Test interviewer schedule interview failed");
    console.log(await res.json());
    return false;
  }
}
