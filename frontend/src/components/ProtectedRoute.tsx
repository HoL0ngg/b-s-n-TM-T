// components/ProtectedRoute.tsx
import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = { children: JSX.Element };

export default function ProtectedRoute({ children }: Props) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // hoặc spinner

    if (!user) return <Navigate to="/login" replace />;

    return children;
}
