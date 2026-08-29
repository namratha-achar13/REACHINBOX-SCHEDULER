# ReachInbox Email Scheduler

A full-stack email scheduling system that allows users to schedule emails and process them asynchronously using a Redis-backed BullMQ worker.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Redis
- BullMQ
- Nodemailer
- Ethereal Email
- Next.js
- Tailwind CSS
- Docker

## Features

- Schedule emails for a future time
- Store scheduled emails in PostgreSQL
- Queue email jobs using BullMQ and Redis
- Process emails using a background worker
- Retry failed email jobs
- Prevent duplicate email processing
- Send emails through SMTP using Nodemailer
- Track scheduled and sent email status
- View email activity through a Next.js dashboard

## Architecture

```text
Next.js Frontend
       |
       v
Express REST API
       |
       v
PostgreSQL
       |
       v
BullMQ Queue
       |
       v
Redis
       |
       v
Email Worker
       |
       v
Nodemailer / Ethereal SMTP
