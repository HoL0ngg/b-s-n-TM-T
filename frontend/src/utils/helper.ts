import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale'; // <-- Import locale Tiếng Việt

export const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "";

    // 1. Chuyển chuỗi timestamp thành đối tượng Date
    const date = new Date(timestamp);

    // 2. Gọi hàm
    return formatDistanceToNow(date, {
        addSuffix: true,  // <-- Thêm chữ "trước" (ago)
        locale: vi        // <-- Dùng Tiếng Việt
    });
}