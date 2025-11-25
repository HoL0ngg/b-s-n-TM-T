import { Router } from "express";
// SỬA: Import thêm verifyToken từ auth.middleware
import { checkShopOwner, verifyToken } from "../middleware/auth.middleware"; 
import { uploadEditorImage } from "../config/multer";
import uploadController from "../controllers/upload.controller";

const UploadRouter = Router();

// SỬA: Thêm verifyToken vào vị trí đầu tiên của chuỗi middleware
UploadRouter.post("/image", verifyToken, checkShopOwner, uploadEditorImage, uploadController.handleEditorImage);

export default UploadRouter;