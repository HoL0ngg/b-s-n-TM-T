import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import chatRoutes from "./routes/chat.route";
import mailRoutes from "./routes/mail.route";
import authRoutes from "./routes/auth.route";
import CategoryRouter from "./routes/category.route";

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}))

app.use("/api/chat", chatRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/jwt", authRoutes);
app.use("/api/categories", CategoryRouter);

app.listen(5000, () => {
    console.log("🚀 Backend chạy tại http://localhost:5000");
});
