import { adminCreateUser, login } from "../actions";
import { admin, hiringManagers, interviewers } from "../users";
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
