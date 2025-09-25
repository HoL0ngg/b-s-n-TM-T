// config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    SPEEDSMS_API_KEY: process.env.SPEEDSMS_API_KEY || "",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    PORT: process.env.PORT || "5000",
};
