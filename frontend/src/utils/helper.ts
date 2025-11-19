import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale'; // <-- Import locale Tiếng Việt
import Swal from 'sweetalert2';

const today = new Date();

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

export const formattedDate = format(today, "d 'tháng' M 'năm' yyyy", { locale: vi });

export const handleSwalAlert = (title: string, text: string, icon?: any) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon || 'info',
        confirmButtonText: 'OK'
    });
}