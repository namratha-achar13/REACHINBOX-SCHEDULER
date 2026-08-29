import dotenv from "dotenv";
import { redisConnection } from "../redis/connection";

dotenv.config();

const MAX_EMAILS_PER_HOUR = Number(
  process.env.MAX_EMAILS_PER_HOUR || 100
);

export async function acquireHourlySlot(
  senderEmail: string
): Promise<number | null> {
  const now = new Date();

  const hourStart = new Date(now);

  hourStart.setMinutes(0, 0, 0);

  const windowKey = hourStart.toISOString();

  const key = `email-rate:${senderEmail}:${windowKey}`;

  const count = await redisConnection.incr(key);

  if (count === 1) {
    await redisConnection.expire(key, 60 * 60);
  }

  if (count <= MAX_EMAILS_PER_HOUR) {
    return 0;
  }

  await redisConnection.decr(key);

  const nextHour = new Date(hourStart);
  nextHour.setHours(nextHour.getHours() + 1);

  return nextHour.getTime() - now.getTime();
}