import { config } from "dotenv";
config();

const endpoint = process.env.API_ENDPOINT;

test("interviewer first time login", async () => {
	// interviewer login via api
	const res = await fetch(endpoint + "auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-interviewer",
			password: process.env.PASSWORD,
		}),
	});

	const data = await res.json();

	if (res.status === 200) {
		console.log("Test interviewer logged in successfully");
		expect({
			username: data.ChallengeParameters.USER_ID_FOR_SRP,
			challengeName: data.ChallengeName,
		}).toStrictEqual({
			username: "test-interviewer",
			challengeName: "NEW_PASSWORD_REQUIRED",
		});
	} else {
		console.log("Test interviewer initial login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}

	// interviewer password reset via api
	const resChallenge = await fetch(endpoint + "auth/challenge", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			challengeName: data.ChallengeName,
			username: "test-interviewer",
			newPassword: process.env.NEW_PASSWORD,
			session: data.Session,
		}),
	});

	if (resChallenge.status === 200) {
		console.log("Test interviewer password reset successfully");
		expect(resChallenge.status).toBe(200);
	} else {
		console.log("Test interviewer password reset failed");
		// reason of failure
		console.log(await resChallenge.json());
		expect(resChallenge.status).toBe(200);
	}
});
