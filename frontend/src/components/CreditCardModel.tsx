import { motion, AnimatePresence } from "framer-motion";

interface CreditCardProps {
    isShow: boolean;
    onClose: () => void;
}

export default function CreditCardModel({ isShow, onClose }: CreditCardProps) {
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
                        style={{ width: "570px", zIndex: 1050 }}
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="fs-4 mb-4">Thêm thẻ tín dụng</div>
                        <div className="d-flex justify-content-between gap-3 p-2 mb-4" style={{ background: "#f7fffe", border: "2px solid rgb(48, 181, 102)" }}>
                            <div className="text-center d-flex align-items-center justify-content-center">
                                <i className="fa-solid fa-shield-heart" style={{ color: "rgb(48, 181, 102)", margin: "auto 0px" }}></i>
                            </div>
                            <div>
                                <div><strong>Thông tin thẻ của bạn sẽ được bảo vệ</strong></div>
                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>Chúng tôi đảm bảo thông tin thẻ của bạn được bảo mật và an toàn. Bá sàn sẽ không có quyền truy cập vào thông tin thẻ của bạn.</div>
                            </div>
                        </div>
                        <div className="d-flex mb-4 justify-content-between">
                            <div className="fs-4">Chi tiết thẻ</div>
                            <div className="d-flex gap-3 align-items-center justify-content-center fs-4 text-muted">
                                <i className="fa-brands fa-cc-mastercard"></i>
                                <i className="fa-brands fa-cc-visa"></i>
                                <i className="fa-brands fa-cc-jcb"></i>
                                <i className="fa-brands fa-cc-paypal"></i>
                                <i className="fa-brands fa-cc-apple-pay"></i>
                            </div>
                        </div>
                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="sothe"
                                required
                                placeholder=""
                            />
                            <label>Số thẻ</label>
                        </div>
                        <div className="row">
                            <div className="col-9">
                                <div className="floating-input mb-4">
                                    <input
                                        type="text"
                                        name="ngayhethan"
                                        required
                                        placeholder=""
                                    />
                                    <label>Ngày hết hạn (MM/YY)</label>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="floating-input mb-4">
                                    <input
                                        type="text"
                                        name="cvv"
                                        required
                                        placeholder=""
                                    />
                                    <label>Mã CVV</label>
                                </div>
                            </div>
                        </div>
                        <div className="floating-input mb-4">
                            <input
                                type="text"
                                name="hoten"
                                required
                                placeholder=""
                            />
                            <label>Họ tên chủ thẻ</label>
                        </div>

                        <div className="fs-4 mb-4">Địa chỉ đăng ký thẻ Tín dụng</div>
                        <div className="row">
                            <div className="col-8">
                                <div className="floating-input mb-4">
                                    <input
                                        type="text"
                                        name="diachi"
                                        required
                                        placeholder=""
                                    />
                                    <label>Địa chỉ</label>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="floating-input mb-4">
                                    <input
                                        type="text"
                                        name="postalcode"
                                        required
                                        placeholder=""
                                    />
                                    <label>Mã bưu chính</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-3 justify-content-end">
                            <div className="btn btn-secondary">Hủy</div>
                            <div className="btn btn-primary">Hoàn thành</div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
