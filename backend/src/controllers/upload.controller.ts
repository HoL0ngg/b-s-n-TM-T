import { Request, Response } from "express";

class UploadController {
    handleEditorImage = async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const imageUrl = `/uploads/editor_images/${req.file.filename}`; // Giả sử bạn lưu file trong thư mục 'uploads'
        return res.status(200).json({ url: imageUrl });
    }

}

export default new UploadController();