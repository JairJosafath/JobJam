import { config } from "dotenv";

config();
const ENDPOINT = process.env.ENDPOINT;
test("the interviewer can schedule an interview", async () => {
	// interviewer logs in
	const resLogin = await fetch(`${ENDPOINT}/auth/login`, {
		method: "POST",
		body: JSON.stringify({
			username: "test-interviewer",
			password: process.env.NEW_TEST_INTERVIEWER_PASSWORD,
		}),
		headers: { "Content-Type": "application/json" },
	});

	const dataLogin = await resLogin.json();

	if (resLogin.status !== 200) {
		console.error(dataLogin);
	}

	expect(resLogin.status).toBe(200);

	// interviewer queries interviews
	const resQueryInterviews = await fetch(
		`${ENDPOINT}/interviews?interviewerId=undefined`,
		{
			method: "GET",
			headers: {
				Authorization: dataLogin.AuthenticationResult.IdToken,
			},
		}
	);

	const dataQueryInterviews = await resQueryInterviews.json();

	console.log(dataQueryInterviews);

	expect(resQueryInterviews.status).toBe(200);

	const interview = dataQueryInterviews.Items[0];
	// interviewer schedules an interview
	const resScheduleInterview = await fetch(
		`${ENDPOINT}/interviews/350c341b-1111-4ed0-84d2-71961ea27619`,
		{
			method: "PATCH",
			body: JSON.stringify({
				jobId: "3e4d98a3-b714-4896-b4bd-90851078753f",
				time: "2024-09-30T10:00:00Z",
				location: "Remote",
				date: "2024-09-30",
			}),
			headers: {
				Authorization: dataLogin.AuthenticationResult.IdToken,
				"Content-Type": "application/json",
			},
		}
	);

	const dataScheduleInterview = await resScheduleInterview.json();

	console.log(dataScheduleInterview);
});
