import { Request, Response } from "express";
import { login, register } from "../services/auth.service";

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
        const { username, password } = req.body;
        const user = await register(username, password);
        res.json({ message: "Đăng ký thành công", user });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function profileController(req: Request, res: Response) {
    res.json({ message: "Welcome!", user: (req as any).user });
}