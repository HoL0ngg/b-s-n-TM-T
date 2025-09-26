import { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumb";
import { getUser } from "../api/jwt";
import { useAuth } from "../context/AuthContext";

interface User {
    id: number;
    username: string;
    email: string;
    phone_number?: string;
}

export default function Profile() {
    const { user } = useAuth();

    const [avatar, setAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<User | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) return;

        // user.id lấy từ JWT
        getUser(String(user.id))
            .then((res) => setUserData(res))
            .catch((err) => console.error("Error fetching user:", err));
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Breadcrumbs></Breadcrumbs>
            <div className="container mt-5 card shadow d-flex rounded flex-row">
                {/* {error && <div className="alert alert-danger text-center">{error}</div>}
                {success && <div className="alert alert-success text-center">Cập nhật thông tin thành công!</div>} */}
                <div className="container col-3 text-center mt-2">
                    <div className="d-flex justify-content-center">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="Avatar"
                                className="img-fluid rounded-circle border"
                                style={{ width: "200px", height: "200px", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                className="d-flex align-items-center justify-content-center border rounded-circle bg-light"
                                style={{ width: "200px", height: "200px" }}
                            >
                                <span>Chưa có ảnh</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center align-middle m-3">
                        <input
                            type="file"
                            accept="image/*"
                            id="avatarInput"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <label htmlFor="avatarInput" className="btn btn-primary">
                            Chọn hình ảnh
                        </label>
                    </div>
                </div>
                <div className="container col-9 border-start pt-2">
                    <h3 className="mb-4 text-center">Thông tin cá nhân</h3>

                    <div className="mb-3">
                        <strong>ID:</strong> {userData?.id}
                    </div>

                    <div className="mb-3">
                        <strong>Tên đăng nhập:</strong> {userData?.username}
                    </div>

                    <div className="mb-3">
                        <strong>Email:</strong> {userData?.email}
                    </div>

                    <div className="mb-3">
                        <strong>Số điện thoại:</strong> {userData?.phone_number}
                    </div>
                </div>
            </div >
        </>
    );
}