export function buildEmail({ to, subject, body }) {
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
