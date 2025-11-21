import { Router } from "express";
import { checkShopOwner } from "../middleware/auth.middleware";
import { uploadEditorImage } from "../config/multer";
import uploadController from "../controllers/upload.controller";

const UploadRouter = Router();

UploadRouter.post("/image", checkShopOwner, uploadEditorImage, uploadController.handleEditorImage);

export default UploadRouter;