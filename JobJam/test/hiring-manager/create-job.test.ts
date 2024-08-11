import { config } from "dotenv";
import {jobs} from "../jobs";
config();

const endpoint = process.env.API_ENDPOINT || "";


test("hiring manager can create a job", async () => {
	// hiring manager login

	const loginResponse = await fetch(endpoint + "auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-hiring-manager",
			password: process.env.NEW_PASSWORD,
		}),
	});

	const loginData = await loginResponse.json();
	expect(loginResponse.status).toBe(200);

	const Authorization = loginData.AuthenticationResult.IdToken;

	for (const job of jobs) {
		const response = await fetch(endpoint + "/jobs", {
			method: "POST",
			body: JSON.stringify(job),
			headers: {
				"Content-Type": "application/json",
				Authorization,
			},
		});

		const data = await response.json();
		console.log(data);

		expect(response.status).toBe(200);
	}
});
