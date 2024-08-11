import { log } from "console";
import { config } from "dotenv";

config();

const endpoint = process.env.ENDPOINT;

test("authenticated user can apply to a job", async () => {
	const loginResponse = await fetch(`${endpoint}/login`, {
		method: "POST",
		body: JSON.stringify({
			username: process.env.TEST_APPLICANT_EMAIL,
			password: process.env.TEST_APPLICANT_PASSWORD,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const loginJson = await loginResponse.json();
	if (loginResponse.status !== 200) {
		console.log(loginJson);
	}
	expect(loginResponse.status).toBe(200);
// list jobs
	const listJobsResponse = await fetch(`${endpoint}/jobs?index=JobsByLevel&value=junior-level&key=Level`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: loginJson.AuthenticationResult.IdToken,
		},
	});

	const listJobsJson = await listJobsResponse.json();
	if (listJobsResponse.status !== 200) {
		console.log(listJobsJson);
	}
	expect(listJobsResponse.status).toBe(200);

	const job = listJobsJson.Items[0];

	const applyResponse = await fetch(`${endpoint}/applications`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: loginJson.AuthenticationResult.IdToken,
		},
		body: JSON.stringify({
			jobId: job.JobId.S,
			resume: "https://example.com/resume",
			coverLetter: "I am a great fit for this job",
			department: job.Department.S,
			contact:{
				email: process.env.EMAIL?.replace("@", "+applicant@"),
				phone: "1234567890",
			}
		}),
		})
	const applyJson = await applyResponse.json();
	if (applyResponse.status !== 200) {
		console.log(applyJson);
	}
	expect(applyResponse.status).toBe(200);
	});

	
