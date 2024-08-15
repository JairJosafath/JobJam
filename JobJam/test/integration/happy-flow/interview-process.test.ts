// this is the happpy flow test case

import {
  extendJobOffer,
  listApplications,
  listInterviews,
  login,
  provideFeedback,
} from "../actions";
import { hiringManagers, interviewers } from "../users";
import { config } from "dotenv";
config();

describe("Happy Flow: Interviewers can make decisions and hiring managers can extend offers ", () => {
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
      expect(
        await provideFeedback(
          application,
          "This applicant shows a lot of potential",
          token
        )
      ).toBe(200);
    });
  });

  test("hiring manager can extend offers ", async () => {
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
      expect(await extendJobOffer(application, PATH, token)).toBe(200);
    });
  });
});
