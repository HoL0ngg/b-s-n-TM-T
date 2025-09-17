import React, { useState } from "react";

interface ChatMessage {
    role: "user" | "bot";
    content: string;
}

const ChatbotFloating: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Thêm tin nhắn user
        const newMessages: ChatMessage[] = [...messages, { role: "user" as "user", content: input }];
        setMessages(newMessages);

        setInput("");
        // Gọi backend
        try {
            const res = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();
            console.log(data);


            setMessages([
                ...newMessages,
                { role: "bot", content: data.reply || "Xin lỗi, tôi chưa hiểu câu hỏi." },
            ]);
        } catch (err) {
            setMessages([
                ...newMessages,
                { role: "bot", content: "⚠️ Lỗi kết nối server." },
            ]);
        }

    };

    return (
        <>
            {/* Nút icon chatbot */}
            {!open && (
                <button
                    className="btn btn-primary rounded-circle shadow"
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        width: "60px",
                        height: "60px",
                        fontSize: "24px",
                    }}
                    onClick={() => setOpen(true)}
                >
                    💬
                </button>
            )}

            {/* Cửa sổ chat */}
            {open && (
                <div
                    className="card shadow"
                    style={{
                        position: "fixed",
                        bottom: "80px",
                        right: "20px",
                        width: "320px",
                        height: "420px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
                        <span>ShopBot</span>
                        <button
                            className="btn btn-sm btn-light"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body chat */}
                    <div
                        className="card-body overflow-auto"
                        style={{ flex: 1, backgroundColor: "#f8f9fa" }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`d-flex mb-2 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"
                                    }`}
                            >
                                <div
                                    className={`p-2 rounded ${msg.role === "user"
                                        ? "bg-primary text-white"
                                        : "bg-light border"
                                        }`}
                                    style={{ maxWidth: "70%" }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="card-footer">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control shadow"
                                placeholder="Nhập câu hỏi..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            />
                            <button className="btn btn-primary" onClick={sendMessage}>
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotFloating;
