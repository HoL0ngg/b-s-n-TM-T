import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumb";

export default function Profile() {
    const [formData, setFormData] = useState({
        name: "Nguyen Van A",
        email: "nguyenvana@example.com",
        phone: "0123456789",
        password: "",
        confirmPassword: "",
    });

    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Basic validation
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }

        // Simulate saving data
        setTimeout(() => {
            setSuccess(true);
            setEditMode(false);
        }, 1000);
    };

    return (
        <>
            <Breadcrumbs></Breadcrumbs>
            <div className="container mt-5">
                <h2 className="text-center mb-4">Thông tin cá nhân</h2>
                {error && <div className="alert alert-danger text-center">{error}</div>}
                {success && <div className="alert alert-success text-center">Cập nhật thông tin thành công!</div>}
                <form onSubmit={handleSave} className="card shadow p-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Họ và tên</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!editMode}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!editMode}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!editMode}
                            required
                        />
                    </div>
                    {editMode && (
                        <>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-control"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}
                    <div className="d-flex justify-content-between">
                        {editMode ? (
                            <>
                                <button type="submit" className="btn btn-success">Lưu thay đổi</button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditMode(false)}
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setEditMode(true)}
                            >
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}