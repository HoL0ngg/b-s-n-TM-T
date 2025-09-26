import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumb";
import Swal from "sweetalert2";
import { sendOtp, verifyOtp } from "../api/otp";
import { register } from "../api/jwt";

export default function Register() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(false);
    const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
    const [mail, setMail] = useState("");
    const navigator = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validOTP, setValidOTP] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handlePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 10) return;
        const re = /^[0-9\b]+$/;
        if (e.target.value === "" || re.test(e.target.value)) setPhone(e.target.value);
    };

    const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMail(e.target.value);
    }

    const handleSuccess = () => {
        Swal.fire({
            title: "Thành công!",
            text: "ĐÃ GỬI THÀNH CÔNG MÃ OTP TỚI EMAIL CỦA BẠN 🎉",
            icon: "success",
            confirmButtonText: "OK"
        });
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/;
        return phoneRegex.test(phone);
    };

    const validateEmail = (mail: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(mail);
    }

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(phone)) {
            alert("Số điện thoại không hợp lệ. Vui lòng nhập lại.");
            return;
        }
        if (!validateEmail(mail)) {
            alert("Email không hợp lệ. Vui lòng nhập lại.");
            return;
        }
        setLoading(true);
        try {
            const res = await sendOtp(mail);
            if (!res.success) {
                setError("Gửi mã OTP thất bại. Vui lòng thử lại.");
                return;
            }
            handleSuccess();
            setOtp(true);
        } catch (err: any) {
            setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false)
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

    const handleConfirmOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const otpCode = otpInput.join(""); // Combine OTP digits into a single string
        if (otpCode.length < 6) {
            setError("Vui lòng nhập đầy đủ 6 chữ số của mã OTP.");
            setLoading(false);
            return;
        }

        try {
            const res = await verifyOtp(mail, otpCode);
            if (res.success) {
                // OTP is correct, proceed with registration
                handleSuccess();
                setValidOTP(true);
            } else {
                setError("Mã OTP không đúng. Vui lòng thử lại.");
            }
        } catch (err: any) {
            console.log(err);

            setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegis = async () => {
        if (password !== confirmPassword) {
            setError("Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }
        try {
            await register(phone, password);
            alert("Tạo tài khoản thành công");
            navigator("/login");
        } catch (err: any) {
            alert(err.response?.data?.message || "Login thất bại");
        }
    }

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
                                    onChange={handlePhoneNumber}
                                    required
                                    disabled={otp} // Disable phone input after OTP is sent
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="tel"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Nhập email"
                                    value={mail}
                                    onChange={handleEmail}
                                    required
                                    disabled={otp} // Disable phone input after OTP is sent
                                />
                            </div>
                            {otp && !validOTP && (
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
                            {validOTP && (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control"
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password-confirm" className="form-label">Nhập lại mật khẩu</label>
                                        <input
                                            type="password"
                                            id="password-confirm"
                                            name="password-confirm"
                                            className="form-control"
                                            placeholder="Nhập lại mật khẩu"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            {!validOTP ? (
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    onClick={otp ? handleConfirmOTP : handleSendOTP}
                                >
                                    {otp ? "Xác nhận OTP" : "Gửi mã OTP"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-success w-100"
                                    onClick={handleRegis}
                                >
                                    Xác nhận
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
            </div >
        </>
    );
}