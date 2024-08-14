import { config } from "dotenv";
import { login, query_interviews, schedule_interview } from "./actions";

config();
test("the interviewer can schedule an interview", async () => {
  const token = await login();
  const interviews = await query_interviews(token);

  expect(await schedule_interview(interviews[0], token)).toBe(true);
});
