import { create_interviewer, login } from "./actions";

test("admin can login and create an interviewer", async () => {
  expect(await create_interviewer(await login())).toBe(200);
});
