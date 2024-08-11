import { config } from "dotenv";
config();

const endpoint = process.env.API_ENDPOINT;

test("admin can login and create an interviewer", async () => {
	const res = await fetch(endpoint + "auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-admin",
			password: process.env.NEW_PASSWORD,
		}),
	});
	const data = await res.json();
	if (res.status === 200) {
		console.log("Test admin logged in successfully");
		expect(res.status).toBe(200);
	} else {
		console.log("Test admin login failed");
		console.log(data);
		expect(res.status).toBe(200);
	}
	const resInterviewer = await fetch(endpoint + "admin/interviewer", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: data.AuthenticationResult.IdToken,
		},
		body: JSON.stringify({
			username: "test-interviewer",
			department: "Marketing",
			email: process.env.EMAIL?.replace("@", "+interviewer@"),
			password: process.env.PASSWORD,
		}),
	});
	const dataInterviewer = await resInterviewer.json();
	if (resInterviewer.status === 200) {
		expect(resInterviewer.status).toBe(200);
	} else {
		console.log("Test interviewer creation failed");
		console.log(dataInterviewer);
		expect(resInterviewer.status).toBe(200);
	}
});
