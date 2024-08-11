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
      username: "test-hiring-manager",
      password: process.env.PASSWORD,
    }),
  });

  const data = await res.json();

  if (res.status === 200) {
    console.log("Test hiring-manager logged in successfully");
  } else {
    console.log("Test hiring-manager initial login failed");
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
      username: "test-hiring-manager",
      newPassword: process.env.NEW_PASSWORD,
      session: data.Session,
    }),
  });

  if (resChallenge.status === 200) {
    console.log("Test hiring-manager password reset successfully");
    return true;
  } else {
    console.log("Test hiring-manager password reset failed");
    console.log(await resChallenge.json());
    return false;
  }
}

export async function login(): Promise<string> {
  const resLogin = await fetch(`${endpoint}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      username: "test-hiring-manager",
      password: process.env.NEW_PASSWORD,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const dataLogin = await resLogin.json();

  if (resLogin.status !== 200) {
    console.error(dataLogin);
  }

  return dataLogin.AuthenticationResult.IdToken;
}

export async function create_job(jobs: any[], token: string): Promise<boolean> {
  for (const job of jobs) {
    const response = await fetch(endpoint + "/jobs", {
      method: "POST",
      body: JSON.stringify(job),
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await response.json();
    console.log(data);
  }

  return true;
}

export async function query_interviewers(
  department: string,
  token: string
): Promise<any[]> {
  const resQueryInterviewers = await fetch(
    `${endpoint}/interviewers?department=${department}`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }
  );

  const dataQueryInterviewers = await resQueryInterviewers.json();

  console.log(dataQueryInterviewers);
  const interviewers = dataQueryInterviewers.Items;

  return interviewers;
}

export async function query_applications(token: string): Promise<any[]> {
  const resGetApplications = await fetch(
    `${endpoint}/applications/query?index
		=ApplicationsByDepartment&value=Marketing&key=Department
		`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }
  );

  const dataGetApplications = await resGetApplications.json();

  console.log(dataGetApplications);
  const applications = dataGetApplications.Items;
  return applications;
}

export async function assign_interviewer(
  application: any,
  interviewer: any,
  token: string
): Promise<boolean> {
  const resAssignInterviewer = await fetch(`${endpoint}/interviews`, {
    method: "POST",
    body: JSON.stringify({
      applicationId: application.ApplicationId.S,
      interviewerId: interviewer.InterviewerId.S,
      interviewerEmail: interviewer.Email.S,
    }),
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  const dataAssignInterviewer = await resAssignInterviewer.json();
  console.log(dataAssignInterviewer);

  return true;
}
