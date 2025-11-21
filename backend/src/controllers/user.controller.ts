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

    getDefaultAddressByuserIdController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const data = await userService.geDefaultAddressByuserIdService(id);
        res.status(200).json(data);
    }

    getUserProfileController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const data = await userService.getUserProfileService(id);
        res.status(200).json(data);
    }

    updateProfileController = async (req: Request, res: Response) => {
        try {
            const userPhone = (req as any).user.id;

            const profileData = req.body; // { name, gender, birthday }
            const file = req.file;

            const fieldsToUpdate: any = {
                name: profileData.name,
                gender: profileData.gender,
                birthday: profileData.birthday,
            };

            if (file) {
                const avatarPath = `/avatars/${file.filename}`;
                fieldsToUpdate.avatar_url = avatarPath;
            }

            const updatedUser = await userService.updateProfileService(userPhone, fieldsToUpdate);
            console.log(updatedUser);


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

    postChangeAddressDefault = async (req: Request, res: Response) => {
        const user_id = (req as any).user.id;
        const address_id = req.params.id;

        try {
            const data = await userService.ChangeAddressDefault(user_id, Number(address_id));
            res.status(200).json({ success: data });
        } catch (err) {
            console.error(err);
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