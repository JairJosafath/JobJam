import { config } from "dotenv";
import { initial_login } from "./actions";
config();

test("interviewer first time login", async () => {
  expect(await initial_login()).toBe(true);
});
