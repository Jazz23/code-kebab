import "dotenv/config";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

console.log("Wiping database...");
await client`DROP SCHEMA public CASCADE`;
await client`CREATE SCHEMA public`;
await client`DROP SCHEMA IF EXISTS drizzle CASCADE`;
console.log("Database wiped.");

await client.end();
