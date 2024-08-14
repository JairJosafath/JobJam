import { getJobDetails } from "./handlers/getJobDetails";
import { handleNewApplication } from "./handlers/handleNewApplication";
import { handleStatusChange } from "./handlers/handleStatusChange";

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
