// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, setAuthToken } from "../api/jwt";
import axios from "axios";

type User = { id: number; username: string; role?: string } | null;

type AuthContextType = {
    user: User;
    loading: boolean;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    // Khi app load: nếu có token, set header và fetch profile
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
            fetchProfile()
                .then(res => setUser(res.data.user))
                .catch(() => {
                    // token invalid/expired
                    localStorage.removeItem("token");
                    setAuthToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const loginWithToken = async (token: string) => {
        localStorage.setItem("token", token);
        setAuthToken(token);
        const res = await fetchProfile();
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
