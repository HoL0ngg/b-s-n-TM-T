export interface UserAdminType {
    phone: string;          // khóa chính
    name: string;       // từ user_profile.username
    email: string;
    password?: string;      // optional, dùng khi add/edit
    role: "customer" | "admin" | "shop_owner";
    status: number;         // 1 = active, 0 = khóa
    created_at: string;
    avatar_url?: string;    // optional
    dob?: string;           // "YYYY-MM-DD" format
    gender?: 0 | 1 | 2;     // 0 = nữ, 1 = nam, 2 = khác
}