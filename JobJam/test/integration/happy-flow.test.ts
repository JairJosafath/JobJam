// this is the happpy flow test case

import exp = require("constants");
import {
	acceptJobOffer,
	adminCreateUser,
	apply4Job,
	assignInterviewer,
	createAdmin,
	createJob,
	denyApplication,
	extendJobOffer,
	listApplications,
	listInterviews,
	listJobs,
	login,
	provideFeedback,
	resetPassword,
	signup,
} from "./actions";
import { jobs } from "./jobs";
import { admin, applicants, hiringManagers, interviewers } from "./users";
import { randomInt } from "crypto";

describe("Happy Flow: Users setup", async () => {
	test("the admin can be created", async () => {
		const { email, password } = admin;
		expect(await createAdmin(email, password)).toBe(200);
	});

	test("the admin can log in and reset its password", async () => {
		const { email, password, username, newPassword } = admin;
		expect(await resetPassword(username, email, password, newPassword)).toBe(
			200
		);
	});
	test("the admin can create hiringmanagers and interviewers", async () => {
		const { email, password } = admin;
		const token = await login(email, password);
		expect(token).toBeTruthy();

		interviewers.forEach(async (interviewer) => {
			expect(
				await adminCreateUser(
					interviewer.email,
					interviewer.username,
					interviewer.password,
					"interviewer",
					token
				)
			).toBe(200);
		});

		hiringManagers.forEach(async (hiringManager) => {
			expect(
				await adminCreateUser(
					hiringManager.email,
					hiringManager.username,
					hiringManager.password,
					"hiring-manager",
					token
				)
			).toBe(200);
		});
	});

	test("the interviewer can log in and reset its password", async () => {
		const { email, password, username, newPassword } = interviewers[0];
		expect(await resetPassword(username, email, password, newPassword)).toBe(
			200
		);
	});

	test("the hiring manager can log in and reset its password", async () => {
		const { email, password, username, newPassword } = hiringManagers[0];
		expect(await resetPassword(username, email, password, newPassword)).toBe(
			200
		);
	});

	test("users can sign up", () => {
		applicants.forEach(async (applicant) => {
			expect(
				await signup(applicant.email, applicant.username, applicant.password)
			).toBe(200);
		});
	});
});

describe("Happy Flow: users can aply for jobs and hiring managers can make decisions", async () => {
	test("the hiring manager can create jobs", async () => {
		const { email, password } = hiringManagers[0];
		const token = await login(email, password);
		expect(token).toBeTruthy();

		jobs.forEach(async (job) => {
			expect(await createJob(job, token)).toBe(200);
		});
	});

	test("the applicants can query jobs and apply to one", async () => {
		const PATH = "test/integration/resume.pdf";
		const options = [
			{ key: "Location", value: "New York", index: "JobsByLocation" },
			{ key: "Type", value: "Full-time", index: "JobsByType" },
			{ key: "Department", value: "Engineering", index: "JobsByDepartment" },
		];
		// make applicants apply to jobs randomly 3 times
		for (let k = 0; k < 3; k++) {
			applicants.forEach(async ({ email, password }, i) => {
				const { index, value, key } = options[randomInt(0, options.length)];
				const token = await login(email, password);
				const jobs = await listJobs(index, key, value);
				expect(jobs.length).toBeGreaterThan(0);

				expect(
					await apply4Job(
						jobs[randomInt(jobs.length)],
						PATH,
						email,
						"123456789",
						"I am a very smart employee and will work very hard!",
						token
					)
				).toBe(200);
			});
		}
	});

	// make hiring manager query applications and assign interviewers or deny applications

	test("the hiring manager can query applications", async () => {
		const { email, password } = hiringManagers[0];
		const token = await login(email, password);
		expect(token).toBeTruthy();

		const applications = await listJobs(
			"ApplicationsByStatus",
			"Status",
			"SUBMITTED"
		);

		expect(applications.length).toBeGreaterThan(0);

		applications.forEach(async (application, i) => {
			if (i % 2 === 0) {
				expect(
					await assignInterviewer(
						application,
						interviewers[randomInt(interviewers.length)].email,
						token
					)
				).toBe(200);
			} else {
				expect(await denyApplication(application, token)).toBe(200);
			}
		});
	});
});

describe("Happy Flow: Interviewers can make decisions and hiring managers can extend offers or denyapplications", async () => {
	const PATH = "test/integration/offer.pdf";
	test("interviewer can review applications", async () => {
		const { email, password } = interviewers[0];
		const token = await login(email, password);
		expect(token).toBeTruthy();

		const applications = await listInterviews(
			"InterviewsByInterviewer",
			"InterviewerEmail",
			"",
			token
		);

		expect(applications.length).toBeGreaterThan(0);

		applications.forEach(async (application, i) => {
			if (i % 2 === 0) {
				expect(await denyApplication(application, token)).toBe(200);
			} else {
				expect(
					await provideFeedback(
						application,
						"This applicant shows a lot of potential",
						token
					)
				).toBe(200);
			}
		});
	});

	test("hiring manager can extend offers or deny applications", async () => {
		const { email, password } = hiringManagers[0];
		const token = await login(email, password);
		expect(token).toBeTruthy();

		const applications = await listJobs(
			"ApplicationsByStatus",
			"Status",
			"INTERVIEW_COMPLETED"
		);

		expect(applications.length).toBeGreaterThan(0);

		applications.forEach(async (application, i) => {
			if (i % 2 === 0) {
				expect(await denyApplication(application, token)).toBe(200);
			} else {
				expect(await extendJobOffer(application, PATH, token)).toBe(200);
			}
		});
	});
});

describe("Happy Flow: Applicants can accept an offer", async () => {
	test("applicant can accept an offer", async () => {
		const PATH = "test/integration/offer-signed.pdf";
		applicants.forEach(async ({ email, password }, i) => {
			const token = await login(email, password);
			expect(token).toBeTruthy();

			let applications = await listApplications(
				"ApplicationsByApplicant",
				"ApplicantEmail",
				"",
				token
			);

			applications = applications.filter(
				(application) => application.Status.S === "OFFER_MADE"
			);

			if ((applications.length = 0)) {
				console.log("the apllicant has no offers");
				return;
			}
			expect(applications.length).toBeGreaterThan(0);

			expect(await acceptJobOffer(applications[0], PATH, token)).toBe(200);
		});
	});
});
