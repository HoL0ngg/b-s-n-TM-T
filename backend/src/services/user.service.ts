import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import bcrypt from "bcrypt";

import type { Address, User, UserAdmin, UserProfile } from "../models/user.model";

class userService {
    getUserByIdService = async (id: string): Promise<User> => {
        const [row] = await pool.query("select * from users where phone_number = ?", [id]) as [User[], any];
        return row[0] as User;
    }
    getAddressByuserIdService = async (id: string): Promise<Address[]> => {
        const [rows] = await pool.query("select id, city, ward, street, home_number, is_default, user_name, phone_number_jdo from address Join address_user on address_id = id where phone_number = ? Group by id", [id]) as [Address[], any];
        return rows as Address[];
    }

    geDefaultAddressByuserIdService = async (id: string): Promise<Address> => {
        const [rows] = await pool.query("select id, city, ward, street, home_number, is_default, user_name, phone_number_jdo from address Join address_user on address_id = id where phone_number = ? AND is_default = 1", [id]) as [Address[], any];
        return rows[0] as Address;
    }
    getUserProfileService = async (id: string): Promise<UserProfile> => {
        const [row] = await pool.query(`SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, updated_at FROM user_profile WHERE phone_number = ?`, [id]) as [UserProfile[], any];
        return row[0] as UserProfile;
    }
    updateProfileService = async (id: string, data: any) => {
        await pool.query(
            "UPDATE user_profile SET username = ?, gender = ?, dob = ? WHERE phone_number = ?",
            [data.name, data.gender, data.birthday, id]
        );

        // (Cập nhật 'users' nếu có ảnh mới)
        if (data.avatar_url) {
            await pool.query(
                "UPDATE users SET avatar_url = ? WHERE phone_number = ?",
                [data.avatar_url, id]
            );
        }
        console.log(id);


        const [updatedUserRows] = await pool.query(
            `SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, avatar_url FROM user_profile JOIN users on users.phone_number = user_profile.phone_number WHERE user_profile.phone_number = ?`,
            [id]
        ) as [any[], any];

        console.log(updatedUserRows);

        return updatedUserRows[0];
    }
    postAddressUserService = async (id: string, data: any) => {
        let connection;
        try {
            // 1. Lấy 1 connection từ pool
            connection = await pool.getConnection();

            // 2. Bắt đầu transaction
            await connection.beginTransaction();

            // 3. Gọi Repository để tạo địa chỉ (truyền connection vào)
            const newAddressId = await this.createAddress(data, connection);

            if (newAddressId <= 0) {
                throw new Error('Tạo địa chỉ thất bại');
            }

            // 4. Gọi Repository để liên kết (truyền connection vào)
            await this.linkUser(id, newAddressId, data, connection);

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
    ChangeAddressDefault = async (user_id: number, address_id: number) => {
        const tmp = `UPDATE address_user set is_default = 0 WHERE phone_number = ?`;
        await pool.query(tmp, [user_id]);
        const hihi = `UPDATE address_user set is_default = 1 WHERE phone_number = ? AND address_id = ?`;
        const [row] = await pool.query(hihi, [user_id, address_id]) as [any[], any];
        return row.length > 0;

    }
    createAddress = async (data: any, connection: any): Promise<number> => {
        const { city, ward, street } = data;
        const query = 'INSERT INTO address (city, ward, street) VALUES (?, ?, ?)';

        // Dùng connection.query() chứ không phải pool.query()
        const [result] = await connection.query(query, [city, ward, street]);
        return result.insertId;
    }
    linkUser = async (id: string, newAddressId: number, data: any, connection: any) => {
        if (data.isDefault) {
            const tmp = `UPDATE address_user set is_default = 0 WHERE phone_number = ?`;
            connection.query(tmp, [id]);
        }
        const [countRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM address_user WHERE phone_number = ?",
            [id]
        );
        let hihi = false;
        if (countRows[0].count == 0) hihi = true;
        hihi = data.isDefault || hihi;
        const query = 'INSERT INTO address_user (phone_number, address_id, user_name, phone_number_jdo, is_default) VALUES (?, ?, ?, ?, ?)';
        await connection.query(query, [id, newAddressId, data.user_name, data.phone_number_jdo, hihi]);
    }

    updateAvatar = async (avatarPath: string, userId: string) => {
        const [countRows] = await pool.query(
            "UPDATE users SET avatar_url = ? WHERE phone_number = ?",
            [avatarPath, userId]
        ) as [any[], any];
        return countRows.length > 0;
    }

    getSellersSerivce = async (status: string, page: number, limit: number, searchTerm?: string): Promise<{ users: UserAdmin[], totalPages: number }> => {
        try {
            let whereClause = "WHERE 1=1";
            const params: any[] = [];

            if (status !== "all") {
                whereClause += " AND u.status = ?";
                params.push(Number(status));
            }
            if (searchTerm) {
                whereClause += " AND (uf.username LIKE ? OR u.email LIKE ?)";
                params.push(`%${searchTerm}%`, `%${searchTerm}%`);
            }
            // console.log("Search Term in Service:", searchTerm);
            const countQuery = `
            SELECT COUNT(*) AS total
            FROM users AS u
            JOIN shops s ON u.phone_number = s.owner_id
            JOIN user_profile uf ON u.phone_number = uf.phone_number
            ${whereClause};
        `;
            const [countResult]: any = await pool.query(countQuery, params);
            const total = countResult[0]?.total || 0;
            const totalPage = Math.ceil(total / limit);

            let query = `
            SELECT u.phone_number as phone, u.email, u.status, u.created_at, uf.username AS name
            FROM users u
            JOIN user_profile uf ON u.phone_number = uf.phone_number
            JOIN shops s ON s.owner_id = u.phone_number 
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?;
        `;
            const dataParams = [...params, limit, (page - 1) * limit];
            const [rows]: any = await pool.query(query, dataParams);
            return {
                users: rows as UserAdmin[],
                totalPages: totalPage,
            };
        } catch (error) {
            console.error("Lỗi trong getUsersByStatusController:", error);
            throw error;
        }
    }
    getBuyersService = async (status: string, page: number, limit: number, searchTerm?: string): Promise<{ users: UserAdmin[], totalPages: number }> => {
        try {
            let whereClause = "WHERE 1=1";
            const params: any[] = [];

            if (status !== "all") {
                whereClause += " AND u.status = ?";
                params.push(Number(status));
            }
            if (searchTerm) {
                whereClause += " AND (uf.username LIKE ? OR u.email LIKE ?)";
                params.push(`%${searchTerm}%`, `%${searchTerm}%`);
            }
            whereClause += " AND u.role = ?";
            params.push("customer");
            const countQuery = `
            SELECT COUNT(*) AS total
            FROM users AS u
            JOIN user_profile uf ON u.phone_number = uf.phone_number  
            ${whereClause};
        `;
            const [countResult]: any = await pool.query(countQuery, params);
            const total = countResult[0]?.total || 0;
            const totalPage = Math.ceil(total / limit);

            // console.log("Total buyers found:", total);
            // console.log("Total pages calculated:", totalPage);
            // console.log("limit:", limit);
            let query = `
            SELECT u.phone_number as phone, 
                u.email, u.status, 
                u.created_at, 
                uf.username AS name, 
                uf.gender, 
                DATE_FORMAT(uf.dob, '%Y-%m-%d') as dob
            FROM users u
            JOIN user_profile uf ON u.phone_number = uf.phone_number                        
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?;
        `;
            const dataParams = [...params, limit, (page - 1) * limit];
            const [rows]: any = await pool.query(query, dataParams);
            // console.log(rows);
            return {
                users: rows as UserAdmin[],
                totalPages: totalPage,
            };
        } catch (error) {
            console.error("Lỗi trong getUsersByStatusController:", error);
            throw error;
        }
    }
    updateUserStatusService = async (phone: string, status: number) => {
        const query = `UPDATE users SET status = ? WHERE phone_number = ?`;
        const [result] = await pool.query(query, [status, phone]);
        const affectedRows = (result as any).affectedRows;
        return affectedRows > 0;
    }
    getShopOwnerInformation = async (shopId: number): Promise<UserAdmin> => {
        const query = `
            SELECT u.phone_number as phone, u.email, u.status, u.created_at, uf.username AS name
            FROM shops s
            JOIN users u ON u.phone_number = s.owner_id
            JOIN user_profile uf ON uf.phone_number = u.phone_number
            WHERE s.id = ?
        `;
        const [rows] = await pool.query(query, [shopId]);
        return rows[0] as UserAdmin;
    }

    submitReviewService = async (userPhone: string, orderId: number, reviewText: string, rating: number) => {
        // Get all products from the order
        const [orderItems] = await pool.query(
            `SELECT product_id FROM order_items WHERE order_id = ?`,
            [orderId]
        ) as [any[], any];

        // Insert a review for each product in the order
        for (const item of orderItems) {
            const query = `
                INSERT INTO productreviews (user_id, comment, rating, created_at, product_id)
                VALUES (?, ?, ?, NOW(), ?)
            `;
            await pool.query(query, [userPhone, reviewText, rating, item.product_id]);
        }

        // Mark the order as reviewed to prevent duplicate reviews
        await pool.query(
            `UPDATE orders SET is_reviewed = 1 WHERE order_id = ?`,
            [orderId]
        );
    }

    checkOrderReviewedService = async (orderId: number): Promise<boolean> => {
        const [rows] = await pool.query(
            `SELECT is_reviewed FROM orders WHERE order_id = ?`,
            [orderId]
        ) as [any[], any];

        return rows.length > 0 && rows[0].is_reviewed === 1;
    }

    createUserService = async (data) => {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const {
                phone,
                email,
                password,
                role,
                dob,
                name,
                gender
            } = data;
            const [existingUser] = await connection.query<RowDataPacket[]>(`SELECT phone_number FROM users WHERE phone_number = ?`, [phone]);
            if (existingUser.length > 0) {
                return { message: "Số điện thoại đã tồn tại!", success: false };
            }
            // console.log(dob);

            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert users
            await connection.query(
                `INSERT INTO users (phone_number, email, password, role)
             VALUES (?, ?, ?, ?)`,
                [phone, email, hashedPassword, role || "customer"]
            );
            // Insert user_profile
            await connection.query(
                `INSERT INTO user_profile (phone_number, username, gender, dob,updated_at)
             VALUES (?, ?, ?, ?, NOW())`,
                [phone, name || null, gender || null, dob || null]
            );

            await connection.commit();

            return { message: "Thêm người dùng mới thành công!", success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };
    updateUserService = async (phone_number, data) => {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const {
                email,
                password,
                status,
                role,
                name,
                dob,
                gender
            } = data;

            // ==== UPDATE USERS ====
            const userFields: string[] = [];
            const userValues: (string | number | null)[] = [];


            if (email !== undefined) {
                userFields.push("email = ?");
                userValues.push(email);
            }
            if (password !== undefined) {
                const hashed = await bcrypt.hash(password, 10);
                userFields.push("password = ?");
                userValues.push(hashed);
            }
            if (status !== undefined) {
                userFields.push("status = ?");
                userValues.push(status);
            }
            if (role !== undefined) {
                userFields.push("role = ?");
                userValues.push(role);
            }

            if (userFields.length > 0) {
                const sql = `UPDATE users SET ${userFields.join(", ")} WHERE phone_number = ?`;
                userValues.push(phone_number);

                await connection.query(sql, userValues);
            }

            // ==== UPDATE USER PROFILE ====
            const profileFields: string[] = [];
            const profileValues: (string | number | null)[] = [];

            if (name !== undefined) {
                profileFields.push("username = ?");
                profileValues.push(name);
            }
            if (dob !== undefined) {
                profileFields.push("dob = ?");
                profileValues.push(dob);
            }
            if (gender !== undefined) {
                profileFields.push("gender = ?");
                profileValues.push(gender);
            }

            if (profileFields.length > 0) {
                profileFields.push("updated_at = NOW()");
                const sql = `UPDATE user_profile SET ${profileFields.join(", ")} WHERE phone_number = ?`;
                profileValues.push(phone_number);

                await connection.query(sql, profileValues);
            }

            await connection.commit();

            return { message: "Cập nhật người dùng thành công!" };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };
}
export default new userService();