import { config } from "dotenv";

config();
const ENDPOINT = process.env.API_ENDPOINT;
test("the hiring manager can query interviewers and assign them to an application by creating an interview", async () => {
	// hiring manager logs in
	const resLogin = await fetch(`${ENDPOINT}/auth/login`, {
		method: "POST",
		body: JSON.stringify({
			username: "test-hiring-manager",
			password: process.env.NEW_PASSWORD,
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

	// get applications
	const resGetApplications = await fetch(`${ENDPOINT}/applications/query?index
		=ApplicationsByDepartment&value=Marketing&key=Department
		`, {
		method: "GET",
		headers: {
			Authorization: dataLogin.AuthenticationResult.IdToken,
		},
	});

	const dataGetApplications = await resGetApplications.json();

	console.log(dataGetApplications);
	const application = dataGetApplications.Items[0];

	// hiring manager assigns an interviewer to an application
	const resAssignInterviewer = await fetch(`${ENDPOINT}/interviews`, {
		method: "POST",
		body: JSON.stringify({
			applicationId: application.ApplicationId.S,
			interviewerId: interviewer.InterviewerId.S,
			interviewerEmail: interviewer.Email.S
		}),
		headers: {
			Authorization: dataLogin.AuthenticationResult.IdToken,
			"Content-Type": "application/json",
		},
	});

	const dataAssignInterviewer = await resAssignInterviewer.json();

	console.log(dataAssignInterviewer);
});
