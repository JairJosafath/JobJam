import { login, extend_offer, query_applications } from "./actions";

test("Hiring manager can extend offer", async () => {
  const token = await login();
  const applications = await query_applications(token);
  const application = applications[0];
  const response = await extend_offer(application, token);

  expect(response).toBe(true);
});
