export const sendOtp = async (email: string) => {
    const response = await fetch(`${process.env.VITE_API_URL}/api/mail/send-otp`, {
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
    const response = await fetch(`${process.env.VITE_API_URL}/api/mail/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
    });
    console.log(response);

    return response.json();
};