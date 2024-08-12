import { config } from "dotenv";

config();
const endpoint = process.env.API_ENDPOINT;

export async function login(): Promise<string> {
  const resLogin = await fetch(`${endpoint}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      username: "test-applicant",
      password: process.env.PASSWORD,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await resLogin.json();

  if (resLogin.status === 200) {
    console.log("Test applicant logged in successfully");
    return data.AuthenticationResult.IdToken as string;
  } else {
    console.log("Test applicant login failed");
    console.log(data);
    return "";
  }
}

export async function query_applications(token: string): Promise<any[]> {
  const res = await fetch(`${endpoint}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 200) {
    console.log("Test applicant queried applications successfully");
    return await res.json();
  } else {
    console.log("Test applicant query applications failed");
    console.log(await res.json());
    return [];
  }
}

export async function apply_for_job(token: string, job: any): Promise<boolean> {
  const res = await fetch(`${endpoint}/applications`, {
    method: "POST",
    body: JSON.stringify({
      jobId: job.JobId.S,
      department: job.Department.S,
      resume: "https://resume.com",
      coverLetter: "I am a great applicant",
      contact: {
        email: "my-email",
        phone: "1234567890",
      },
    }),
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 200) {
    console.log("Test applicant applied for job successfully");
    return true;
  } else {
    console.log("Test applicant apply for job failed");
    console.log(await res.json());
    return false;
  }
}

export async function query_jobs(token: string): Promise<any[]> {
  const res = await fetch(
    `${endpoint}/jobs?index=JobsByDepartment&key=Department&value=Marketing`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  if (res.status === 200) {
    console.log("Test applicant queried jobs successfully");
    const jobs = await res.json();
    return jobs.Items;
  } else {
    console.log("Test applicant query jobs failed");
    console.log(await res.json());
    return [];
  }
}
