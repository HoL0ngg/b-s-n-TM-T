import { Request, Response } from "express";
import { getUserByIdService, getAddressByuserIdService, getUserProfileService, updateProfileService } from "../services/user.service";

export const getUserByIdController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await getUserByIdService(id);
    res.status(200).json(data);
}

export const getAddressByuserIdController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await getAddressByuserIdService(id);
    res.status(200).json(data);
}

export const getUserProfileController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await getUserProfileService(id);
    res.status(200).json(data);
}

export const updateProfileController = async (req: Request, res: Response) => {
    try {
        const userPhone = req.params.id;

        const profileData = req.body; // { name, gender, birthday }

        const updatedUser = await updateProfileService(userPhone, profileData);

        res.status(200).json({
            message: 'Cập nhật thành công!',
            user: updatedUser, // Gửi lại profile mới cho frontend "reload"
        });

    } catch (error: any) {
        if (error.statusCode === 403) {
            return res.status(403).json({ message: error.message });
        }

        // Lỗi chung của server
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
}