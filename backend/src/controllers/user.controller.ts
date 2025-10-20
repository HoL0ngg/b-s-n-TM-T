import { Request, Response } from "express";
import { getUserByIdService } from "../services/user.service";

export const getUserByIdController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await getUserByIdService(id);
    res.status(200).json(data);
}