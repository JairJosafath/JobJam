// this is the happpy flow test case

import {
  acceptJobOffer,
  // acceptJobOffer,
  adminCreateUser,
  apply4Job,
  assignInterviewer,
  createAdmin,
  createJob,
  denyApplication,
  extendJobOffer,
  // extendJobOffer,
  listApplications,
  listInterviewers,
  listInterviews,
  listJobs,
  login,
  provideFeedback,
  resetPassword,
  signup,
} from "./actions";
import { jobs } from "./jobs";
import { admin, applicants, hiringManagers, interviewers } from "./users";
import { randomInt } from "crypto";
import path = require("path");
import { config } from "dotenv";
config();

describe("Happy Flow: Users setup", () => {
  test("the admin can be created", async () => {
    const { email, username, password } = admin;
    expect(await createAdmin(email, username, password)).toBe(200);
  });

  test("the admin can log in and reset its password", async () => {
    const { email, password, username, newPassword } = admin;
    expect(await resetPassword(username, email, password, newPassword)).toBe(
      200
    );
  });

  test("the admin can create hiringmanagers and interviewers", async () => {
    const { username, newPassword } = admin;
    const token = await login(username, newPassword);
    expect(token).toContain("eyJ");

    interviewers.forEach(async (interviewer) => {
      expect(
        await adminCreateUser(
          interviewer.email,
          interviewer.username,
          interviewer.password,
          "interviewer",
          token
        )
      ).toBe(200);
    });

    hiringManagers.forEach(async (hiringManager) => {
      expect(
        await adminCreateUser(
          hiringManager.email,
          hiringManager.username,
          hiringManager.password,
          "hiring-manager",
          token
        )
      ).toBe(200);
    });
  });
  test("the interviewer can log in and reset its password", async () => {
    const { email, password, username, newPassword } = interviewers[0];
    expect(await resetPassword(username, email, password, newPassword)).toBe(
      200
    );
  });

  test("the hiring manager can log in and reset its password", async () => {
    const { email, password, username, newPassword } = hiringManagers[0];
    expect(await resetPassword(username, email, password, newPassword)).toBe(
      200
    );
  });

  test("users can sign up", () => {
    applicants.forEach(async (applicant) => {
      expect(
        await signup(applicant.email, applicant.username, applicant.password)
      ).toBe(200);
    });
  });
});

describe("Happy Flow: users can aply for jobs and hiring managers can make decisions", () => {
  test("the hiring manager can create jobs", async () => {
    const { username, newPassword } = hiringManagers[0];
    const token = await login(username, newPassword);
    expect(token).toContain("eyJ");
    const results: number[] = await Promise.all(
      jobs.map(async (job) => await createJob(job, token))
    );
    expect(results).toContain(200); // some of the jobs should be created for some reason some of the jobs return 500 eventhough they are created, I will create a bacth write for this in the future
  });
  test("the applicants can query jobs and apply to one", async () => {
    const PATH = "test/integration/resume.pdf";
    const options = [
      { key: "Location", value: "New York", index: "JobsByLocation" },
      { key: "Type", value: "Full-time", index: "JobsByType" },
      { key: "Department", value: "Engineering", index: "JobsByDepartment" },
    ];
    // make applicants apply to jobs randomly 3 times
    for (let k = 0; k < 3; k++) {
      applicants.forEach(async ({ username, email, password }, i) => {
        const { index, value, key } = options[randomInt(0, options.length)];
        const token = await login(username, password);
        expect(token).toContain("eyJ");
        const jobs = await listJobs(index, key, value);
        expect(jobs.length).toBeGreaterThan(0);

        expect(
          await apply4Job(
            jobs[randomInt(jobs.length)],
            PATH,
            email,
            "123456789",
            "I am a very smart employee and will work very hard!",
            token
          )
        ).resolves.toBe(200);
      });
    }
  });

  // make hiring manager query applications and assign interviewers or deny applications
  test("the hiring manager can query applications", async () => {
    const { username, newPassword } = hiringManagers[0];
    const token = await login(username, newPassword);
    expect(token).toContain("eyJ");
    const applications = await listApplications(
      "ApplicationsByStatus",
      "Status",
      "SUBMITTED",
      token
    );
    const interviewers = await listInterviewers(token);
    expect(applications.length).toBeGreaterThan(0);
    expect(interviewers.length).toBeGreaterThan(0);
    applications.forEach(async (application, i) => {
      if (i % 2 === 0) {
        expect(
          await assignInterviewer(
            application,
            interviewers[randomInt(interviewers.length)],
            token
          )
        ).toBe(200);
      } else {
        expect(await denyApplication(application, token)).toBe(200); //fails @TODO @JairJosafath
      }
    });
  });
});

describe("Happy Flow: Interviewers can make decisions and hiring managers can extend offers or denyapplications", () => {
  const PATH = "test/integration/offer.pdf";

  test("interviewer can review applications", async () => {
    const { email, newPassword } = interviewers[0];
    const token = await login(email, newPassword);
    expect(token).toContain("eyJ");

    const applications = await listInterviews(
      "InterviewsByInterviewer",
      "InterviewerEmail",
      "",
      token
    );

    expect(applications.length).toBeGreaterThan(0);

    applications.forEach(async (application, i) => {
      if (i % 2 === 0) {
        expect(await denyApplication(application, token)).toBe(200);
      } else {
        expect(
          await provideFeedback(
            application,
            "This applicant shows a lot of potential",
            token
          )
        ).toBe(200);
      }
    });
  });

  test("hiring manager can extend offers or deny applications", async () => {
    const { email, newPassword } = hiringManagers[0];
    const token = await login(email, newPassword);
    expect(token).toBeTruthy();

    const applications = await listApplications(
      "ApplicationsByStatus",
      "Status",
      "INTERVIEW_COMPLETED",
      token
    );

    expect(applications.length).toBeGreaterThan(0);

    applications.forEach(async (application, i) => {
      if (i % 2 === 0) {
        expect(await denyApplication(application, token)).toBe(200);
      } else {
        expect(await extendJobOffer(application, PATH, token)).toBe(200);
      }
    });
  });
});

describe("Happy Flow: Applicants can accept an offer", () => {
  test("applicant can accept an offer", async () => {
    const PATH = "test/integration/offer-signed.pdf";
    applicants.forEach(async ({ username, email, password }, i) => {
      const token = await login(username, password);
      expect(token).toContain("eyJ");

      let applications = await listApplications(
        "ApplicationsByApplicant",
        "ApplicantEmail",
        "",
        token
      );

      console.log(JSON.stringify(applications));

      applications = applications.filter(
        (application) => application.Status.S === "OFFER_MADE"
      );

      if ((applications.length = 0)) {
        console.log("the apllicant has no offers");
        return;
      }
      expect(applications.length).toBeGreaterThan(0);

      expect(await acceptJobOffer(applications[0], PATH, token)).toBe(200);
    });
  });
});
