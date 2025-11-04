import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import MapPicker from "./MapPicker";
import { useAuth } from "../context/AuthContext";
import { createAndLinkAddress } from "../api/user";
import { isValidPhoneNumber, isLength } from "../utils/validator";
import type { AddressType } from "../types/UserType";
interface AddressModalProps {
    isShow: boolean;
    onClose: () => void;
    address: AddressType | null;
    onSaveSuccess: () => void;
}

export default function AddressModal({ isShow, onClose, address, onSaveSuccess }: AddressModalProps) {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState<any[]>([]);
    const [ward, setWard] = useState<any[]>([]);
    const [selectedCityName, setSelectedCityName] = useState("");
    const [selectedWardName, setSelectedWardName] = useState("");
    const [selectedCityCode, setSelectedCityCode] = useState("");
    const [selectedWardCode, setSelectedWardCode] = useState("");
    const [street, setStreet] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
                const data = await response.json();
                setCity(data); // Lưu danh sách tỉnh/thành
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
            }
        };

        fetchProvinces();
    }, []);
    useEffect(() => {
        if (isShow) {
            setName("");
            setPhone("");
            setSelectedCityName("");
            setSelectedWardName("");
            setSelectedWardCode("");
            setSelectedCityCode("");
            setStreet("");
        }
        if (address) {
            const cityy = address.city;
            const wardd = address.ward;
            const sdt = address.phone_number_jdo;
            const namee = address.user_name;
            const streett = address.street;
            setName(namee);
            setPhone(sdt);
            setStreet(streett);
            // 2. Tìm CODE từ NAME
            const selectedCity = city.find(c => c.name === cityy).code;
            setSelectedCityCode(selectedCity);
            fetch(`https://provinces.open-api.vn/api/v2/p/${selectedCity}?depth=2`)
                .then(data => data.json())
                .then(jsonData => {
                    setWard(jsonData.wards);
                    const selectedWard = jsonData.wards.find((w: any) => w.name === wardd);
                    setSelectedWardCode(selectedWard);
                });

        }
    }, [isShow, address]);

    const handleCityChange = async (event: any) => {
        const cityCode = event.target.value; // Lấy code của tỉnh vừa chọn
        setSelectedCityCode(cityCode);

        if (cityCode) {
            const tmp = city.find(hihi => hihi.code == cityCode);
            setSelectedCityName(tmp.name);
            setSelectedWardName('');
            setSelectedWardCode('');
            try {
                // Gọi API để lấy phường/xã
                const response = await fetch(`https://provinces.open-api.vn/api/v2/p/${cityCode}?depth=2`);
                const data = await response.json();

                setWard(data.wards);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        } else {
            setWard([]); // Nếu không chọn tỉnh nào thì reset
        }
    };

    const handleChangeWard = (e: any) => {
        const wardCode = e.target.value;
        setSelectedWardCode(wardCode);
        const tmp = ward.find(hihi => hihi.code == wardCode);

        setSelectedWardName(tmp.name);
    }

    const validateData = () => {
        if (!isValidPhoneNumber(phone)) {
            alert("Nhập đúng sđt đi b ei")
            return false;
        }
        if (!isLength(name, { min: 1, max: 20 })) {
            return false;
        }
        if (!isLength(street, { min: 10 })) {
            alert("Nhập địa chỉ dài dài lên b ei")
            return false;
        }

        return true;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !selectedCityName || !selectedWardName || !street) {
            alert("Nhập đủ thông tin đi b ei");
            return;
        }
        if (!validateData()) return false;
        try {
            const newData = {
                user_name: name,
                phone_number_jdo: phone,
                city: selectedCityName,
                ward: selectedWardName,
                street: street,
                isDefault: isDefault
            };

            console.log(newData);
            if (user)
                await createAndLinkAddress(user?.id.toString(), newData); // API POST
            onSaveSuccess();

        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            alert("Lưu địa chỉ thất bại!");
        }
    };

    if (!isShow) return null;

    return (
        <AnimatePresence>
            {isShow && (
                <>
                    {/* Overlay mờ nền */}
                    <motion.div
                        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Hộp modal */}
                    <motion.div
                        className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4"
                        style={{ width: "550px", zIndex: 1050 }}
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h5 className="mb-4 text-center fw-bold">Thêm địa chỉ mới</h5>
                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="fullName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder=""
                            />
                            <label>Họ và tên</label>
                        </div>
                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder=""
                            />
                            <label>Số điện thoại</label>
                        </div>


                        <div className="row">
                            <div className="col-6">
                                <div className="floating-input mb-4">
                                    <select className="form-select p-2" id="select_thanhpho" onChange={(e) => handleCityChange(e)} value={selectedCityCode}>
                                        <option value="" disabled>-- Chọn Tỉnh/Thành phố --</option>
                                        {city.map((c) => (
                                            <option
                                                key={c.code}
                                                value={c.code}
                                            >
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label>Tỉnh/Thành phố</label>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="floating-input mb-4">
                                    <select className="form-select p-2" id="select_phuong" onChange={(e) => handleChangeWard(e)} value={selectedWardCode} >
                                        <option value="" disabled>-- Chọn Phường/Xã --</option>
                                        {ward.map((m) => (
                                            <option
                                                key={m.code}
                                                value={m.code}
                                            >
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label>Phường/Xã</label>
                                </div>
                            </div>
                        </div>
                        <div className="floating-input mb-3">
                            <input
                                type="text"
                                name="address"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                required
                                placeholder=""
                                disabled={selectedCityName == ''}
                            />
                            <label>Địa chỉ cụ thể</label>
                        </div>

                        <div className="mb-3">
                            <MapPicker
                                address={street}
                                city={selectedCityName}   // <-- Prop mới
                                ward={selectedWardName}    // <-- Prop mới
                                setAddress={setStreet}
                            />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked" onChange={() => setIsDefault(!isDefault)} />
                            <label className="form-check-label user-select-none" htmlFor="flexCheckChecked">
                                Đặt làm địa chỉ mặc định
                            </label>
                        </div>

                        <div className="d-flex justify-content-end">
                            <button className="btn btn-secondary me-2" onClick={onClose}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClickCapture={handleSubmit}>Lưu</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}