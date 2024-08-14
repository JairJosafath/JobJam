/**
 *
 * User setup
 *
 */
import {
	AdminCreateUserCommand,
	CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from "dotenv";
import * as fs from "fs";

config();

const ENDPOINT = process.env.API_ENDPOINT || "";

export async function createAdmin(email: string, password: string) {
	const client = new CognitoIdentityProviderClient();
	const command = new AdminCreateUserCommand({
		UserPoolId: process.env.USER_POOL_ID,
		Username: "test-admin",
		DesiredDeliveryMediums: ["EMAIL"],
		MessageAction: "SUPPRESS",
		TemporaryPassword: password,
		UserAttributes: [
			{
				Name: "email",
				Value: email,
			},
			{
				Name: "email_verified",
				Value: "true",
			},
			{
				Name: "custom:role",
				Value: "admin",
			},
		],
	});

	try {
		const res = await client.send(command);

		return res.$metadata.httpStatusCode;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function adminCreateUser(
	email: string,
	username: string,
	password: string,
	role: "interviewer" | "hiring-manager",
	token: string
) {
	try {
		const res = await fetch(ENDPOINT + `admin/${role}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				email,
				username,
				password,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function resetPassword(
	username: string,
	email: string,
	password: string,
	newPassword: string
) {
	try {
		const res = await fetch(ENDPOINT + "auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		});
		const data = await res.json();

		if (res.status !== 200) {
			console.error(data);
		}

		const resChallenge = await fetch(ENDPOINT + "auth/challenge", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				challengeName: data.ChallengeName,
				username,
				newPassword,
				session: data.Session,
			}),
		});

		return resChallenge.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function signup(
	email: string,
	username: string,
	password: string
) {
	try {
		const res = await fetch(ENDPOINT + "auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
				email,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

/////////////////////////////////////////////////////////////////////////////

export async function login(email: string, password: string) {
	try {
		const res = await fetch(ENDPOINT + "auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: email,
				password,
			}),
		});
		const data = await res.json();
		return data.AuthenticationResult.IdToken as string;
	} catch (e) {
		console.error(e);
	}
	return "";
}

export async function createJob(job: any, token: string) {
	try {
		const res = await fetch(ENDPOINT + "jobs", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify(job),
		});
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function listJobs(index: string, key: string, value: string) {
	try {
		const res = await fetch(
			ENDPOINT + `jobs?index=${index}&key=${key}&value=${value}`
		);
		const data = await res.json();
		return data.Items as any[];
	} catch (e) {
		console.error(e);
	}
	return [];
}

export async function apply4Job(
	job: any,
	resumePath: string,
	email: string,
	phone: string,
	coverLetter: string,
	token: string
) {
	const key = `/resumes/${job.JobId.S}/${email}/${crypto.randomUUID()}.pdf`;

	try {
		fs.readFile(resumePath, async (err, data) => {
			if (err) {
				console.error(err);
				return 0;
			}

			const res = await fetch(ENDPOINT + `/files${key}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/pdf",
					Authorization: token,
				},
				body: data,
			});
			return res.status;
		});
		const res = await fetch(ENDPOINT + "applications", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				jobId: job.JobId.S,
				department: job.Department.S,
				resume: key,
				coverLetter: coverLetter,
				contact: {
					email: email,
					phone: phone,
				},
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
		return 0;
	}
}

export async function listApplications(
	index: string,
	key: string,
	value: string,
	token: string
) {
	try {
		const res = await fetch(
			ENDPOINT + `/applications?index=${index}&key=${key}&value=${value}`,
			{
				headers: {
					Authorization: token,
				},
			}
		);
		const data = await res.json();
		return data.Items as any[];
	} catch (e) {
		console.error(e);
	}
	return [];
}

export async function denyApplication(application: any, token: string) {
	try {
		const res = await fetch(
			ENDPOINT + `/applications/${application.ApplicationId.S}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({
					status: "DENIED",
				}),
			}
		);
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function listInterviewers(token: string) {
	try {
		const res = await fetch(ENDPOINT + "/interviewers", {
			headers: {
				Authorization: token,
			},
		});
		const data = await res.json();
		return data.Items as any[];
	} catch (e) {
		console.error(e);
	}
	return [];
}

export async function assignInterviewer(
	application: any,
	interviewer: any,
	token: string
) {
	try {
		const res = await fetch(ENDPOINT + `/interviews`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				jobId: application.pk.S,
				applicationId: application.sk.S,
				interviewerEmail: interviewer.Email.S,
				applicantEmail: application.ApplicantEmail.S,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function listInterviews(
	index: string,
	key: string,
	value: string,
	token: string
) {
	try {
		const res = await fetch(
			ENDPOINT + `/interviews?index=${index}&key=${key}&value=${value}`,
			{
				headers: {
					Authorization: token,
				},
			}
		);
		const data = await res.json();
		return data.Items as any[];
	} catch (e) {
		console.error(e);
	}
	return [];
}

export async function scheduleInterview(
	application: any,
	interviewer: any,
	time: string,
	location: string,
	token: string
) {
	try {
		const res = await fetch(ENDPOINT + `/interviews`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				jobId: application.pk.S,
				applicationId: application.sk.S,
				time,
				location,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function provideFeedback(
	application: any,
	feedback: any,
	token: string
) {
	try {
		const res = await fetch(ENDPOINT + `/interviews/feedback`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				jobId: application.pk.S,
				applicationId: application.sk.S,
				feedback,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export async function extendJobOffer(
	application: any,
	offerPath: string,
	token: string
) {
	const key = `/offers/${application.JobId.S}/${
		application.ApplicationId.S
	}/${crypto.randomUUID()}.pdf`;

	try {
		fs.readFile(offerPath, async (err, data) => {
			if (err) {
				console.error(err);
				return 0;
			}

			const res = await fetch(ENDPOINT + `/files${key}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/pdf",
					Authorization: token,
				},
				body: data,
			});
			return res.status;
		});
		const res = await fetch(ENDPOINT + "offers", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				jobId: application.JobId.S,
				applicationId: application.ApplicationId.S,
				offer: key,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
		return 0;
	}
}

export async function acceptJobOffer(
	application: any,
	signedOfferPath: string,
	token: string
) {
	const key = `/offers/${application.JobId.S}/${
		application.ApplicationId.S
	}/${crypto.randomUUID()}.pdf`;

	try {
		fs.readFile(signedOfferPath, async (err, data) => {
			if (err) {
				console.error(err);
				return 0;
			}

			const res = await fetch(ENDPOINT + `/files/${key}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/pdf",
					Authorization: token,
				},
				body: data,
			});
			return res.status;
		});
		const res = await fetch(ENDPOINT + "offers", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				jobId: application.JobId.S,
				applicationId: application.ApplicationId.S,
				status: "OFFER_ACCEPTED",
				offer: key,
			}),
		});
		return res.status;
	} catch (e) {
		console.error(e);
		return 0;
	}
}
