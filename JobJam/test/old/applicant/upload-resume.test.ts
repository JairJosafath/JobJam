import { login, upload_resume } from "./actions";

test("Test applicant uploads resume", async () => {
  const token = await login();
  console.log(token);
  const success = await upload_resume(token);
  expect(success).toBe(true);
});
