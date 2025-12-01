import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ReturnUrlPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resCode = params.get("vnp_ResponseCode");
        const handlePayment = async () => {
            if (resCode === "00") {
                const result = await Swal.fire({
                    icon: "success",
                    title: "Đặt hàng thành công",
                    text: "Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ sớm liên hệ với bạn.",
                    confirmButtonText: "Tiếp tục mua sắm",
                    confirmButtonColor: "#0d6efd",
                    width: "500px",
                    padding: "3em",
                    backdrop: true
                });

                if (result.isConfirmed) {
                    navigate("/", { replace: true });
                }
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Thanh toán thất bại",
                    text: "Giao dịch không thành công. Vui lòng thử lại.",
                    confirmButtonColor: "#dc3545"
                });
                navigate("/checkout/address", { replace: true });
            }
        };

        handlePayment();
    }, []);

    return null;
}
