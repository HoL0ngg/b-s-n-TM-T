import { useState } from "react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = () => {
        alert(`Đăng ký với: ${username} / ${password}`);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <h3>Đăng ký</h3>
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
            <button className="btn btn-success w-100" onClick={handleRegister}>
                Đăng ký
            </button>
        </div>
    );
}
