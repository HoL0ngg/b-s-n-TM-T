import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigator = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }

        // Simulate successful registration
        setSuccess(true);
        // alert(`Đăng ký thành công với thông tin: ${JSON.stringify(formData, null, 2)}`);
        setLoading(true);
        setTimeout(() => {
            navigator("/cart/Information");
        }, 1000);
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <div className="card shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
                <div className="card-body">
                    <h3 className="card-title text-center mb-4">Đăng ký</h3>
                    {error && <div className="alert alert-danger text-center">{error}</div>}
                    {success && <div className="alert alert-success text-center">Đăng ký thành công!</div>}
                    <form onSubmit={handleRegister}>
                        {/* <div className="row">
                            <div className="mb-3 col-4">
                                <label htmlFor="firstName" className="form-label">Họ</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="form-control"
                                    placeholder="Nhập họ"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3 col-8">
                                <label htmlFor="lastName" className="form-label">Tên</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="form-control"
                                    placeholder="Nhập tên"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div> */}
                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-control"
                                placeholder="Nhập số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                placeholder="Nhập email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div> */}
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-success w-100">Đăng ký</button>
                    </form>
                    <div className="text-center mt-3">
                        <small>
                            Đã có tài khoản? <a href="/login" className="text-decoration-none">Đăng nhập</a>
                        </small>
                    </div>
                </div>
            </div>
            {loading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
}