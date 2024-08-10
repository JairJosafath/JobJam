import { config } from "dotenv";

config();
const ENDPOINT = process.env.ENDPOINT;
test("the hiring manager can query interviewers and assign them to an application by creating an interview", async () => {
	// hiring manager logs in
	const resLogin = await fetch(`${ENDPOINT}/auth/login`, {
		method: "POST",
		body: JSON.stringify({
			username: "test-hiring-manager",
			password: process.env.NEW_TEST_HIRINGMANAGER_PASSWORD,
		}),
		headers: { "Content-Type": "application/json" },
	});

	const dataLogin = await resLogin.json();

	if (resLogin.status !== 200) {
		console.error(dataLogin);
	}

	expect(resLogin.status).toBe(200);

	// hiring manager queries interviewers
	const resQueryInterviewers = await fetch(
		`${ENDPOINT}/interviewers?department=Marketing`,
		{
			method: "GET",
			headers: {
				Authorization: dataLogin.AuthenticationResult.IdToken,
			},
		}
	);

	const dataQueryInterviewers = await resQueryInterviewers.json();

	console.log(dataQueryInterviewers);
	const interviewer = dataQueryInterviewers.Items[0];
	console.log(interviewer);

	expect(resQueryInterviewers.status).toBe(200);

	// hiring manager assigns an interviewer to an application
	const resAssignInterviewer = await fetch(`${ENDPOINT}/interviews`, {
		method: "POST",
		body: JSON.stringify({
			jobId: "3e4d98a3-b714-4896-b4bd-90851078753f",
			interviewerId: interviewer.pk.S,
			applicationId: "baf85e34-0279-41f7-bcbd-7fbb18fbeffb",
		}),
		headers: {
			Authorization: dataLogin.AuthenticationResult.IdToken,
			"Content-Type": "application/json",
		},
	});

	const dataAssignInterviewer = await resAssignInterviewer.json();

	console.log(dataAssignInterviewer);
});
