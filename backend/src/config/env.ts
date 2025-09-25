// config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
};
