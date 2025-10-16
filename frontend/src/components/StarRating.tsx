// import { FaStar } from "react-icons/fa";

export const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const percentage = (rating / 5) * 100;

    return (
        <div
            style={{
                position: "relative",
                display: "inline-block",
                fontSize: "32px",
                color: "#ccc",
            }}
        >
            {/* Lớp nền xám */}
            {"★★★★★"}
            {/* Lớp phủ vàng */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    overflow: "hidden",
                    width: `${percentage}%`,
                    color: "#ff7708",
                }}
            >
                {"★★★★★"}
            </div>
        </div>
    );
};
