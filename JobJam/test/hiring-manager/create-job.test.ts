import { config } from "dotenv";
config();

const endpoint = process.env.ENDPOINT || "";

test("hiring manager can create a job", async () => {
	// hiring manager login

	const loginResponse = await fetch(endpoint + "/login", {
		method: "POST",
		body: JSON.stringify({
			email: process.env.TEST_HIRINGMANAGER_EMAIL,
			password: process.env.NEW_TEST_HIRINGMANAGER_PASSWORD,
		}),
	});

	const loginData = await loginResponse.json();
	expect(loginResponse.status).toBe(200);

	const Authorization = loginData.AuthenticationResult.IdToken;

	const response = await fetch(endpoint + "/jobs", {
		method: "POST",
		body: JSON.stringify({
			title: "Software Engineer",
			department: "Engineering",
			location: "Remote",
			type: "Full-time",
			level: "mid-level",
			salaryRange: {
				min: 100000,
				max: 120000,
				currency: "USD",
			},
			jobDescription:
				"As a software engineer, you will be responsible for building scalable software applications.",
			requiredSkills: ["JavaScript", "React", "Node.js"],
			Education: [
				"Bachelor's degree in Computer Science",
				"Master's degree in Computer Science",
				"PhD in Computer Science",
			],
			deadline: "2023-12-31",
			contact: {
				email: "some@mail.com",
				phone: "+1234567890",
			},
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization,
		},
	});

	const data = await response.json();
	console.log(data);

	expect(response.status).toBe(200);
});
