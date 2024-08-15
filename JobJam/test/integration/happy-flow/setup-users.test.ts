// this is the happpy flow test case

import {
  adminCreateUser,
  createAdmin,

  // extendJobOffer,
  login,
  resetPassword,
  signup,
} from "../actions";
import { admin, applicants, hiringManagers, interviewers } from "../users";
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

    const interviewer = interviewers[0];
    expect(
      await adminCreateUser(
        interviewer.email,
        interviewer.username,
        interviewer.password,
        "interviewer",
        token
      )
    ).toBe(200);

    const hiringManager = hiringManagers[0];
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
