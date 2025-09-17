import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumb";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        alert(`Đăng nhập với: ${username} / ${password}`);
    };

    return (
        <>
            <Breadcrumbs />
            <div className="container mt-5" style={{ maxWidth: "400px" }}>
                <h3>Đăng nhập</h3>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button className="btn btn-dark w-100" onClick={handleLogin}>
                    Đăng nhập
                </button>
            </div>
        </>
    );
}
