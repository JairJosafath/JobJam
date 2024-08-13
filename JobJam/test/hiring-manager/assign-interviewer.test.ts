import { config } from "dotenv";
import {
  assign_interviewer,
  login,
  query_applications,
  query_interviewers,
} from "./actions";

config();
test("the hiring manager can query interviewers and assign them to an application by creating an interview", async () => {
  const token = await login();
  const applications = await query_applications(token);
  const interviewers = await query_interviewers("Marketing", token);
  expect(
    await assign_interviewer(applications[0], interviewers[0], token)
  ).toBe(true);
});
