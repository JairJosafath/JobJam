import { initial_login } from "./actions";

test("admin user can be created, admin can perform initial login and password reset", async () => {
  expect(await initial_login()).toBe(true);
});
