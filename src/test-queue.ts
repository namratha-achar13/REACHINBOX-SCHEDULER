import { emailQueue } from "./queue/email.queue";

async function testQueue() {
  const job = await emailQueue.add(
    "test-email",
    {
      message: "Hello from BullMQ",
    },
    {
      delay: 10000,
    }
  );

  console.log("Job added:", job.id);

  await emailQueue.close();
}

testQueue().catch((error) => {
  console.error("Queue test failed:", error);
});