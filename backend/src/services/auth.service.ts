// services/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { ENV } from "../config/env";

const SECRET_KEY = ENV.JWT_SECRET;

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
        { id: user.phone_number, email: user.email, username: "", avatar_url: user.avatar_url },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    return token;
}

export async function register(phone_number: string, email: string, password: string) {
    // Check if phone number already exists
    const [existingByPhone] = await pool.query("SELECT * FROM users WHERE phone_number = ?", [phone_number]) as [any[], any];
    if (existingByPhone.length > 0) {
        throw new Error("Số điện thoại đã được đăng ký");
    }

    // Check if email already exists
    const [existingByEmail] = await pool.query("SELECT phone_number FROM users WHERE email = ?", [email]) as [any[], any];
    if (existingByEmail.length > 0) {
        throw new Error("Email đã được đăng ký");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultAvatars = [
        'lion.png',
        'panda.png',
        'bear.png',
        'bee.png',
        'crab.png',
        'penguin.png'
    ];
    const AVATAR_BASE_URL = '/assets/avatar/';
    const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
    const randomAvatarFile = defaultAvatars[randomIndex];
    const defaultAvatarUrl = AVATAR_BASE_URL + randomAvatarFile;


    const [rows] = await pool.query(
        "INSERT INTO users (phone_number, email, password, avatar_url) VALUES (?, ?, ?, ?)",
        [phone_number, email, hashedPassword, defaultAvatarUrl]
    );

    await pool.query("INSERT INTO user_profile (username, dob, gender, updated_at, phone_number) values (?, ?, ?, ?, ?)", ['', '', 10, '', phone_number])

    return { id: (rows as any).insertId, phone_number };
}

export async function changePassword(email: string, password: string) {
    // Check if email already exists
    const [existingByEmail] = await pool.query("SELECT phone_number FROM users WHERE email = ?", [email]) as [any[], any];
    if (existingByEmail.length == 0) {
        throw new Error("Email chưa được đăng ký");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, email]
    );

    return { success: result.affectedRows > 0, affectedRows: result.affectedRows };
}

export async function findUserByPhoneNumber(id: number) {
    const [rows] = await pool.query("SELECT * FROM users WHERE phone_number = ?", [id]);
    return (rows as any[])[0];
}