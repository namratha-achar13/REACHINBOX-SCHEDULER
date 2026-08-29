import express from "express";
import cors from "cors";
import { pool } from "./db/connection";
import { scheduleEmailJob } from "./queue/email.queue";

const app = express();

// CORS
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "http://localhost:3001"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("ReachInbox Scheduler API");
});

// Get all emails
app.get("/api/emails", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM emails
       ORDER BY scheduled_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch emails:", error);

    res.status(500).json({
      message: "Failed to fetch emails",
    });
  }
});

// Schedule an email
app.post("/api/emails", async (req, res) => {
  const {
    recipient,
    subject,
    body,
    scheduledAt,
    senderEmail,
  } = req.body;

  if (!recipient || !subject || !body || !scheduledAt) {
    return res.status(400).json({
      message:
        "recipient, subject, body and scheduledAt are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO emails
        (recipient, subject, body, scheduled_at, sender_email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        recipient,
        subject,
        body,
        scheduledAt,
        senderEmail || null,
      ]
    );

    const email = result.rows[0];

    await scheduleEmailJob(
      email.id,
      new Date(scheduledAt)
    );

    res.status(201).json({
      message: "Email scheduled successfully",
      email,
    });
  } catch (error) {
    console.error("Failed to schedule email:", error);

    res.status(500).json({
      message: "Failed to schedule email",
    });
  }
});

// Start server
app.listen(3000, async () => {
  console.log("Server running on port 3000");

  try {
    const result = await pool.query("SELECT NOW()");

    console.log(
      "Database connected:",
      result.rows[0]
    );
  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );
  }
});