import { Queue } from "bullmq";
import { redisConnection } from "../redis/connection";

export const emailQueue = new Queue("email-sending", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 100,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

export async function scheduleEmailJob(
  emailId: string,
  scheduledAt: Date
) {
  const delay = Math.max(
    0,
    scheduledAt.getTime() - Date.now()
  );

  return emailQueue.add(
    "send-email",
    {
      emailId,
    },
    {
      delay,
      jobId: emailId,
    }
  );
}