import { Request, Response } from "express";
import { login, register, changePassword, findUserByPhoneNumber } from "../services/auth.service";

export async function loginController(req: Request, res: Response) {
    try {
        const { username, password } = req.body;
        const token = await login(username, password);
        res.json({ token });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
}

export async function registerController(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body;
        const user = await register(username, email, password);
        res.json({ message: "Đăng ký thành công", user });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function changePasswordController(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const hihi = await changePassword(email, password);
        console.log(hihi);

        if (hihi.success)
            res.json({ message: "Đổi mật khẩu thành công" });
        else
            res.status(400).json({ message: "Đổi mật khẩu thất bại" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function profileController(req: Request, res: Response) {
    res.json({ message: "Welcome!", user: (req as any).user });
}

export async function getUserByPhoneNumber(req: Request, res: Response) {
    try {
        const user = await findUserByPhoneNumber(Number(req.params.id));
        if (!user) return res.status(404).json({ message: "không tìm thấy người dùng" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}