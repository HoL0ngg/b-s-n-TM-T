import pool from "../config/db";

import type { Address, User, UserProfile } from "../models/user.model";

export const getUserByIdService = async (id: string): Promise<User> => {
    const [row] = await pool.query("select * from users where phone_number = ?", [id]) as [User[], any];
    return row[0] as User;
}

export const getAddressByuserIdService = async (id: string): Promise<Address[]> => {
    const [rows] = await pool.query("select id, city, ward, street, home_number, is_default, user_name, phone_number_jdo from address Join address_user on address_id = id where phone_number = ? Group by id", [id]) as [Address[], any];
    return rows as Address[];
}

export const getUserProfileService = async (id: string): Promise<UserProfile> => {
    const [row] = await pool.query(`SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, updated_at FROM user_profile WHERE phone_number = ?`, [id]) as [UserProfile[], any];
    return row[0] as UserProfile;
}

export const updateProfileService = async (id: string, data: any) => {
    console.log(data);

    const { name, gender, birthday } = data;
    const [updateResult] = await pool.query(
        `UPDATE user_profile 
        SET username = ?, gender = ?, dob = ?, updated_at = NOW() 
        WHERE phone_number = ?`,
        [name, gender, birthday, id]
    ) as [any[], any];

    if (updateResult.length === 0) {
        throw new Error('Cập nhật thất bại');
    }

    const [updatedUserRows] = await pool.query(
        `SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob FROM user_profile WHERE phone_number = ?`,
        [id]
    ) as [any[], any];

    return updatedUserRows[0];
}