// controllers/chatController.ts
import { Request, Response } from "express";
import { getChatReply } from "../services/chat.service";

export async function chatHandler(req: Request, res: Response) {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: "Thiếu tin nhắn." });
    }

    try {
        const reply = await getChatReply(message);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ reply: "Xin lỗi, có lỗi khi gọi OpenAI API." });
    }
}
