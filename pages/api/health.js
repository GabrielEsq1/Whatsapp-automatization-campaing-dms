export default async function handler(req, res) {
    // Vercel injects the env var automatically
    const dbUrl = process.env.DATABASE_URL || "not set";
    res.status(200).json({
        status: "ok",
        databaseUrl: dbUrl,
    });
}
