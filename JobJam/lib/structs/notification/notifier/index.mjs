import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new DynamoDBClient();
const sesClient = new SESv2Client();

export async function handler(event) {
  try {
    const record = event.Records[0];
    const pk = record.dynamodb.Keys.pk.S;
    const sk = record.dynamodb.Keys.sk.S;
    const newItem = record.dynamodb.NewImage;
    const oldItem = record.dynamodb.OldImage;
    const eventName = record.eventName;

    console.log("Processing record:", JSON.stringify({ pk, sk, eventName }));

    if (pk.startsWith("Job#") && sk.startsWith("Application#")) {
      const job = await getJobDetails(pk);
      const commonJobInfo = extractJobInfo(job);

      switch (eventName) {
        case "INSERT":
          await handleNewApplication(newItem, commonJobInfo);
          break;
        case "MODIFY":
          if (newItem.Status.S !== oldItem.Status.S) {
            await handleStatusChange(newItem, commonJobInfo);
          } else {
            console.log("Status is unchanged, no action required.");
          }
          break;
        default:
          console.log("Unhandled event type:", eventName);
      }
    }
  } catch (error) {
    console.error("Error processing the event:", error);
  }
}

async function getJobDetails(pk) {
  const params = {
    TableName: process.env.TABLENAME,
    Key: {
      pk: { S: pk },
      sk: { S: "Info" },
    },
  };
  const command = new GetItemCommand(params);
  const response = await client.send(command);
  console.log("Fetched job details:", JSON.stringify(response.Item));
  return response.Item;
}

function extractJobInfo(job) {
  return {
    title: job.Title.S,
    department: job.Department.S,
    location: job.Location.S,
    hiringManagerEmail: job.Contact.M.email.S,
    interviewerEmail: job.Interviewer?.M?.email?.S || null,
  };
}

async function handleNewApplication(newItem, jobInfo) {
  const email = buildEmail({
    to: jobInfo.hiringManagerEmail,
    subject: `New Job Application for ${jobInfo.title}`,
    body: `
            <h1>New Job Application</h1>
            <p>Job Title: ${jobInfo.title}</p>
            <p>Department: ${jobInfo.department}</p>
            <p>Location: ${jobInfo.location}</p>
            <p>Coverletter: ${newItem.CoverLetter.S}</p>
            <p>Resume: ${newItem.Resume.S}</p>
        `,
  });
  await sendEmail(email);
}

async function handleStatusChange(newItem, jobInfo) {
  let email;

  switch (newItem.Status.S) {
    case "PENDING_INTERVIEW":
      if (newItem.InterviewerEmail.S) {
        email = buildEmail({
          to: newItem.InterviewerEmail.S,
          subject: `Interview Assignment for ${jobInfo.title}`,
          body: `
                        <h1>Interview Assignment</h1>
                        <p>Job Title: ${jobInfo.title}</p>
                        <p>Department: ${jobInfo.department}</p>
                        <p>Location: ${jobInfo.location}</p>
                    `,
        });
      }
      break;
    case "INTERVIEW_SCHEDULED":
      email = buildEmail({
        to: newItem.Contact.M.email.S,
        subject: `Interview Scheduled for ${jobInfo.title}`,
        body: `
                    <h1>Interview Scheduled</h1>
                    <p>Job Title: ${jobInfo.title}</p>
                    <p>Department: ${jobInfo.department}</p>
                    <p>Location: ${jobInfo.location}</p>
                    <p>Interview Date: ${newItem.Interview.M.Date.S}</p>
                    <p>Interview Time: ${newItem.Interview.M.Time.S}</p>
                `,
      });
      break;
    case "INTERVIEW_COMPLETED":
      email = buildEmail({
        to: jobInfo.hiringManagerEmail,
        subject: `Interview Completed for ${jobInfo.title}`,
        body: `
                    <h1>Interview Completed</h1>
                    <p>Job Title: ${jobInfo.title}</p>
                    <p>Department: ${jobInfo.department}</p>
                    <p>Location: ${jobInfo.location}</p>
                `,
      });
      break;
    case "OFFER_MADE":
      email = buildEmail({
        to: newItem.Contact.M.email.S,
        subject: `Offer Made for ${jobInfo.title}`,
        body: `
                    <h1>Offer Made</h1>
                    <p>Job Title: ${jobInfo.title}</p>
                    <p>Department: ${jobInfo.department}</p>
                    <p>Location: ${jobInfo.location}</p>
                `,
      });
      break;
    case "OFFER_ACCEPTED":
      email = buildEmail({
        to: jobInfo.hiringManagerEmail,
        subject: `Offer Accepted for ${jobInfo.title}`,
        body: `
                    <h1>Offer Accepted</h1>
                    <p>Job Title: ${jobInfo.title}</p>
                    <p>Department: ${jobInfo.department}</p>
                    <p>Location: ${jobInfo.location}</p>
                `,
      });
      break;
    default:
      console.log("Unhandled status:", newItem.Status.S);
      return;
  }

  console.log({ email });
  if (email) {
    await sendEmail(email);
  }
}

function buildEmail({ to, subject, body }) {
  return {
    Destination: { ToAddresses: [to] },
    FromEmailAddress: process.env.FROM_EMAIL,
    Content: {
      Simple: {
        Body: { Html: { Data: body } },
        Subject: { Data: subject },
      },
    },
  };
}

async function sendEmail(email) {
  try {
    const command = new SendEmailCommand(email);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", JSON.stringify(response));
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
