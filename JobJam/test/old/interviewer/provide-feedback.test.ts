import { login, query_interviews, submit_feedback } from "./actions";
test("Interviewer can provide feedback", async () => {
  const token = await login();
  const interviews = await query_interviews(token);
  expect(await submit_feedback(interviews[0], token)).toBe(true);
});
