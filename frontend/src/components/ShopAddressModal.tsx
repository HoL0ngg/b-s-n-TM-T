import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import MapPicker from "./MapPicker";

interface ShopAddressModalProps {
    isShow: boolean;
    onClose: () => void;
    onAddressSelect: (address: string) => void;
}

export default function ShopAddressModal({ isShow, onClose, onAddressSelect }: ShopAddressModalProps) {
    const [city, setCity] = useState<any[]>([]);
    const [ward, setWard] = useState<any[]>([]);
    const [selectedCityName, setSelectedCityName] = useState("");
    const [selectedWardName, setSelectedWardName] = useState("");
    const [selectedCityCode, setSelectedCityCode] = useState("");
    const [selectedWardCode, setSelectedWardCode] = useState("");
    const [street, setStreet] = useState("");
    const [homeNumber, setHomeNumber] = useState("");

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://provinces.open-api.vn/api/v2/p/');
                const data = await response.json();
                setCity(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (isShow) {
            // Reset form khi mở modal
            setSelectedCityName("");
            setSelectedWardName("");
            setSelectedWardCode("");
            setSelectedCityCode("");
            setStreet("");
            setHomeNumber("");
            setWard([]);
        }
    }, [isShow]);

    const handleCityChange = async (event: any) => {
        const cityCode = event.target.value;
        setSelectedCityCode(cityCode);

        if (cityCode) {
            const selectedCity = city.find(c => c.code == cityCode);
            setSelectedCityName(selectedCity.name);
            setSelectedWardName('');
            setSelectedWardCode('');

            try {
                const response = await fetch(`http://provinces.open-api.vn/api/v2/p/${cityCode}?depth=2`);
                const data = await response.json();
                setWard(data.wards);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        } else {
            setWard([]);
        }
    };

    const handleChangeWard = (e: any) => {
        const wardCode = e.target.value;
        setSelectedWardCode(wardCode);
        const selectedWard = ward.find(w => w.code == wardCode);
        setSelectedWardName(selectedWard.name);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCityName || !selectedWardName || !street) {
            alert("Vui lòng nhập đầy đủ thông tin địa chỉ");
            return;
        }

        if (street.length < 10) {
            alert("Vui lòng nhập địa chỉ chi tiết hơn (tối thiểu 10 ký tự)");
            return;
        }

        // Tạo địa chỉ đầy đủ
        const fullAddress = `${homeNumber ? homeNumber + ' ' : ''}${street}, ${selectedWardName}, ${selectedCityName}`;
        onAddressSelect(fullAddress);
        onClose();
    };

    if (!isShow) return null;

    return (
        <AnimatePresence>
            {isShow && (
                <>
                    {/* Overlay mờ nền - thêm z-index cao hơn */}
                    <motion.div
                        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                        style={{ zIndex: 1040 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Hộp modal */}
                    <motion.div
                        className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4"
                        style={{
                            width: "550px",
                            zIndex: 1050,
                            maxHeight: "90vh",
                            overflowY: "auto"
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h5 className="mb-4 text-center fw-bold">Chọn địa chỉ Shop</h5>

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-6">
                                    <div className="floating-input mb-4">
                                        <select
                                            className="form-select p-2"
                                            onChange={handleCityChange}
                                            value={selectedCityCode}
                                            required
                                        >
                                            <option value="" disabled>-- Chọn Tỉnh/Thành phố --</option>
                                            {city.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <label>Tỉnh/Thành phố</label>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="floating-input mb-4">
                                        <select
                                            className="form-select p-2"
                                            onChange={handleChangeWard}
                                            value={selectedWardCode}
                                            disabled={!selectedCityCode}
                                            required
                                        >
                                            <option value="" disabled>-- Chọn Phường/Xã --</option>
                                            {ward.map((w) => (
                                                <option key={w.code} value={w.code}>
                                                    {w.name}
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
                                    value={homeNumber}
                                    onChange={(e) => setHomeNumber(e.target.value)}
                                    placeholder=""
                                />
                                <label>Số nhà (không bắt buộc)</label>
                            </div>

                            <div className="floating-input mb-3">
                                <input
                                    type="text"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    required
                                    placeholder=""
                                    disabled={!selectedCityName}
                                />
                                <label>Tên đường, địa chỉ cụ thể</label>
                            </div>

                            <div className="mb-3">
                                <MapPicker
                                    address={street}
                                    city={selectedCityName}
                                    ward={selectedWardName}
                                    setAddress={setStreet}
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}