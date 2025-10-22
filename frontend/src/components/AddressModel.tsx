import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import MapPicker from "./MapPicker";
import { useAuth } from "../context/AuthContext";
import { createAndLinkAddress } from "../api/user";

interface AddressModalProps {
    isShow: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
}

export default function AddressModal({ isShow, onClose, onSaveSuccess }: AddressModalProps) {
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
    }, [isShow]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !selectedCityName || !selectedWardName || !street) {
            alert("Nhập đủ thông tin đi b ei");
            return;
        }
        try {
            const newData = {
                user_name: name,
                phone_number_jdo: phone,
                city: selectedCityName,
                ward: selectedWardName,
                street: street
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
                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="address"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                required
                                placeholder=""
                            />
                            <label>Địa chỉ cụ thể</label>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Chọn vị trí trên bản đồ</label>
                            <div className="border rounded">
                                <MapPicker onPick={(pos: any) => console.log("Đã chọn:", pos)} />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Loại địa chỉ:</label>
                            <div className="d-flex gap-2">
                                <div className="btn btn-primary">Nhà riêng</div>
                                <div className="btn btn-secondary">Văn phòng</div>
                            </div>
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
