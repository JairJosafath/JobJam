import { config } from "dotenv";
config();

test("applicant can confirm account", async () => {
	const endpoint = process.env.MOCK_ENDPOINT_URL;

	const res = await fetch(endpoint + "/confirm-signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-applicant",
			confirmationCode: "006250",
		}),
	});

	if (res.status === 200) {
		console.log("Test applicant confirmed account successfully");
		expect(res.status).toBe(200);
	} else {
		console.log("Test applicant confirm account failed");
		expect(res.status).toBe(200);
	}
});
