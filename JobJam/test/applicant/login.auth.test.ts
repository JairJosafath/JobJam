import { config } from "dotenv";
config();

test("confirmed applicant can login", async () => {
	const endpoint = process.env.MOCK_ENDPOINT_URL;

	const res = await fetch(endpoint + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-applicant",
			password: process.env.TEST_APPLICANT_PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test applicant logged in successfully");
		expect(res.status).toBe(200);
	} else {
		console.log("Test applicant login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}
});
