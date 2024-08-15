// this is the happpy flow test case

import { downloadFile, login, uploadFile } from "../actions";
import { applicants } from "../users";
import { randomUUID } from "crypto";
import { config } from "dotenv";
config();

// describe("Happy Flow: Applicant can upload resume", () => {
//   test("applicant can upload a file", async () => {
//     const PATH = "test/integration/resume.pdf";
//     const { username, password, email } = applicants[0];
//     const token = await login(username, password);
//     expect(token).toContain("eyJ");

//     expect(
//       await uploadFile(PATH, `resume/${username}/${randomUUID()}.pdf`, token)
//     ).toBe(200);
//   });
// });

describe("Happy Flow: Applicant can download a file", () => {
  test("applicant can download a file", async () => {
    const { username, password, email } = applicants[0];
    const token = await login(username, password);
    expect(token).toContain("eyJ");

    expect(await downloadFile("test.pdf", token)).toBe(200);
  });
});
