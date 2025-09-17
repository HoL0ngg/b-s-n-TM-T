import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}))

// Tạo client OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}
);

app.post("/chat", async (req, res) => {
    const { message } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // model gọn nhẹ, giá rẻ
            messages: [
                { role: "system", content: "Bạn là chatbot hỗ trợ khách hàng cho cửa hàng TMĐT ShopX. Trả lời ngắn gọn, thân thiện." },
                { role: "user", content: message },
            ],
        });

        const reply = completion.choices[0].message?.content;
        res.json({ reply });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "Xin lỗi, có lỗi khi gọi OpenAI API." });
    }
});

app.listen(5000, () => {
    console.log("🚀 Backend chạy tại http://localhost:5000");
});
