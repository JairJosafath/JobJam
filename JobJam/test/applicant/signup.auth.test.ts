import { config } from "dotenv";
config();

test("applicant can sign up", async () => {
	const endpoint = process.env.MOCK_ENDPOINT_URL;

	const res = await fetch(endpoint + "/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-applicant",
			password: process.env.TEST_APPLICANT_PASSWORD,
			email: process.env.TEST_APPLICANT_EMAIL,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		expect(res.status).toBe(200);
	} else {
		console.log("Test applicant sign up failed");
		console.log(data);
		expect(res.status).toBe(200);
	}
});
