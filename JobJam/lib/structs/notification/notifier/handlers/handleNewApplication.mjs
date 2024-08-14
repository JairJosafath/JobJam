import { buildEmail } from "../utils/buildEmail.mjs";
import { sendEmail } from "../utils/sendEmail.mjs";

export async function handleNewApplication(newItem, jobInfo) {
  const email = buildEmail({
    to: jobInfo.hiringManagerEmail,
    subject: `New Job Application for ${jobInfo.title}`,
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
            border-bottom: 2px solid #007BFF;
            padding-bottom: 10px;
        }
        p {
            font-size: 16px;
            color: #555555;
            line-height: 1.6;
            margin: 8px 0;
        }
        .label {
            font-weight: bold;
            color: #333333;
        }
        .button {
            display: inline-block;
            background-color: #007BFF;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>New Job Application Received</h1>
        <p><span class="label">Job Title:</span> ${jobInfo.title}</p>
        <p><span class="label">Department:</span> ${jobInfo.department}</p>
        <p><span class="label">Location:</span> ${jobInfo.location}</p>
        <p><span class="label">Cover Letter:</span> ${newItem.CoverLetter.S}</p>
        <p><span class="label">Resume:</span> <a href="${newItem.Resume.S}" class="button">View Resume</a></p>
    </div>
</body>
</html>
    `,
  });
  await sendEmail(email);
}
