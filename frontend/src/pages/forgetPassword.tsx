import { useState } from "react";
import { sendOtp, verifyOtp } from "../api/otp";
import Breadcrumbs from "../components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/jwt";

export default function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [validotp, setValidOTP] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigator = useNavigate();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const validateEmail = (mail: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(mail);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);
        if (!otpSent) {
            if (!validateEmail(email)) {
                setError("Vui lòng nhập email hợp lệ.");
                return;
            }

            setLoading(true);
            try {
                // Call backend API to send OTP
                await sendOtp(email);
                setOtpSent(true);
                setSuccess(true);
            } catch (err) {
                setError("Đã có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        } else if (!validotp) {
            if (otpInput.length < 6) {
                setError("Vui lòng nhập đầy đủ 6 chữ số của mã OTP.");
                setLoading(false);
                return;
            }
            const otpValue = otpInput.join("");
            try {
                const res = await verifyOtp(email, otpValue);
                if (res.success) {
                    // OTP is correct, proceed with registration
                    setValidOTP(true);
                } else {
                    setError("Mã OTP không đúng. Vui lòng thử lại.");
                }
            } catch (err: any) {
                setError("OTP không hợp lệ");
            } finally {
                setLoading(false);
            }
        } else {
            if (password !== confirmPassword) {
                setError("Mật khẩu và xác nhận mật khẩu không khớp.");
                return;
            }
            try {
                await changePassword(email, password);
                alert("Đổi mật khẩu thành công");
                navigator("/login");
            } catch (err: any) {
                alert(err.response?.data?.message || "Login thất bại");
            }
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

    return (
        <>
            <Breadcrumbs />
            <div className="container d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
                <div className="card shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">Quên mật khẩu</h3>
                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        {success && <div className="alert alert-success text-center">OTP đã được gửi thành công!</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                />
                            </div>
                            {otpSent && !validotp && (<div className="mb-3">
                                <label htmlFor="otp" className="form-label">Nhập mã OTP</label>
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
                            </div>)}
                            {validotp && (
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
                            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                {loading ? "Đang gửi..." : (otpSent ? "Xác nhận" : "Gửi mã OTP")}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}