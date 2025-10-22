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

export const postAddressUserService = async (id: string, data: any) => {
    let connection;
    try {
        // 1. Lấy 1 connection từ pool
        connection = await pool.getConnection();

        // 2. Bắt đầu transaction
        await connection.beginTransaction();

        // 3. Gọi Repository để tạo địa chỉ (truyền connection vào)
        const newAddressId = await createAddress(data, connection);

        if (newAddressId <= 0) {
            throw new Error('Tạo địa chỉ thất bại');
        }

        // 4. Gọi Repository để liên kết (truyền connection vào)
        await linkUser(id, newAddressId, data, connection);

        // 5. Commit nếu mọi thứ OK
        await connection.commit();

        console.log(`Transaction thành công cho user ${id}`);
        return { id: newAddressId, ...data };

    } catch (error: any) {
        // 6. Rollback nếu có lỗi
        if (connection) {
            await connection.rollback();
        }
        console.error('Lỗi Service (đã rollback):', error.message);
        // Ném lỗi ra để Controller bắt
        throw new Error('Lỗi trong quá trình xử lý CSDL');
    } finally {
        // 7. Luôn trả connection về pool
        if (connection) {
            connection.release();
        }
    }
}

export const createAddress = async (data: any, connection: any): Promise<number> => {
    const { city, ward, street } = data;
    const query = 'INSERT INTO Address (city, ward, street) VALUES (?, ?, ?)';

    // Dùng connection.query() chứ không phải pool.query()
    const [result] = await connection.query(query, [city, ward, street]);
    return result.insertId;
}

export const linkUser = async (id: string, newAddressId: number, data: any, connection: any) => {
    const query = 'INSERT INTO address_user (phone_number, address_id, user_name, phone_number_jdo) VALUES (?, ?, ?, ?)';
    await connection.query(query, [id, newAddressId, data.user_name, data.phone_number_jdo]);
}