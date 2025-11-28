import { defineConfig } from "@mikro-orm/postgresql";
import { Data } from "./entities/Data";
import { readFileSync } from "fs";

const db = process.env.POSTGRES_DB_FILE ? readFileSync(process.env.POSTGRES_DB_FILE, "utf8").trim() : undefined !;
const user = process.env.POSTGRES_USER_FILE ? readFileSync(process.env.POSTGRES_USER_FILE, "utf8").trim() : undefined !;
const password = process.env.POSTGRES_PASSWORD_FILE ? readFileSync(process.env.POSTGRES_PASSWORD_FILE, "utf8").trim() : undefined !;
const url = process.env.POSTGRES_URL_FILE ? readFileSync(process.env.POSTGRES_URL_FILE, "utf8").trim() : undefined !;
const port = process.env.POSTGRES_PORT_FILE ? readFileSync(process.env.POSTGRES_PORT_FILE, "utf8").trim() : undefined !;

if (!url || !db || !user || !password || !port) {
    throw new Error("environment variables not configured");
}

export default defineConfig({
    entities: [Data],
    dbName: db,
    user: user,
    password: password,
    host: url,
    port: parseInt(port),
    debug: true
});
