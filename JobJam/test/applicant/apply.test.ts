import { log } from "console";
import { config } from "dotenv";
import { apply_for_job, query_jobs, login } from "./actions";

config();

const endpoint = process.env.ENDPOINT;

test("authenticated user can apply to a job", async () => {
  const token = await login();
  const job = await query_jobs(token);
  // console.log(JSON.stringify(job[0]));
  expect(await apply_for_job(token, job[0])).toBe(true);
});
