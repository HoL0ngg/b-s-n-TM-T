import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// --- HÀM HỖ TRỢ 1: Đảm bảo thư mục tồn tại ---
const ensureDirectoryExistence = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        // 'recursive: true' sẽ tạo tất cả các thư mục cha cần thiết
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Đã tạo thư mục: ${dirPath}`);
    }
};

// --- HÀM HỖ TRỢ 2: Bộ lọc file (Chỉ nhận PNG/JPEG) ---
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); // Chấp nhận
    } else {
        // Từ chối file (và báo lỗi)
        cb(new Error('Chỉ chấp nhận file PNG hoặc JPEG!'));
    }
};

// -------------------------------------------------------------------
// 1. CẤU HÌNH CHO AVATAR NGƯỜI DÙNG
// -------------------------------------------------------------------
const avatarStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/avatars');
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const userId = (req as any).user.id;
        const extension = path.extname(file.originalname);
        const newFileName = `${userId}-avatar${extension}`;
        cb(null, newFileName);
    }
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 }
}).single('avatar');

// -------------------------------------------------------------------
// 2. CẤU HÌNH CHO BANNER SỰ KIỆN (PROMOTION)
// -------------------------------------------------------------------
const promoBannerStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/promotions');
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const shopId = (req as any).user?.shop_id || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const newFileName = `shop-${shopId}-promo-${uniqueSuffix}${extension}`;
        cb(null, newFileName);
    }
});

export const uploadPromoBanner = multer({
    storage: promoBannerStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('banner_image');

// -------------------------------------------------------------------
// 3. THÊM MỚI: CẤU HÌNH CHO TRÌNH SOẠN THẢO (TIPTAP)
// -------------------------------------------------------------------
const editorImageStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        // Lưu vào thư mục chung cho các bài viết, mô tả...
        const uploadPath = path.join(__dirname, '../../public/uploads/editor_images');
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Tên file hoàn toàn ngẫu nhiên
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const newFileName = `editor-${uniqueSuffix}${extension}`;
        cb(null, newFileName);
    }
});

export const uploadEditorImage = multer({
    storage: editorImageStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');