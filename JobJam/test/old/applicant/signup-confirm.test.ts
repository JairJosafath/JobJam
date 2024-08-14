import { config } from "dotenv";
config();
const confirmationCode = "871852";

test("applicant can confirm account", async () => {
	const endpoint = process.env.API_ENDPOINT;

	const res = await fetch(endpoint + "auth/confirm-signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-applicant",
			confirmationCode, //this will change on every test where the user is created ... obviously
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
