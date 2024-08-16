// this is the happpy flow test case

import { adminCreateUser, login, resetPassword, signup } from "../actions";
import { admin, applicants, hiringManagers, interviewers } from "../users";

describe("Happy Flow: Users setup", () => {
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

  test("users can sign up", async () => {
    const applicant = applicants[0];
    expect(
      await signup(applicant.email, applicant.username, applicant.password)
    ).toBe(200);
  });
});
