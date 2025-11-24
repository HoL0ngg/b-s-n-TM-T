// config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "basan",
    DB_PORT: process.env.DB_PORT || "3306",
    JWT_SECRET: process.env.JWT_SECRET || "djsauidjasdjasiodjisoads"
};
