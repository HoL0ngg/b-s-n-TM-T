// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, setAuthToken } from "../api/jwt";
import type { UserType, UserProfileType } from "../types/UserType";
import { loginAdmin } from "../api/admin";
import { jwtDecode } from 'jwt-decode';

type AuthContextType = {
    user: UserType;
    userProfile: UserProfileType;
    loading: boolean;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => void;
    setUserProfile: (data: UserProfileType) => void;
    adminLogin: (email: string, password: string) => Promise<void>;
    setAdminAuth: (token: string, adminUser: UserType) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);

    interface DecodedToken {
        sub: string;
        role: "CUSTOMER" | "SHOP_OWNER" | "ADMIN";
        iat: number;
        exp: number;
    }

    const handleAuthError = (err: any) => {
        console.error("Lỗi xác thực:", err);
        logout();
    }
    // Khi app load: nếu có token, set header và fetch profile
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
            try {
                // 1. Giải mã token ngay tại frontend
                const decoded = jwtDecode<DecodedToken>(token);

                // 2. Quyết định API dựa trên 'role'
                if (decoded.role != 'ADMIN') {
                    // (Role là 'CUSTOMER' hoặc 'SHOP')
                    fetchProfile()
                        .then(res => {
                            setUser(res.data.user);
                            setUserProfile(res.data.userProfile);
                        })
                        .catch(handleAuthError)
                        .finally(() => setLoading(false));
                }
            }
            catch (err: any) {
                handleAuthError(err);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const loginWithToken = async (token: string) => {
        localStorage.setItem("token", token);
        setAuthToken(token);
        try {
            const res = await fetchProfile();
            setUser(res.data.user);
            setUserProfile(res.data.userProfile);
        } catch (error) {
            console.error("Lỗi fetch profile:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setAuthToken(null);
        setUser(null);
        setUserProfile(null);
    };

    const setAdminAuth = (token: string, adminUser: UserType) => {
        localStorage.setItem("token", token);
        setAuthToken(token); // Cập nhật header axios

        setUser(adminUser);
        setUserProfile(null); // Admin không có profile khách hàng
    };

    const adminLogin = async (sdt: string, password: string) => {
        const response = await loginAdmin(sdt, password);
        await loginWithToken(response);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, loginWithToken, logout, setUserProfile, adminLogin, setAdminAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
