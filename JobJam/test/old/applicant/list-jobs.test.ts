import { config } from "dotenv";

config();

const endpoint = process.env.ENDPOINT;

test("public can list jobs", async () => {
	const listJobsResponse = await fetch(
		`${endpoint}/jobs?index=JobsByLevel&value=junior-level&key=Level`
	);

	const listJobsJson = await listJobsResponse.json();

	console.log(listJobsJson);

	expect(listJobsResponse.status).toBe(200);
});
