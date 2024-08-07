import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new DynamoDBClient();
const sesClient = new SESv2Client();

export async function handler(event) {
	// event is a sns topic message from dynamodb stream

	// get the record from the event
	const record = event.Records[0];
	console.log(JSON.stringify(record));
	const pk = record.dynamodb.Keys.pk.S;
	const sk = record.dynamodb.Keys.sk.S;
	const item = record.dynamodb.NewImage;

	console.log(JSON.stringify({ pk, sk, item }));

	// if the record is a new application, send a notification to the hring manager email
	if (pk.startsWith("Job#") && sk.startsWith("Application#")) {
		console.log("New application received");

		// get the job details
		const job = await getJob(pk);
		console.log(JSON.stringify(job));

		// get the hiring manager email
		const hiringManagerEmail = job.Contact.M.email.S;
		console.log(hiringManagerEmail);

		// get the application relevant details and job info
		const coverletter = item.CoverLetter.S;
		const resume = item.Resume.S;
		const jobTitle = job.Title.S;
		const jobDepartment = job.Department.S;
		const jobLocation = job.Location.S;

		// setup the email
		const email = emailBuilder(
			hiringManagerEmail,
			coverletter,
			resume,
			jobTitle,
			jobDepartment,
			jobLocation
		);

		// send the email
		const command = new SendEmailCommand(email);
		const response = await sesClient.send(command);
		console.log(response);
	}
}

function emailBuilder(
	hiringManagerEmail,
	coverletter,
	resume,
	jobTitle,
	jobDepartment,
	jobLocation
) {
	// build the email
	const email = {
		Destination: {
			ToAddresses: [hiringManagerEmail],
		},
		FromEmailAddress: process.env.FROM_EMAIL,
		Content: {
			Simple: {
				Body: {
					Html: {
						Data: `
                        <h1>New Job Application</h1>
                        <p>Job Title: ${jobTitle}</p>
                        <p>Department: ${jobDepartment}</p>
                        <p>Location: ${jobLocation}</p>
                        <p>Coverletter: ${coverletter}</p>
                        <p>Resume: ${resume}</p>
                        `,
					},
				},
				Subject: {
					Data: "New Job Application for " + jobTitle,
				},
			},
		},
	};
	return email;
}

async function getJob(pk) {
	const params = {
		TableName: process.env.TABLENAME,
		Key: {
			pk: {
				S: pk,
			},
			sk: {
				S: "Info",
			},
		},
	};
	const command = new GetItemCommand(params);
	const response = await client.send(command);
	return response.Item;
}
