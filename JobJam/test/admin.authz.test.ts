import { config } from "dotenv";
config();

const endpoint = process.env.MOCK_ENDPOINT_URL;

test("test admin login", async () => {
	const res = await fetch(endpoint + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-admin",
			password: process.env.NEW_TEST_ADMIN_PASSWORD,
		}),
	});
	const data = await res.json();
	if (res.status === 200) {
		console.log("Test admin logged in successfully");
		expect(data.AuthenticationResult.AccessToken).toBeDefined();
		expect(data.AuthenticationResult.IdToken).toBeDefined();
		expect(res.status).toBe(200);
	} else {
		console.log("Test admin login failed");
		console.log(await res.json());
		expect(res.status).toBe(200);
	}

	// test GET mock endpoint that has a lambda authorizer
	const resInterviewer = await fetch(endpoint + "/interviewer/mock", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: data.AuthenticationResult.IdToken,
		},
	});

	const dataInterviewer = await resInterviewer.json();

	if (resInterviewer.status === 200) {
		console.log("Test interviewer mock endpoint access successful");
		expect(resInterviewer.status).toBe(200);
		expect(dataInterviewer.message).toBe("Mock integration successful");
	} else {
		console.log("Test interviewer mock endpoint access failed");
		console.log(dataInterviewer);
		expect(resInterviewer.status).toBe(200);
	}
});
