// this is the happpy flow test case

import { acceptJobOffer, listApplications, login } from "../actions";
import { applicants } from "../users";
import { config } from "dotenv";
config();

describe("Happy Flow: Applicants can accept an offer", () => {
  test("applicant can accept an offer", async () => {
    const PATH = "test/integration/offer-signed.pdf";
    const { username, password, email } = applicants[0];
    const token = await login(username, password);
    expect(token).toContain("eyJ");

    const applications = await listApplications(
      "ApplicationsByApplicant",
      "ApplicantEmail",
      "",
      token
    );

    if (!applications.length) {
      console.log("the apllicant has no offers");
      return;
    }
    expect(applications.length).toBeGreaterThan(0);

    expect(await acceptJobOffer(applications[0], PATH, token)).toBe(200);
  });
});
