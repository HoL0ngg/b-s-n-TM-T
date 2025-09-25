export const sendOtp = async (email: string) => {
    const response = await fetch("http://localhost:5000/api/mail/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to send OTP");
    }

    return response.json();
};

export const verifyOtp = async (email: string, otpCode: string) => {
    const response = await fetch("http://localhost:5000/api/mail/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
    });
    console.log(response);

    return response.json();
};