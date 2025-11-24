import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { updateProfile } from "../../../api/user";

export default function Profile() {
    const { user, userProfile, setUserProfile } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState<number>(0);

    const [isEditable, setIsEditable] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);


    useEffect(() => {
        if (userProfile) {
            setName(userProfile.username || '');
            setBirthday(userProfile.dob);
            setGender(Number(userProfile.gender) || 0);

            const { updated_at } = userProfile;
            console.log(userProfile);

            if (updated_at) {
                const lastUpdated = new Date(updated_at);
                const now = new Date();
                const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                const timeDiff = now.getTime() - lastUpdated.getTime();

                if (timeDiff > sevenDaysInMs) {
                    setIsEditable(true);
                } else {
                    setIsEditable(false);
                    const remainingMs = sevenDaysInMs - timeDiff;
                    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                    setDaysRemaining(remainingDays);
                }
            } else {
                setIsEditable(true);
            }
        }
    }, [userProfile]);

    useEffect(() => {
        // Nếu không có file nào (ví dụ: khi nhấn "Hủy"),
        // thì xóa ảnh preview
        if (!selectedFile) {
            setPreview(null);
            return;
        }

        // Tạo một URL tạm thời (blob URL) cho file ảnh
        const objectUrl = URL.createObjectURL(selectedFile);

        // Gán URL này vào state 'preview'
        setPreview(objectUrl);

        // Dọn dẹp: Hủy object URL khi component bị unmount
        // (để tránh rò rỉ bộ nhớ)
        return () => URL.revokeObjectURL(objectUrl);

    }, [selectedFile]);

    const avatarSrc = preview || (user?.avatar_url
        ? `${import.meta.env.VITE_API_URL}/uploads${user?.avatar_url}`
        : "/assets/panda.png");

    console.log(user)

    // 4. HÀM SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditable) {
            alert(`Bạn cần đợi ${daysRemaining} ngày nữa để có thể thay đổi.`);
            return;
        }

        if (!user?.id) {
            alert("Lỗi: Không tìm thấy ID người dùng.");
            return;
        }

        const formData = new FormData();

        // --- 2. GẮN DỮ LIỆU CHỮ ---
        formData.append('name', name);
        formData.append('gender', gender.toString());
        formData.append('birthday', birthday);

        // --- 3. GẮN DỮ LIỆU FILE (NẾU CÓ) ---
        if (selectedFile) {
            formData.append('avatar', selectedFile); // 'avatar' phải khớp key của multer
        }

        try {
            // --- 4. GỌI API (với FormData) ---
            const response = await updateProfile(formData);

            const newProfile = response.user; // (Backend trả về)
            console.log(response);


            setUserProfile(newProfile); // Cập nhật Context
            setSelectedFile(null); // Reset file

            alert('Cập nhật thành công!');

        } catch (error) {
            console.error('Lỗi khi submit:', error);
            alert("Cập nhật thất bại");
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(null);
            return;
        }
        const file = e.target.files[0];

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert("Chỉ chấp nhận file .jpeg hoặc .png!");
            return;
        }

        setSelectedFile(file); // Chỉ lưu file, không tạo preview
    };

    if (!user || !userProfile) {
        return <div>Đang tải thông tin...</div>;
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
                                <span>{user.email}</span>
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
                                <span>{user.id}</span>

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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelected}
                            accept="image/png, image/jpeg"
                            style={{ display: 'none' }}
                        />
                        <div className="text-center">
                            <img
                                src={avatarSrc}
                                alt="User Avatar"
                                className="rounded-circle mb-2"
                                style={{ height: '150px', width: '150px' }}
                            />
                            <div className="mb-0 btn btn-primary" onClick={() => fileInputRef.current?.click()}>Chọn ảnh</div>
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
