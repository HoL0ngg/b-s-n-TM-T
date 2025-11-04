export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    if (!phoneNumber) {
        return false;
    }

    // 0 + 9 so hoặc +84 + 9 số
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;

    // Xóa khoảng trắng (nếu có) trước khi kiểm tra
    const cleanedPhoneNumber = phoneNumber.trim();

    // Dùng hàm test() của Regex để kiểm tra
    return phoneRegex.test(cleanedPhoneNumber);
};

export const isValidEmail = (email: string): boolean => {
    if (!email) return false;

    // Regex: [ký tự]@[ký tự].[ký tự]
    // (Không chứa khoảng trắng, @ ở phần tên và domain)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(String(email).toLowerCase().trim());
};

export const isEmpty = (value: string | null | undefined): boolean => {
    return value === null || value === undefined || value.trim() === '';
};

export const isLength = (
    value: string,
    options: { min?: number; max?: number }
): boolean => {
    if (isEmpty(value)) return false; // Thường không kiểm tra độ dài của chuỗi rỗng

    const len = value.trim().length;

    if (options.min !== undefined && len < options.min) {
        return false;
    }
    if (options.max !== undefined && len > options.max) {
        return false;
    }
    return true;
};

export const shortenAddress = (fullAddress: string): string => {
    if (!fullAddress) {
        return "";
    }

    // Các từ khóa để dừng lại (Case-insensitive)
    const stopKeywords = [
        "phường",
        "xã",
        "thị trấn",
        "quận",
        "huyện",
        "thành phố",
        "tp",
        "tỉnh",
        "ward",
        "province",
    ];

    const parts = fullAddress.split(",");
    const finalParts: string[] = [];

    for (const part of parts) {
        const trimmedPart = part.trim();
        const lowerCasePart = trimmedPart.toLowerCase();

        // Kiểm tra xem phần này có BẮT ĐẦU bằng từ khóa nào không
        const isStopWord = stopKeywords.some(keyword =>
            lowerCasePart.startsWith(keyword)
        );

        if (isStopWord) {
            break; // Dừng lại ngay khi gặp "Phường", "Quận"...
        }

        if (trimmedPart) {
            finalParts.push(trimmedPart);
        }
    }

    // Nối các phần hợp lệ lại bằng dấu cách và chuyển tất cả sang chữ thường
    return finalParts.join(" ").toLowerCase();
};