import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import "./AddressModel.css";
import MapPicker from "../MapPicker";

interface AddressModalProps {
    isShow: boolean;
    onClose: () => void;
}

export default function AddressModal({ isShow, onClose }: AddressModalProps) {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        address: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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
                        <div className="row">
                            <div className="col-6">
                                <div className="floating-input mb-4">
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        required
                                        placeholder=""
                                    />
                                    <label>Họ và tên</label>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="floating-input mb-4">
                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder=""
                                    />
                                    <label>Số điện thoại</label>
                                </div>
                            </div>

                        </div>


                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                required
                                placeholder=""
                            />
                            <label>Tỉnh/Thành phố, Phường/Xã</label>
                        </div>
                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
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

                        <div className="mb-3">
                            <label className="form-label">Loại địa chỉ:</label>
                            <div className="d-flex gap-2">
                                <div className="btn btn-primary">Nhà riêng</div>
                                <div className="btn btn-primary">Văn phòng</div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <button className="btn btn-secondary me-2" onClick={onClose}>
                                Hủy
                            </button>
                            <button className="btn btn-primary ">Lưu</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
