// src/config/db.ts
import mysql from "mysql2/promise";
import { ENV } from "./env";

const useSSL = ENV.DB_HOST !== 'localhost' && ENV.DB_HOST !== '127.0.0.1';

console.log(useSSL);


const pool = mysql.createPool({
    host: ENV.DB_HOST,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME,
    port: Number(ENV.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: useSSL ? { rejectUnauthorized: false } : undefined
});

pool.on('connection', (connection) => {
    connection.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");
});

export default pool;
