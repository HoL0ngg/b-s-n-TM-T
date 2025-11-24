import { useMemo } from 'react';
import { parseISO, format, isAfter, isBefore } from 'date-fns';
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

            // --- B. Định dạng lại ---
            const formattedStart = format(start, 'dd/MM/yyyy');
            const formattedEnd = format(end, 'dd/MM/yyyy');
            const dateRangeString = `${formattedStart} - ${formattedEnd}`;

            // --- C. Kiểm tra trạng thái ---
            let status: 'upcoming' | 'active' | 'ended';
            let statusText: string;
            let statusColor: string;

            if (isAfter(start, now)) {
                // Nếu startDate sau now => Sắp diễn ra
                status = 'upcoming';
                statusText = 'Sắp diễn ra';
                statusColor = 'text-warning';
            } else if (isBefore(end, now)) {
                // Nếu endDate trước now => Đã kết thúc
                status = 'ended';
                statusText = 'Đã kết thúc';
                statusColor = 'text-danger';
            } else {
                // Nếu now nằm giữa start và end => Đang diễn ra
                status = 'active';
                statusText = 'Đang diễn ra';
                statusColor = 'text-success';
            }

            return {
                dateRangeString,
                status,
                statusText,
                statusColor
            };
        } catch (error) {
            // Xử lý nếu ngày tháng bị lỗi
            console.error("Lỗi định dạng ngày:", error);
            return {
                dateRangeString: "Ngày không hợp lệ",
                status: 'ended' as const,
                statusText: 'Không xác định',
                statusColor: 'text-muted'
            };
        }
    }, [startDate, endDate]); // Phụ thuộc

    // 3. Render
    return (
        <div className="date-display-container">

            {/* Thẻ <span> cho trạng thái */}
            <span
                className={dateInfo.statusColor}
                style={{ fontWeight: 600 }}
            >
                {dateInfo.statusText}
            </span>

            {/* Thẻ <span> cho ngày tháng */}
            <span className="ms-2 text-muted">
                ({dateInfo.dateRangeString})
            </span>

        </div>
    );
}