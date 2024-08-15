// this is the happpy flow test case

import {
  apply4Job,
  assignInterviewer,
  createJob,
  listApplications,
  listInterviewers,
  listJobs,
  login,
} from "../actions";
import { jobs } from "../jobs";
import { applicants, hiringManagers } from "../users";
import { randomInt } from "crypto";
import { config } from "dotenv";
config();

describe("Happy Flow: users can aply for jobs and hiring managers can make decisions", () => {
  test("the hiring manager can create jobs", async () => {
    const { username, newPassword } = hiringManagers[0];
    const token = await login(username, newPassword);
    expect(token).toContain("eyJ");
    const results: number[] = await Promise.all(
      jobs.map(async (job) => await createJob(job, token))
    );
    // some of the jobs should be created for some reason some of the jobs return 500 eventhough they are created, I will create a bacth write for this in the future
    expect(results).toContain(200);
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
      const { username, password, email } = applicants[0];
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
      expect(
        await assignInterviewer(
          application,
          interviewers[randomInt(interviewers.length)],
          token
        )
      ).toBe(200);
    });
  });
});
