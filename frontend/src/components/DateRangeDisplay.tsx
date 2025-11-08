import { useMemo } from 'react';
import { parseISO, format, isWithinInterval } from 'date-fns';
// import { vi } from 'date-fns/locale'; // (Nếu bạn muốn định dạng chữ, ví dụ: "Tháng 11")

interface DateRangeDisplayProps {
    startDate: string; // "2025-11-06T07:27:15.000Z"
    endDate: string;   // "2025-11-16T07:27:19.000Z"
}

export default function DateRangeDisplay({ startDate, endDate }: DateRangeDisplayProps) {

    // 1. Dùng useMemo để tính toán, chỉ chạy lại khi props thay đổi
    const dateInfo = useMemo(() => {
        try {
            // --- A. Chuyển chuỗi thành đối tượng Date ---
            const start = parseISO(startDate);
            const end = parseISO(endDate);
            const now = new Date(); // Lấy thời gian hiện tại

            // --- B. Định dạng lại (Goal 1) ---
            const formattedStart = format(start, 'dd/MM/yyyy');
            const formattedEnd = format(end, 'dd/MM/yyyy');
            const dateRangeString = `${formattedStart} - ${formattedEnd}`;

            // --- C. Kiểm tra (Goal 2) ---
            // (isWithinInterval kiểm tra: start <= now <= end)
            const isActive = isWithinInterval(now, { start, end });

            return {
                dateRangeString, // (ví dụ: "06/11/2025 - 16/11/2025")
                isActive,
            };
        } catch (error) {
            // Xử lý nếu ngày tháng bị lỗi
            console.error("Lỗi định dạng ngày:", error);
            return { dateRangeString: "Ngày không hợp lệ", isActive: false };
        }
    }, [startDate, endDate]); // Phụ thuộc

    // 3. Render (Goal 3)
    return (
        <div className="date-display-container">

            {/* Thẻ <span> cho trạng thái (Xanh/Đỏ) */}
            <span
                className={dateInfo.isActive ? 'text-success' : 'text-danger'}
                style={{ fontWeight: 600 }}
            >
                {dateInfo.isActive ? "Đang diễn ra" : "Đã kết thúc"}
            </span>

            {/* Thẻ <span> cho ngày tháng */}
            <span className="ms-2 text-muted">
                ({dateInfo.dateRangeString})
            </span>

        </div>
    );
}