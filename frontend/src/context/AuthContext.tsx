// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, setAuthToken } from "../api/jwt";
import type { UserType, UserProfileType } from "../types/UserType";

type AuthContextType = {
    user: UserType;
    userProfile: UserProfileType;
    loading: boolean;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => void;
    setUserProfile: (data: UserProfileType) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfileType>(null);

    // Khi app load: nếu có token, set header và fetch profile
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
            fetchProfile()
                .then(res => {
                    // console.log(res.data);
                    setUser(res.data.user);
                    setUserProfile(res.data.userProfile);
                })
                .catch(() => {
                    // token invalid/expired
                    localStorage.removeItem("token");
                    setAuthToken(null);
                    setUser(null);
                    setUserProfile(null);
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
        setUserProfile(res.data.userProfile);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setAuthToken(null);
        setUser(null);
        // setUserProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, loginWithToken, logout, setUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
