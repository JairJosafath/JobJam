import { config } from "dotenv";
import * as fs from "fs";
import { applicants } from "../../integration/users";

config();

const endpoint = process.env.API_ENDPOINT;

export async function login(): Promise<string> {
  const resLogin = await fetch(`${endpoint}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      username: applicants[0].username,
      password: applicants[0].password,
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
  const res = await fetch(
    `${endpoint}/applications?index=ApplicationsByApplicant&key=ApplicantEmail&value=`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  if (res.status === 200) {
    console.log("Test applicant queried applications successfully");
    const applications = await res.json();
    return applications.Items;
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
        email: process.env.EMAIL,
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

export async function accept_offer(
  application: any,
  token: string
): Promise<boolean> {
  const res = await fetch(`${endpoint}/offer`, {
    method: "PATCH",
    body: JSON.stringify({
      applicationId: application.sk.S,
      jobId: application.pk.S,
      status: "OFFER_ACCEPTED",
      offer: "https://offer.pdf",
    }),
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 200) {
    console.log("Test applicant accepted offer successfully");
    return true;
  } else {
    console.log("Test applicant accept offer failed");
    console.log(await res.json());
    return false;
  }
}

export async function upload_resume(token: string): Promise<boolean> {
  fs.readFile("test/integration/resume.pdf", async (err, data) => {
    if (err) {
      console.log("Error reading file ", err);
      return false;
    }
    const res = await fetch(`${endpoint}/files/testAppId/resume/res.pdf`, {
      method: "POST",
      body: data,
      headers: {
        Authorization: token,
        "Content-Type": "application/pdf",
      },
    });

    return res.status === 200;
  });
  return true;
}
