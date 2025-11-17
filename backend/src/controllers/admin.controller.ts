import { Request, Response } from "express";
import { loginAdminAccount } from "../services/auth.service";

class AdminController {
    loginAdmin = async (req: Request, res: Response) => {
        try {
            const { sdt, password } = req.body;
            console.log(sdt, password);

            const { token, user } = await loginAdminAccount(sdt, password);

            res.json({ token, user });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}

export default new AdminController();