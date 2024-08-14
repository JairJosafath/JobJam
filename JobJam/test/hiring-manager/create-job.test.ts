import { config } from "dotenv";
import { jobs } from "../jobs";
import { create_job, login } from "./actions";

test("hiring manager can create a job", async () => {
  expect(await create_job(jobs, await login())).toBe(true);
});
