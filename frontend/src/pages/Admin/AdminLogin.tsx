import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginAdmin } from '../../api/admin';

const ADMIN_LOGO_URL = "/assets/admin-logo.svg";

export default function AdminLogin() {
    const [SDT, setSDT] = useState("");
    const [password, setPassword] = useState("");

    // State cho thông báo lỗi và loading
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { setAdminAuth } = useAuth(); // (Giả sử bạn có hàm login riêng)
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await loginAdmin(SDT, password);
            setAdminAuth(res.token, res.user);
            navigate('/admin');

        } catch (err: any) {
            setError(err.response?.data?.message || "SDT hoặc mật khẩu không chính xác.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light px-3">

            {/* Sử dụng card của Bootstrap 5 */}
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="card-body p-4 p-md-5">

                    {/* --- Logo & Tiêu đề --- */}
                    <div className="text-center mb-4">
                        <img
                            src={ADMIN_LOGO_URL}
                            alt="Admin Logo"
                            style={{ height: '50px' }}
                        />
                        <h3 className="mt-3 fw-bold">Admin Dashboard</h3>
                        <p className="text-muted">Đăng nhập vào tài khoản quản trị</p>
                    </div>

                    {/* --- Form Đăng nhập --- */}
                    <form onSubmit={handleSubmit}>

                        {/* 1. SDT (Dùng form-floating) */}
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="floatingSDT"
                                placeholder="name@example.com"
                                value={SDT}
                                onChange={(e) => setSDT(e.target.value)}
                                required
                            />
                            <label htmlFor="floatingSDT">Số điện thoại</label>
                        </div>

                        {/* 2. Mật khẩu (Dùng form-floating) */}
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="floatingPassword"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="floatingPassword">Mật khẩu</label>
                        </div>

                        {/* 3. Link Quên mật khẩu */}
                        <div className="text-end mb-3">
                            <a href="/admin/forgot-password" className="small text-decoration-none">
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* 4. Hiển thị Lỗi (nếu có) */}
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {/* 5. Nút Submit */}
                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg fw-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span className="ms-2">Đang đăng nhập...</span>
                                    </>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}