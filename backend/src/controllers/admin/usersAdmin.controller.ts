import { Request, Response } from "express"
import userService from "../../services/user.service"
import { log } from "console"
import { parse } from "path";

class usersAdminController {
    getSellersController = async (req: Request, res: Response) => {
        try {
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const search = req.query.search as string | undefined;
            const users = await userService.getSellersSerivce(status, page, limit, search);
            res.status(200).json(users);
        } catch (error) {
            log("Lỗi trong getUsersByStatusController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    getBuyersController = async (req: Request, res: Response) => {
        try {
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const search = req.query.search as string | undefined;
            const users = await userService.getBuyersService(status, page, limit, search);
            res.status(200).json(users);

        } catch (error) {
            log("Lỗi trong getUsersByStatusController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    updateUserStatusController = async (req: Request, res: Response) => {
        try {
            const phone = req.params.phone;
            const { status } = req.body;
            const success = await userService.updateUserStatusService(phone, status);
            if (!success) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            res.status(200).json({ message: 'Cập nhật trạng thái người dùng thành công' });
        } catch (error) {
            log("Lỗi trong updateUserStatusController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    createUserController = async (req, res) => {
        try {
            const result = await userService.createUserService(req.body);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    };
    updateUserController = async (req, res) => {
        try {
            const phone = req.params.phone;
            const result = await userService.updateUserService(phone, req.body);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    };

}
export default new usersAdminController();