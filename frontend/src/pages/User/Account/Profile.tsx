import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function Profile() {
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const user = useAuth();
    const email = user.user?.username
    const phone = user.user?.id
    const [gender, setGender] = useState("");

    const handleSubmit = () => {

    }

    return (
        <>
            <div className="border-bottom p-2 pb-3">
                <h5 className="m-0">Thông tin cá nhân</h5>
                <small className="text-muted">Quản lý thông tin hồ sơ để bảo mật tài khoản</small>
            </div>
            <div className="row mt-4">
                {/* Nội dung chính */}
                <section className="col-md-9 d-flex">
                    <form onSubmit={handleSubmit} className="w-75 text-end">
                        {/* Email */}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Email</label>
                            <div className="col-sm-9 d-flex align-items-center">
                                {email ? (
                                    <span>{email}</span>
                                ) : (
                                    <a href="#" className="text-primary">
                                        Thêm
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Tên đăng nhập */}
                        {/* <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Tên đăng nhập</label>
                            <div className="col-sm-9 d-flex align-items-center">
                                <span>{username}</span>
                            </div>
                        </div> */}

                        {/* Tên */}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Tên</label>
                            <div className="col-sm-9">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>



                        {/* Số điện thoại */}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Số điện thoại</label>
                            <div className="col-sm-9 d-flex align-items-center">
                                <span>{phone}</span>
                                <a href="#" className="ms-2 text-primary">
                                    Thay Đổi
                                </a>
                            </div>
                        </div>

                        {/* Giới tính */}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Giới tính</label>
                            <div className="col-sm-9 d-flex align-items-center gap-3">
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        id="male"
                                        name="gender"
                                        value="male"
                                        checked={gender === "male"}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="male">
                                        Nam
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        id="female"
                                        name="gender"
                                        value="female"
                                        checked={gender === "female"}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="female">
                                        Nữ
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        id="other"
                                        name="gender"
                                        value="other"
                                        checked={gender === "other"}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="other">
                                        Khác
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Ngày sinh */}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Ngày sinh</label>
                            <div className="col-sm-9 d-flex align-items-center">
                                <input
                                    type="date"
                                    className="form-control w-auto"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                />
                                <a href="#" className="ms-2 text-primary">
                                    Thay Đổi
                                </a>
                            </div>
                        </div>

                        {/* Nút lưu */}
                        <div className="row">
                            <div className="col-sm-9 offset-sm-3">
                                <button type="submit" className="btn btn-danger px-4">
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary px-4 ms-2">
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
                <section className="col-md-3 border-start">
                    <div className="container">
                        <div className="text-center">
                            <img
                                src="https://via.placeholder.com/80"
                                alt="User Avatar"
                                className="rounded-circle mb-2"
                            />
                            <div className="mb-0 btn btn-primary">Chọn ảnh</div>
                            <br />
                            <small className="text-muted">Dung lượng file tối đa 1MB</small>
                            <br />
                            <small className="text-muted">Định dạng: .JPEG, .PNG</small>
                        </div>
                    </div>
                </section>
            </div>
        </ >
    );
}
