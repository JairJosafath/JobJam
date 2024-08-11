import { create_hiringmanager, login } from "./actions";

test("admin can create a hiring manager", async () => {
  expect(await create_hiringmanager(await login())).toBe(200);
});
