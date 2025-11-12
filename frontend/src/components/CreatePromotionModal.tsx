import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCreatePromotion } from '../api/products';

interface CreateModalProps {
    show: boolean;
    onHide: () => void;
    onSaveSuccess: () => void;
}

export default function CreatePromotionModal({ show, onHide, onSaveSuccess }: CreateModalProps) {

    // State cho form
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // State cho file và ảnh preview
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Tạo ảnh preview
    useEffect(() => {
        if (!bannerFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(bannerFile);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [bannerFile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bannerFile) {
            alert("Vui lòng chọn ảnh banner");
            return;
        }
        setIsLoading(true);

        try {
            await apiCreatePromotion({
                name,
                start_date: startDate,
                end_date: endDate,
                banner_image: bannerFile // Truyền file
            });

            alert("Tạo sự kiện thành công!");
            onSaveSuccess(); // Báo cho cha tải lại
            onHide(); // Đóng modal

        } catch (error) {
            console.error("Lỗi tạo sự kiện:", error);
            alert("Tạo sự kiện thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!show) {
            setName("");
            setStartDate("");
            setEndDate("");
            setBannerFile(null);
            setPreview(null);
        }
    }, [show]);

    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const modalVariants = { hidden: { y: "-50px", opacity: 0 }, visible: { y: "0", opacity: 1 } };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onHide}
                    />

                    <motion.div
                        className="modal d-block"
                        tabIndex={-1}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{ zIndex: 1050 }} // Đảm bảo modal cao hơn backdrop
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Tạo sự kiện mới</h5>
                                        <button type="button" className="btn-close" onClick={onHide}></button>
                                    </div>
                                    <div className="modal-body">

                                        <div className="mb-3">
                                            <label className="form-label">Tên sự kiện</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Upload Ảnh */}
                                        <div className="mb-3">
                                            <label className="form-label">Ảnh Banner</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                ref={fileInputRef}
                                                accept="image/png, image/jpeg"
                                                onChange={(e) => setBannerFile(e.target.files ? e.target.files[0] : null)}
                                                required
                                            />
                                        </div>

                                        {/* Preview Ảnh */}
                                        {preview && (
                                            <div className="mb-3 text-center">
                                                <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                                            </div>
                                        )}

                                        <div className="row">
                                            {/* Ngày bắt đầu */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Ngày bắt đầu</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {/* Ngày kết thúc */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Ngày kết thúc</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isLoading}>
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                            {isLoading ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}