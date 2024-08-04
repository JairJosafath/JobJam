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
		console.log("Test applicant signed up successfully");
		expect(data.UserConfirmed).toBe(false);
	} else {
		console.log("Test applicant sign up failed");
		console.log(data);
		expect(res.status).toBe(200);
	}
});

test("applicant can login", async () => {
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
		expect(data.UserConfirmed).toBe(false);
	} else {
		console.log("Test applicant login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}
});

test("applicant can confirm account", async () => {
	const endpoint = process.env.MOCK_ENDPOINT_URL;

	const res = await fetch(endpoint + "/confirm-signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-applicant",
			code: process.env.TEST_APPLICANT_CONFIRMATION_CODE || "<>",
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test applicant confirmed account successfully");
		expect(data.UserConfirmed).toBe(true);
	} else {
		console.log("Test applicant confirm account failed");
		console.log(data);
		expect(res.status).toBe(200);
	}
});
