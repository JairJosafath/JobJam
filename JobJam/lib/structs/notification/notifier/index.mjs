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
  const oldItem = record.dynamodb.OldImage;
  const eventName = record.eventName;

  console.log(JSON.stringify({ pk, sk, item }));

  // if the record is a new application, send a notification to the hring manager email
  if (
    pk.startsWith("Job#") &&
    sk.startsWith("Application#") &&
    eventName === "INSERT"
  ) {
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
    const email = emailBuilderNewApplication(
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
  // return if tht status of the old record is the same as the new record
  if (oldItem.Status.S === item.Status.S) {
    console.log("Status is the same");
    return;
  }
  if (
    pk.startsWith("Job#") &&
    sk.startsWith("Application#") &&
    eventName === "MODIFY"
  ) {
    // if an interview is assigned to an interviewer, send a notification to the interviewer
    if (item.Status.S === "PENDING_INTERVIEW") {
      // get the job details
      const job = await getJob(pk);
      console.log(JSON.stringify(job));

      // get the interviewer email
      const interviewerEmail = job.Interviewer.M.email.S;
      console.log(interviewerEmail);

      // get the job info
      const jobTitle = job.Title.S;
      const jobDepartment = job.Department.S;
      const jobLocation = job.Location.S;

      // setup the email
      const email = emailBuilderInterviewerAssignment(
        interviewerEmail,
        jobTitle,
        jobDepartment,
        jobLocation
      );

      // send the email
      const command = new SendEmailCommand(email);
      const response = await sesClient.send(command);
      console.log(response);
    }

    // if an interview is scheduled, send a notification to the candidate
    if (item.Status.S === "INTERVIEW_SCHEDULED") {
      // get the job details
      const job = await getJob(pk);
      console.log(JSON.stringify(job));

      // get the candidate email
      const candidateEmail = item.Candidate.M.email.S;
      console.log(candidateEmail);

      // get the job info
      const jobTitle = job.Title.S;
      const jobDepartment = job.Department.S;
      const jobLocation = job.Location.S;
      const interviewDate = item.InterviewDate.S;

      // setup the email
      const email = emailBuilderInterviewScheduled(
        candidateEmail,
        jobTitle,
        jobDepartment,
        jobLocation,
        interviewDate
      );

      // send the email
      const command = new SendEmailCommand(email);
      const response = await sesClient.send(command);
      console.log(response);
    }

    // if feedback is given, send notification to hiring manager
    if (item.Status.S === "INTERVIEW_COMPLETED") {
      // get the job details
      const job = await getJob(pk);
      console.log(JSON.stringify(job));

      // get the hiring manager email
      const hiringManagerEmail = job.Contact.M.email.S;
      console.log(hiringManagerEmail);

      // get the job info
      const jobTitle = job.Title.S;
      const jobDepartment = job.Department.S;
      const jobLocation = job.Location.S;

      // setup the email
      const email = emailBuilderInterviewCompleted(
        hiringManagerEmail,
        jobTitle,
        jobDepartment,
        jobLocation
      );

      // send the email
      const command = new SendEmailCommand(email);
      const response = await sesClient.send(command);
      console.log(response);
    }

    //if an offer is made, send a notification to the candidate
    if (item.Status.S === "OFFER_MADE") {
      // get the job details
      const job = await getJob(pk);
      console.log(JSON.stringify(job));

      // get the candidate email
      const candidateEmail = item.Candidate.M.email.S;
      console.log(candidateEmail);

      // get the job info
      const jobTitle = job.Title.S;
      const jobDepartment = job.Department.S;
      const jobLocation = job.Location.S;

      // setup the email
      const email = emailBuilderOfferMade(
        candidateEmail,
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

  //if an offer is accepted, send a notification to the hiring manager
  if (item.Status.S === "OFFER_ACCEPTED") {
    // get the job details
    const job = await getJob(pk);
    console.log(JSON.stringify(job));

    // get the hiring manager email
    const hiringManagerEmail = job.Contact.M.email.S;
    console.log(hiringManagerEmail);

    // get the job info
    const jobTitle = job.Title.S;
    const jobDepartment = job.Department.S;
    const jobLocation = job.Location.S;

    // setup the email
    const email = emailBuilderOfferAccepted(
      hiringManagerEmail,
      jobTitle,
      jobDepartment,
      jobLocation
    );

    // send the email
    const command = new SendEmailCommand(email);
    const response = await sesClient.send(command);
    console;
  }
}

function emailBuilderNewApplication(
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

function emailBuilderInterviewerAssignment(
  interviewerEmail,
  jobTitle,
  jobDepartment,
  jobLocation
) {
  // build the email
  const email = {
    Destination: {
      ToAddresses: [interviewerEmail],
    },
    FromEmailAddress: process.env.FROM_EMAIL,
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: `
						<h1>Interview Assignment</h1>
						<p>Job Title: ${jobTitle}</p>
						<p>Department: ${jobDepartment}</p>
						<p>Location: ${jobLocation}</p>
						`,
          },
        },
        Subject: {
          Data: "Interview Assignment for " + jobTitle,
        },
      },
    },
  };
  return email;
}

function emailBuilderInterviewScheduled(
  candidateEmail,
  jobTitle,
  jobDepartment,
  jobLocation,
  interviewDate
) {
  // build the email
  const email = {
    Destination: {
      ToAddresses: [candidateEmail],
    },
    FromEmailAddress: process.env.FROM_EMAIL,
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: `
						<h1>Interview Scheduled</h1>
						<p>Job Title: ${jobTitle}</p>
						<p>Department: ${jobDepartment}</p>
						<p>Location: ${jobLocation}</p>
						<p>Interview Date: ${interviewDate}</p>
						`,
          },
        },
        Subject: {
          Data: "Interview Scheduled for " + jobTitle,
        },
      },
    },
  };
  return email;
}

function emailBuilderInterviewCompleted(
  hiringManagerEmail,
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
						<h1>Interview Completed</h1>
						<p>Job Title: ${jobTitle}</p>
						<p>Department: ${jobDepartment}</p>
						<p>Location: ${jobLocation}</p>
						`,
          },
        },
        Subject: {
          Data: "Interview Completed for " + jobTitle,
        },
      },
    },
  };
  return email;
}

function emailBuilderOfferMade(
  candidateEmail,
  jobTitle,
  jobDepartment,
  jobLocation
) {
  // build the email
  const email = {
    Destination: {
      ToAddresses: [candidateEmail],
    },
    FromEmailAddress: process.env.FROM_EMAIL,
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: `
						<h1>Offer Made</h1>
						<p>Job Title: ${jobTitle}</p>
						<p>Department: ${jobDepartment}</p>
						<p>Location: ${jobLocation}</p>
						`,
          },
        },
        Subject: {
          Data: "Offer Made for " + jobTitle,
        },
      },
    },
  };
  return email;
}

function emailBuilderOfferAccepted(
  hiringManagerEmail,
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
						<h1>Offer Accepted</h1>
						<p>Job Title: ${jobTitle}</p>
						<p>Department: ${jobDepartment}</p>
						<p>Location: ${jobLocation}</p>
						`,
          },
        },
        Subject: {
          Data: "Offer Accepted for " + jobTitle,
        },
      },
    },
  };
  return email;
}
