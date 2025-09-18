import React, { useState } from "react";

interface UserInfo {
    firstName: string;
    lastName: string;
    city: string;
    district: string;
    ward: string;
    address: string;
    saved_address_id: string;
}

type CitiesDataType = {
    [city: string]: {
        [district: string]: string[];
    };
};

const citiesData: CitiesDataType = {
    "Hà Nội": {
        "Quận Ba Đình": ["Phường Điện Biên", "Phường Kim Mã"],
        "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Hàng Đào"],
    },
    "TP Hồ Chí Minh": {
        "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành"],
        "Quận 3": ["Phường Võ Thị Sáu", "Phường 7"],
    },
};

const UserInfoForm: React.FC = () => {
    const [formData, setFormData] = useState<UserInfo>({
        firstName: "",
        lastName: "",
        city: "",
        district: "",
        ward: "",
        address: "",
        saved_address_id: "1"
    });
    const [savedAddresID, setSavedAddressID] = useState("1");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name == "saved-address") {
            if (value == "-1") {
                setFormData({ ...formData, city: "", district: "", ward: "" });
            } else {
                // Lấy dữ liệu có sẵn gán zô
            }
            setSavedAddressID(value);
        }

        // Reset district/ward nếu đổi city
        if (name === "city") {
            setFormData({ ...formData, city: value, district: "", ward: "" });
        }

        // Reset ward nếu đổi district
        if (name === "district") {
            setFormData({ ...formData, district: value, ward: "" });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Thông tin nhập:", formData);
    };

    return (
        <div className="container mt-4 w-50">
            <h3 className="mb-3">Nhập thông tin người dùng</h3>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Họ</label>
                    <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Tên</label>
                    <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="saved-address">Địa chỉ giao hàng</label>
                    <select name="saved-address" id="saved-address" className="form-select" onChange={handleChange}>
                        <option value="1" disabled={savedAddresID != "1"}>Chọn địa chỉ đã lưu</option>
                        <option value="-1">Chọn địa chỉ khác</option>
                    </select>
                </div>

                <div className="col-12">
                    <label className="form-label">Địa chỉ chi tiết</label>
                    <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Số nhà, đường..."
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Thành phố</label>
                    <select
                        className="form-select"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        disabled={savedAddresID != "-1"}
                    >
                        <option value="">-- Chọn thành phố --</option>
                        {Object.keys(citiesData).map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Quận/Huyện</label>
                    <select
                        className="form-select"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!formData.city}
                        required
                    >
                        <option value="">-- Chọn quận/huyện --</option>
                        {formData.city &&
                            Object.keys(citiesData[formData.city]).map((district) => (
                                <option key={district} value={district}>
                                    {district}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Phường/Xã</label>
                    <select
                        className="form-select"
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        disabled={!formData.district}
                        required
                    >
                        <option value="">-- Chọn phường/xã --</option>
                        {formData.city &&
                            formData.district &&
                            citiesData[formData.city][formData.district].map((ward) => (
                                <option key={ward} value={ward}>
                                    {ward}
                                </option>
                            ))}
                    </select>
                </div >



                <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                        Lưu thông tin
                    </button>
                </div>
            </form >
        </div >
    );
};

export default UserInfoForm;
