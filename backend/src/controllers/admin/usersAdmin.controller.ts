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
}

export default new usersAdminController();