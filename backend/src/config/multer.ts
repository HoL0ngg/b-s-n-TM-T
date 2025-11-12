import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

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

const ensureDirectoryExistence = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        // 'recursive: true' sẽ tạo tất cả các thư mục cha cần thiết
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Đã tạo thư mục: ${dirPath}`);
    }
};

const promoBannerStorage = multer.diskStorage({

    /**
     * Nơi lưu file:
     * Dùng path.join và __dirname để có đường dẫn tuyệt đối,
     * tránh lỗi "no such file or directory" (ENOENT).
     */
    destination: (req: Request, file: Express.Multer.File, cb) => {
        // __dirname trỏ đến /backend/dist/config
        // Chúng ta đi ngược ra 2 cấp để về gốc /backend
        // Sau đó đi vào /public/uploads/promotions
        const uploadPath = path.join(__dirname, '../../public/uploads/promotions');

        // Đảm bảo thư mục này tồn tại
        ensureDirectoryExistence(uploadPath);

        cb(null, uploadPath);
    },

    /**
     * Tên file:
     * Đặt tên file duy nhất để tránh bị ghi đè.
     */
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // 1. Lấy shop_id từ 'req.user' (đã được middleware 'checkAuth' gán vào)
        // (Chúng ta cần ép kiểu 'req' để TypeScript hiểu)
        const shopId = (req as any).user?.shop_id || 'unknown';

        // 2. Tạo phần đuôi duy nhất (timestamp)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        // 3. Lấy đuôi file gốc (ví dụ: ".png")
        const extension = path.extname(file.originalname);

        // Tên file cuối cùng: ví dụ: "shop-1-promo-167888999000-12345.png"
        const newFileName = `shop-${shopId}-promo-${uniqueSuffix}${extension}`;

        cb(null, newFileName);
    }
});

export const uploadPromoBanner = multer({
    storage: promoBannerStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
}).single('banner_image');