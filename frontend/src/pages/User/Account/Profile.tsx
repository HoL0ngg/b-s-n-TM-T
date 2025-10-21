import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchUserProfile, updateProfile } from "../../../api/user";
import type { UserProfileType } from "../../../types/UserType";

export default function Profile() {
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState<number>(0);
    const [userProfile, setUserProfile] = useState<UserProfileType>();
    const [isEditable, setIsEditable] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
        const loadUserProfile = async () => {
            if (user) {
                setEmail(user.email);
                setPhone(user.id);
                const data = await fetchUserProfile(user.id);
                setUserProfile(data);
                setName(data?.username ?? "");
                setBirthday(data?.dob ?? "");
                setGender(data?.gender ?? 10);
                console.log(data);
                if (data?.updated_at) {
                    const lastUpdated = new Date(data?.updated_at);
                    console.log(lastUpdated);

                    const now = new Date();

                    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                    const timeDiff = now.getTime() - lastUpdated.getTime();

                    if (timeDiff > sevenDaysInMs) {
                        setIsEditable(true);
                    } else {
                        setIsEditable(false);
                        // Tính số ngày còn lại (làm tròn lên)
                        const remainingMs = sevenDaysInMs - timeDiff;
                        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                        setDaysRemaining(remainingDays);
                    }
                } else {
                    // Nếu chưa update bao giờ, cho phép sửa
                    setIsEditable(true);
                }
            }
        }
        loadUserProfile();
    }, [user])

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isEditable) {
            alert(`Bạn cần đợi ${daysRemaining} ngày nữa để có thể thay đổi.`);
            return;
        }
        const updatedProfile = {
            id: phone,
            name: name,
            gender: gender,
            birthday: birthday,
        };
        try {
            const response = await updateProfile(updatedProfile);
            console.log(response);

            const newProfile = response.user;
            setUserProfile(newProfile);

            setIsEditable(false);
            setDaysRemaining(7);

            alert('Cập nhật thành công! Vui lòng đợi 7 ngày cho lần đổi tiếp theo.');

        } catch (error) {
            console.error('Lỗi khi submit:', error);
            alert("Cập nhật thất bại");
        }
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
                    <form onSubmit={(e) => handleSubmit(e)} className="w-75 text-end">
                        {/* Email */}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Email</label>
                            <div className="col-sm-9 d-flex align-items-center">
                                <span>{email}</span>
                                <a href="#" className="ms-2 text-primary">
                                    Thay Đổi
                                </a>
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
                                        value={1}
                                        checked={gender == 1}
                                        onChange={(e) => setGender(Number(e.target.value))}
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
                                        value={0}
                                        checked={gender == 0}
                                        onChange={(e) => setGender(Number(e.target.value))}
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
                                        value={-1}
                                        checked={gender == -1}
                                        onChange={(e) => setGender(Number(e.target.value))}
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
                                <button type="button" className="btn btn-danger px-4">
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
                                src="/assets/lion.png"
                                alt="User Avatar"
                                className="rounded-circle mb-2"
                                style={{ height: '150px', width: '150px' }}
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
