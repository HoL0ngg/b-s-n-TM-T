import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// --- 1. Cấu hình nơi lưu file (Lưu vào ổ đĩa) ---
const avatarStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, 'public/avatars');
    },

    // Quyết định tên file mới (duy nhất)
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Lấy user_id từ middleware 'checkAuth'
        const userId = (req as any).user.id;
        const extension = path.extname(file.originalname); // .png

        // Tên file cuối cùng: ví dụ '0987654321-avatar.png'
        // (Ghi đè avatar cũ nếu có)
        const newFileName = `${userId}-avatar${extension}`;
        cb(null, newFileName);
    }
});
// --- 2. Bộ lọc (Chỉ nhận PNG/JPEG) ---
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); // Chấp nhận
    } else {
        cb(new Error('Chỉ chấp nhận file PNG hoặc JPEG!'), false); // Từ chối
    }
};

// --- 3. Export middleware 'upload' ---
export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 } // Giới hạn 1MB
});