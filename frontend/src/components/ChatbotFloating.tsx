import { motion, useAnimation, useMotionValue } from "framer-motion";
import React, { useRef, useState } from "react";
import { LuBotMessageSquare } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
    role: "user" | "bot";
    content: string;
}

// Helper function to parse markdown links and convert to clickable elements
const parseMessageContent = (content: string, onLinkClick: (url: string) => void): (string | React.ReactElement)[] | string => {
    // Regex to match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        // Add the link
        const linkText = match[1];
        const linkUrl = match[2];
        parts.push(
            <a
                key={match.index}
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onLinkClick(linkUrl);
                }}
                style={{ color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer' }}
            >
                {linkText}
            </a>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
};

const ChatbotFloating: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const isDragging = useRef(false);
    const navigate = useNavigate();

    const handleLinkClick = (url: string) => {
        // Extract path from full URL if needed
        const path = url.replace(/^https?:\/\/[^\/]+/, '');
        navigate(path);
        setOpen(false); // Close chatbot after navigation
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Thêm tin nhắn user
        const newMessages: ChatMessage[] = [...messages, { role: "user" as "user", content: input }];
        setMessages(newMessages);

        setInput("");
        // Gọi backend
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
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

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const controls = useAnimation();

    const handleDragStart = () => {
        isDragging.current = true;
    };

    const handleDragEnd = async () => {
        // Khi người dùng thả chuột, quay về vị trí gốc
        await controls.start({
            x: 0,
            y: 0,
            transition: { type: "spring", stiffness: 200, damping: 15 },
        });
        setTimeout(() => {
            isDragging.current = false;
        }, 100);
    };

    const handleButtonClick = () => {
        if (isDragging.current) return;
        setOpen(true);
    };

    return (
        <motion.div
            drag
            style={{
                position: "fixed",
                bottom: 30,
                right: 30,
                x,
                y,
                cursor: "grab",
                zIndex: 1000,
            }}
            animate={controls}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Nút icon chatbot */}
            {!open && (
                <button
                    className="btn bg-primary rounded-circle shadow"
                    style={{
                        width: 60,
                        height: 60,
                        fontSize: 24,
                    }}
                    onClick={() => handleButtonClick()}
                >
                    <div className="d-flex align-items-center justify-content-center">
                        <LuBotMessageSquare color="white" size={30} />
                    </div>
                </button>
            )}

            {/* Cửa sổ chat */}
            {open && (
                <div
                    className="card shadow"
                    style={{
                        width: 320,
                        height: 420,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
                        <span>Nhân viên BáSàn</span>
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
                                className={`d-flex mb-2 ${msg.role === "user"
                                    ? "justify-content-end"
                                    : "justify-content-start"
                                    }`}
                            >
                                <div
                                    className={`p-2 rounded ${msg.role === "user"
                                        ? "bg-primary text-white"
                                        : "bg-light border"
                                        }`}
                                    style={{ maxWidth: "70%", whiteSpace: "pre-line" }}
                                >
                                    {msg.role === "bot"
                                        ? parseMessageContent(msg.content, handleLinkClick)
                                        : msg.content
                                    }
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
                            <button
                                className="btn bg-primary text-white"
                                onClick={sendMessage}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ChatbotFloating;
