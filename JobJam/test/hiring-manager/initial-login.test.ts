import { config } from "dotenv";
config();

const endpoint = process.env.MOCK_ENDPOINT_URL;

test("hiring-manager first time login", async () => {
	// hiring-manager login via api
	const res = await fetch(endpoint + "auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-hiring-manager",
			password: process.env.TEST_HIRINGMANAGER_PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test hiring-manager logged in successfully");
		expect({
			username: data.ChallengeParameters.USER_ID_FOR_SRP,
			challengeName: data.ChallengeName,
		}).toStrictEqual({
			username: "test-hiring-manager",
			challengeName: "NEW_PASSWORD_REQUIRED",
		});
	} else {
		console.log("Test hiring-manager initial login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}

	// hiring-manager password reset via api
	const resChallenge = await fetch(endpoint + "auth/challenge", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			challengeName: data.ChallengeName,
			username: "test-hiring-manager",
			newPassword: process.env.NEW_TEST_HIRINGMANAGER_PASSWORD,
			session: data.Session,
		}),
	});

	if (resChallenge.status === 200) {
		console.log("Test hiring-manager password reset successfully");
		expect(resChallenge.status).toBe(200);
	} else {
		console.log("Test hiring-manager password reset failed");
		// reason of failure
		console.log(await resChallenge.json());
		expect(resChallenge.status).toBe(200);
	}
});
