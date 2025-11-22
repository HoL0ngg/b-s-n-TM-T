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

// --- HÀM HỖ TRỢ 2: Bộ lọc file (Chỉ nhận PNG/JPEG/WEBP) ---
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Thêm 'image/webp' vì webp nhẹ và tốt cho web
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
        cb(null, true); // Chấp nhận
    } else {
        // Từ chối file (và báo lỗi)
        cb(new Error('Chỉ chấp nhận file ảnh (PNG, JPEG, WEBP)!'));
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
    limits: { fileSize: 2 * 1024 * 1024 } // Tăng nhẹ lên 2MB cho thoải mái
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
// 3. CẤU HÌNH CHO TRÌNH SOẠN THẢO (TIPTAP)
// -------------------------------------------------------------------
const editorImageStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/editor_images');
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
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

// Đường dẫn: backend/src/config/multer.ts

// ... (Phần 1, 2, 3 giữ nguyên) ...

// -------------------------------------------------------------------
// 4. CẤU HÌNH CHO ẢNH SẢN PHẨM (MAIN + VARIATIONS)
// -------------------------------------------------------------------
const productStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/products');
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        // Đặt tên file
        const newFileName = `product-${uniqueSuffix}${extension}`;
        cb(null, newFileName);
    }
});

// SỬA: Dùng .any() để chấp nhận cả 'product_image' và 'variation_image_0', 'variation_image_1'...
export const uploadProductImage = multer({ 
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: fileFilter
}).any();