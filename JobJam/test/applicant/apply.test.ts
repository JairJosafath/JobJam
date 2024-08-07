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

	const applyResponse = await fetch(`${endpoint}/applications`, {
		method: "POST",
		body: JSON.stringify({
			jobId: "48ebb15e-3f26-4d83-bedb-303e9f47c677",
			resume: "https://example.com/resume",
			coverLetter: "I am a great fit for this job",
			contact: {
				email: process.env.TEST_APPLICANT_EMAIL,
				phone: "1234567890",
			},
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: loginJson.AuthenticationResult.IdToken,
		},
	});

	const applyJson = await applyResponse.json();

	if (applyResponse.status !== 200) {
		console.log(applyJson);
	}

	expect(applyResponse.status).toBe(200);
});

// test("unauthenticated user can apply to a job", async () => {
// 	const applyResponse = await fetch(`${endpoint}/applications`, {
// 		method: "POST",
// 		body: JSON.stringify({
// 			jobId: "48ebb15e-3f26-4d83-bedb-303e9f47c677",
// 			resume: "https://example.com/resume",
// 			coverLetter:
// 				"I am also a great fit for this job but I dont want to make a profile",
// 			contact: {
// 				email: process.env.TEST_APPLICANT_EMAIL,
// 				phone: "1234567890",
// 			},
// 		}),
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 	});

// 	const applyJson = await applyResponse.json();

// 	if (applyResponse.status !== 200) {
// 		console.log(applyJson);
// 	}

// 	expect(applyResponse.status).toBe(200);
// });
