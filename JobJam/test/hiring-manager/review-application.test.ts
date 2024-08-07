import { config } from "dotenv";

config();
const ENDPOINT = process.env.ENDPOINT;
test("the hiring manager can query applications and review them", async () => {
	// hiring manager logs in
	const resLogin = await fetch(`${ENDPOINT}/login`, {
		method: "POST",
		body: JSON.stringify({
			username: process.env.TEST_HIRINGMANAGER_EMAIL,
			password: process.env.NEW_TEST_HIRINGMANAGER_PASSWORD,
		}),
		headers: { "Content-Type": "application/json" },
	});

	const dataLogin = await resLogin.json();

	if (resLogin.status !== 200) {
		console.error(dataLogin);
	}

	expect(resLogin.status).toBe(200);

	// hiring manager queries applications
	const resQueryApplications = await fetch(
		`${ENDPOINT}/applications?jobId=48ebb15e-3f26-4d83-bedb-303e9f47c677`,
		{
			method: "GET",
			headers: {
				Authorization: dataLogin.AuthenticationResult.IdToken,
			},
		}
	);

	const dataQueryApplications = await resQueryApplications.json();

	console.log(dataQueryApplications);

	expect(resQueryApplications.status).toBe(200);

	// hiring manager updates application status
});
