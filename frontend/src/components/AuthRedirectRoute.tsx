// components/AuthRedirectRoute.tsx
import { type JSX } from "react"
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = { children: JSX.Element };

export default function AuthRedirectRoute({ children }: Props) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) return <Navigate to="/user/profile" replace />;

    return children;
}
