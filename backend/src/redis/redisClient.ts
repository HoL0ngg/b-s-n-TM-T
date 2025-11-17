import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500) // retry nhẹ
    }
});

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on('connect', () => console.log('✅ Connected to Upstash Redis'));

(async () => {
    await redisClient.connect();
})();

export default redisClient;
