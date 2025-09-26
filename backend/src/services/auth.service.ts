// services/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { ENV } from "../config/env";

const SECRET_KEY = ENV.JWT_SECRET || "supersecret";

export async function login(phone_number: string, password: string) {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE phone_number = ?",
        [phone_number]
    );

    const user = (rows as any[])[0];
    if (!user) throw new Error("Sai tài khoản");

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) throw new Error("Sai mật khẩu");

    const token = jwt.sign(
        { id: user.phone_number, username: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    return token;
}

export async function register(phone_number: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await pool.query(
        "INSERT INTO users (phone_number, password) VALUES (?, ?)",
        [phone_number, hashedPassword]
    );

    return { id: (rows as any).insertId, phone_number };
}