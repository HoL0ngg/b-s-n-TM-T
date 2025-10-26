import { Request, Response } from "express";
import userService from "../services/user.service";

class userController {
    getUserByIdController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const data = await userService.getUserByIdService(id);
        res.status(200).json(data);
    }

    getAddressByuserIdController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const data = await userService.getAddressByuserIdService(id);
        res.status(200).json(data);
    }

    getUserProfileController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const data = await userService.getUserProfileService(id);
        res.status(200).json(data);
    }

    updateProfileController = async (req: Request, res: Response) => {
        try {
            const userPhone = req.params.id;

            const profileData = req.body; // { name, gender, birthday }

            const updatedUser = await userService.updateProfileService(userPhone, profileData);

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

    postAddressUserController = async (req: Request, res: Response) => {
        try {
            const data = req.body;
            console.log(data);

            const userPhone = req.params.id;
            await userService.postAddressUserService(userPhone, data);
            res.status(200).json({ message: 'Ngon' });
        } catch (Err) {
            console.log(Err);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

}

export default new userController();