import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import otpRoutes from "./routes/otp.route";
import chatRoutes from "./routes/chat.route";

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}))

app.use("/api/otp", otpRoutes);
app.use("/api/chat", chatRoutes);

app.listen(5000, () => {
    console.log("🚀 Backend chạy tại http://localhost:5000");
});
