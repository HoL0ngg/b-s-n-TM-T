import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumb";

export default function Register() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(false);
    const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
    const navigator = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 10) return;
        const re = /^[0-9\b]+$/;
        if (e.target.value === "" || re.test(e.target.value)) setPhone(e.target.value);
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/;
        return phoneRegex.test(phone);
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(phone)) {
            alert("Số điện thoại không hợp lệ. Vui lòng nhập lại.");
            return;
        }
        setLoading(true);
        try {
            // Call backend API to send OTP
            await axios.post("http://localhost:5000/api/otp/send-otp", { phone });
            setOtp(true);
        } catch (err) {
            alert("Đã có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; // Only allow digits
        const newOtpInput = [...otpInput];
        newOtpInput[index] = value;
        setOtpInput(newOtpInput);

        // Automatically focus the next input field
        if (value && index < otpInput.length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) (nextInput as HTMLInputElement).focus();
        }
    };

    const handleRegis = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const otpCode = otpInput.join(""); // Combine OTP digits into a single string
        try {
            // Call backend API to verify OTP
            const response = await axios.post("http://localhost:3000/api/verify-otp", { phone, otp: otpCode });
            if (response.data.success) {
                alert("Đăng ký thành công!");
                navigator("/login");
            } else {
                setError("Mã OTP không chính xác. Vui lòng thử lại.");
            }
        } catch (err) {
            setError("Đã có lỗi xảy ra khi xác minh OTP. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Breadcrumbs />
            <div className="container d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <div className="card shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">Đăng ký</h3>
                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        <form>
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="form-control"
                                    placeholder="Nhập số điện thoại"
                                    value={phone}
                                    onChange={handleChange}
                                    required
                                    disabled={otp} // Disable phone input after OTP is sent
                                />
                            </div>
                            {otp && (
                                <div className="mb-3">
                                    <label htmlFor="otp" className="form-label">Mã OTP</label>
                                    <div className="row">
                                        {otpInput.map((digit, index) => (
                                            <div className="col-2" key={index}>
                                                <input
                                                    type="text"
                                                    id={`otp-${index}`}
                                                    className="form-control text-center"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {otp ? (
                                <button onClick={handleRegis} className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Xác nhận OTP"}
                                </button>
                            ) : (
                                <button onClick={handleSendOTP} className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Gửi mã OTP"}
                                </button>
                            )}
                        </form>
                        <div className="text-center mt-3">
                            <small>
                                Đã có tài khoản? <a href="/login" className="text-decoration-none">Đăng nhập</a>
                            </small>
                        </div>
                    </div>
                </div>
                {loading && (
                    <div className="loader-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>
        </>
    );
}