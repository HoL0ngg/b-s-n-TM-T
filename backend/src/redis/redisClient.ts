import { createClient } from "redis";

const redisClient = createClient({
    url: "redis://localhost:6379", // Nếu chạy Docker thì vẫn là localhost
});

redisClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
    await redisClient.connect();
})();

export default redisClient;
