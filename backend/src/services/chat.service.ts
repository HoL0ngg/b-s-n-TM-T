import OpenAI from "openai";
import { ENV } from "../config/env";

const openai = new OpenAI({
    apiKey: ENV.OPENAI_API_KEY
});

export async function getChatReply(message: string): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Bạn là nhân viên trang web thương mại điện tử. Hãy trả lời ngắn gọn và thân thiện",
                },
                { role: "user", content: message },
            ],
        });

        return completion.choices[0].message?.content || "Xin lỗi, không có phản hồi.";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("Có lỗi khi gọi OpenAI API");
    }
}