import { buildEmail } from "../utils/buildEmail.mjs";
import { sendEmail } from "../utils/sendEmail.mjs";

const commonStyles = `
  <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
    }
    .email-container {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    h1 {
        color: #007BFF;
        font-size: 24px;
        margin-top: 0;
        border-bottom: 3px solid #007BFF;
        padding-bottom: 10px;
    }
    p {
        font-size: 16px;
        color: #333333;
        line-height: 1.5;
        margin: 8px 0;
    }
    .highlight {
        background-color: #e9f5ff;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }
    .footer {
        font-size: 14px;
        color: #777777;
        text-align: center;
        margin-top: 20px;
    }
  </style>
`;

export async function handleStatusChange(newItem, jobInfo) {
  let email;

  const commonBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${commonStyles}
    </head>
    <body>
        <div class="email-container">
            <h1>${header}</h1>
            <div class="highlight">
                <p><strong>Job Title:</strong> ${jobInfo.title}</p>
                <p><strong>Department:</strong> ${jobInfo.department}</p>
                <p><strong>Location:</strong> ${jobInfo.location}</p>
            </div>
            <div class="footer">
                <p>If you have any questions, please contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  switch (newItem.Status.S) {
    case "PENDING_INTERVIEW":
      if (newItem.InterviewerEmail.S) {
        email = buildEmail({
          to: newItem.InterviewerEmail.S,
          subject: `Interview Assignment for ${jobInfo.title}`,
          body: commonBody.replace("${header}", "Interview Assignment"),
        });
      }
      break;
    case "INTERVIEW_SCHEDULED":
      email = buildEmail({
        to: newItem.Contact.M.email.S,
        subject: `Interview Scheduled for ${jobInfo.title}`,
        body: commonBody
          .replace("${header}", "Interview Scheduled")
          .replace(
            '<div class="highlight">',
            '<div class="highlight"><p><strong>Interview Date:</strong> ${newItem.Interview.M.Date.S}</p><p><strong>Interview Time:</strong> ${newItem.Interview.M.Time.S}</p>'
          ),
      });
      break;
    case "INTERVIEW_COMPLETED":
      email = buildEmail({
        to: jobInfo.hiringManagerEmail,
        subject: `Interview Completed for ${jobInfo.title}`,
        body: commonBody.replace("${header}", "Interview Completed"),
      });
      break;
    case "OFFER_MADE":
      email = buildEmail({
        to: newItem.Contact.M.email.S,
        subject: `Offer Made for ${jobInfo.title}`,
        body: commonBody.replace("${header}", "Offer Made"),
      });
      break;
    case "OFFER_ACCEPTED":
      email = buildEmail({
        to: jobInfo.hiringManagerEmail,
        subject: `Offer Accepted for ${jobInfo.title}`,
        body: commonBody.replace("${header}", "Offer Accepted"),
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
