import dotenv from "dotenv";
import { Worker } from "bullmq";
import { redisConnection } from "../redis/connection";
import { pool } from "../db/connection";
import { sendEmail } from "../services/email.service";
import { acquireHourlySlot } from "../rate-limit/hourly-rate-limiter";

dotenv.config();

const concurrency = Number(process.env.WORKER_CONCURRENCY || 5);
const minDelay = Number(
  process.env.MIN_DELAY_BETWEEN_EMAILS_MS || 2000
);

const worker = new Worker(
  "email-sending",
  async (job) => {
    console.log("Processing job:", job.id);

    const { emailId } = job.data;

    const claimResult = await pool.query(
      `UPDATE emails
       SET status = 'processing'
       WHERE id = $1
       AND status = 'scheduled'
       RETURNING *`,
      [emailId]
    );

    if (claimResult.rows.length === 0) {
      console.log("Already processed:", emailId);
      return;
    }

    const email = claimResult.rows[0];

    const senderEmail =
      email.sender_email || process.env.ETHEREAL_USER;

    if (!senderEmail) {
      throw new Error("No sender email configured");
    }

    const delay = await acquireHourlySlot(senderEmail);

    if (delay > 0) {
      await pool.query(
        `UPDATE emails
         SET status = 'scheduled'
         WHERE id = $1`,
        [emailId]
      );

      console.log(
        `Hourly limit reached for ${senderEmail}.`
      );

      throw new Error(
        `Hourly email limit reached. Retry after ${delay}ms`
      );
    }

    try {
  await sendEmail(
    email.recipient,
    email.subject,
    email.body
  );
} catch (error) {
  await pool.query(
    `UPDATE emails
     SET status = 'scheduled'
     WHERE id = $1
     AND status = 'processing'`,
    [emailId]
  );

  throw error;
}

    await pool.query(
      `UPDATE emails
       SET status = 'sent',
           sent_at = NOW()
       WHERE id = $1
       AND status = 'processing'`,
      [emailId]
    );

    console.log("Email marked as sent:", emailId);
  },
  {
    connection: redisConnection,
    concurrency,
    limiter: {
      max: 1,
      duration: minDelay,
    },
  }
);

worker.on("completed", (job) => {
  console.log("Job completed:", job.id);
});

worker.on("failed", (job, error) => {
  console.error(
    "Job failed:",
    job?.id,
    error.message
  );
});