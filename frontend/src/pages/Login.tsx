import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumb";
import { login } from "../api/jwt";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const { loginWithToken } = useAuth();
    const navigator = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await login(username, password);
            console.log(res);

            const token = res.token;
            await loginWithToken(token);
            navigator("/");
            alert("dang nhap thanh cong");
        } catch (err: any) {
            console.log(err);

            alert(err.response?.data?.message || "Login thất bại");
            setLoading(false);
        }
    };

    return (
        <>
            <Breadcrumbs />
            <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="card shadow-lg" style={{ maxWidth: "450px", width: "100%" }}>
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">Đăng nhập</h3>
                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLogin();
                            }}
                        >
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    className="form-check-input"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMe" className="form-check-label">Ghi nhớ đăng nhập</label>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading ? "Đang xử lý..." : "Đăng nhập"}
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <small>
                                <a href="/forgot-password" className="text-decoration-none">Quên mật khẩu?</a>
                            </small>
                        </div>
                        <hr />
                        <div className="text-center">
                            <small>
                                Chưa có tài khoản? <a href="/register" className="text-decoration-none">Đăng ký</a>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}