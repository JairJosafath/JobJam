import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client();

export async function sendEmail(email) {
  try {
    const command = new SendEmailCommand(email);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", JSON.stringify(response));
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
