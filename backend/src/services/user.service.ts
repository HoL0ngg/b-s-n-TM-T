import pool from "../config/db";

import type { User } from "../models/user.model";

export const getUserByIdService = async (id: string): Promise<User> => {
    const [row] = await pool.query("select * from users where phone_number = ?", [id]) as [User[], any];
    return row[0] as User;
}