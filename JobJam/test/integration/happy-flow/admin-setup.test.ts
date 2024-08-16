import {
  adminCreateUser,
  createAdmin,

  // extendJobOffer,
  login,
  resetPassword,
} from "../actions";
import { admin, hiringManagers, interviewers } from "../users";

test("the admin can be created", async () => {
  const { email, username, password } = admin;
  expect(await createAdmin(email, username, password)).toBe(200);
});

test("the admin can log in and reset its password", async () => {
  const { email, password, username, newPassword } = admin;
  expect(await resetPassword(username, email, password, newPassword)).toBe(200);
});
