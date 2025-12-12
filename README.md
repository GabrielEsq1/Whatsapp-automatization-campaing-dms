# ReaTel Pro — SaaS MVP

Functional MVP for WhatsApp Campaigns, using Next.js + PostgreSQL (Prisma).

## Setup

1.  **Database**: Ensure you have a PostgreSQL database running (e.g. Supabase, Neon, or local Docker).
    -   Update `.env` with your `DATABASE_URL`.

2.  **Dependencies**:
    ```bash
    npm install
    ```

3.  **Initialize DB**:
    ```bash
    # Create tables
    npx prisma db push
    
    # Generate client
    npx prisma generate
    ```

4.  **Run**:
    ```bash
    npm run dev
    ```

## Features

-   **Auth**: Email/Password Registration & Login.
-   **Dashboard**: Send messages (Single & Mass), View History, Control Queue.
-   **Anti-Spam**: "Human" delay and message variations (OpenAI/Fallback). Customize delay in Dashboard Settings.
-   **Tracking**: All messages logged to Postgres.

## Env Vars

See `.env` for template.
-   `DATABASE_URL`: Postgres connection string.
-   `NEXTAUTH_SECRET`: Random string for session security.
-   `TWILIO_*`: Your Twilio credentials.
-   `OPENAI_API_KEY`: For AI variations.
