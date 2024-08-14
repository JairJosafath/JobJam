import { login, query_applications, accept_offer } from "./actions";

test("Applicant can accept offer", async () => {
  const token = await login();
  const applications = await query_applications(token);
  const application = applications[0];
  console.log(application);
  const response = await accept_offer(application, token);

  //   expect(response).toBe(true);
});
