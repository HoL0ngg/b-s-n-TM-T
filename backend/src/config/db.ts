// src/config/db.ts
import mysql from "mysql2/promise";
import { ENV } from "./env";

const pool = mysql.createPool({
    host: ENV.DB_HOST,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME,
    port: Number(ENV.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
