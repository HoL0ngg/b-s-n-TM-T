import { GrRadialSelected } from "react-icons/gr";
import { FaCcMastercard } from "react-icons/fa";
import type { AddressType } from "../../types/UserType";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAddressByUserId, fetchDefaultAddressByUserId } from "../../api/user";
import { useLocation, useNavigate } from "react-router-dom";
import type { CartItem, CartType } from "../../types/CartType";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegCircle } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6";
import AddressModal from "../../components/AddressModel";
import { createVietQROrder } from "../../api/cart";
import { createPayment_momo, createPayment_vnpay } from "../../api/payments";

export const AddressPage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // (Dùng để điều hướng nếu cả 2 đều rỗng)

    const [address, setAddress] = useState<AddressType[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<AddressType>();
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isShow, setIsShow] = useState(false);
    const { user } = useAuth();
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [qrImage, setQrImage] = useState("");
    const [orderId, setOrderId] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<string>('cod');
    const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

    let [show, setShow] = useState(false);
    useEffect(() => {
        let checkoutItems: CartItem[] = [];
        let checkoutTotal: number = 0;

        if (location.state) {
            checkoutItems = location.state.checkoutItems;
            checkoutTotal = location.state.total;
        }
        // 2. NẾU KHÔNG CÓ (do F5), đọc từ 'sessionStorage'
        else {
            const storedItems = sessionStorage.getItem('checkoutItems');
            const storedTotal = sessionStorage.getItem('checkoutTotal');

            if (storedItems && storedTotal) {
                // Phải dùng JSON.parse để chuyển chuỗi về lại mảng/số
                checkoutItems = JSON.parse(storedItems);
                checkoutTotal = JSON.parse(storedTotal);
            }
        }

        if (checkoutItems.length === 0) {
            alert("Không có sản phẩm nào để thanh toán.");
            navigate('/cart', { replace: true }); // Đá về giỏ hàng
        } else {
            // 4. Set state để render
            setItems(checkoutItems);
            setTotal(checkoutTotal);
        }

        loadAddress();
    }, [user]);

    const loadAddress = async () => {
        try {
            if (user) {
                const data = await fetchAddressByUserId(user.id.toString());
                const hihi = await fetchDefaultAddressByUserId(user.id.toString());

                setSelectedAddress(hihi);
                setAddress(data);
            }

        } catch {

        }
    }

    const groupedCart: CartType[] = useMemo(() => {
        // Nếu không có giỏ hàng, trả về mảng rỗng
        if (!items || items.length === 0) {
            return [];
        }

        // Bắt đầu gom nhóm
        const grouped = items.reduce((acc, item) => {
            const shopId = item.shop_id;

            if (!acc[shopId]) {
                acc[shopId] = {
                    shop_id: shopId,
                    shop_name: item.shop_name,
                    logo_url: item.logo_url,
                    items: [], // Tạo một mảng rỗng cho các sản phẩm
                };
            }

            // 2. Thêm 'item' hiện tại vào đúng nhóm shop của nó
            acc[shopId].items.push(item);

            // Trả về 'acc' cho lần lặp tiếp theo
            return acc;
        }, {} as { [key: number]: CartType }); // Bắt đầu với 1 object rỗng

        return Object.values(grouped);

    }, [items]);

    const handleChangAddress = () => {
        setShow(!show);
    }

    const handleSelectAddress = (id: number) => {
        const newSelectedAddress = address.find(addr => addr.id === id);

        // 2. If found, update the state
        if (newSelectedAddress) {
            setSelectedAddress(newSelectedAddress);
            setShow(false);
        } else {
            console.log("hjhj");

        }
    }

    const handleSaveSuccess = () => {
        setIsShow(false);     // Đóng modal
        setShow(false);
        loadAddress(); // Tải lại danh sách (để reload)
    };

    const handleCreatePaymentUrl = async (provider: string): Promise<string | null> => {
        const checkoutData = {
            total: total
        };
        const processPayment = async (provider: string, data: typeof checkoutData) => {
            try {
                switch (provider) {
                    case 'vnpay':
                        return await createPayment_vnpay(data);
                    case 'momo':
                        return await createPayment_momo(data);
                    default:
                        throw new Error(`Nhà cung cấp chưa được hỗ trợ: ${provider}`);
                }

            } catch (error) {
                console.error('[ERROR] ', error);
                throw new Error('Tạo URL thanh toán thất bại');
            }
        };

        try {
            const response = await processPayment(provider, checkoutData);

            if (response.success && response.paymentUrl) {
                console.log(`URL thanh toán được tạo thành công: ${response.paymentUrl}`);
                return response.paymentUrl;
            } else {
                console.error(response.message || '[ERROR] Lỗi tạo URL thanh toán');
                alert(response.message || '[ERROR] Có lỗi khi tạo URL thanh toán');
                return null;
            }
        } catch (error) {
            console.error('[ERROR] ', error);
            alert(error instanceof Error ? error.message : 'An unknown error occurred');
            return null;
        }
    }
    const handlePlaceOrder = async () => {
        console.log(selectedMethod);
        if (selectedMethod === "cod") {
            alert("Chưa xử lý phương thức COD");
            return;
        }
        const paymentUrl = await handleCreatePaymentUrl(selectedMethod);
        if (paymentUrl) {
            window.location.href = paymentUrl;
        }
    };

    return (
        <>
            <AddressModal isShow={isShow} onClose={() => setIsShow(false)} onSaveSuccess={handleSaveSuccess} address={null} />
            <div className="container p-4">
                <div className="row gx-5">
                    <div className="col-8">
                        <div className="container p-4">
                            {groupedCart.map((shopGroup) => {
                                const subTotal = shopGroup.items.reduce((sum, item) => {
                                    return sum + (item.original_price * item.quantity);
                                }, 0);
                                return (
                                    <div key={shopGroup.shop_id} className="shop-container mb-4">
                                        <div className="shop-header d-flex align-items-center mb-2">
                                            <img src={shopGroup.logo_url} alt={shopGroup.shop_name} style={{ height: '30px', margin: '0 10px' }} />
                                            <h5 className="mb-0">{shopGroup.shop_name}</h5>
                                        </div>

                                        {/* --- PHẦN DANH SÁCH SẢN PHẨM CỦA SHOP --- */}
                                        <div className="items-list border rounded">

                                            {/* 2. Vòng lặp TRONG: Lặp qua từng SẢN PHẨM của shop đó */}
                                            {shopGroup.items.map((item) => (

                                                <div key={item.product_variant_id} className="cart-item d-flex mb-3 p-3">
                                                    <img src={item.product_url} alt={item.product_name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />

                                                    <div className="item-details ms-3 d-flex flex-column justify-content-between">
                                                        <div className="fw-bold mb-1">{item.product_name}</div>
                                                        {/* Hiển thị các thuộc tính (options) */}
                                                        <div className="item-options text-muted small">
                                                            {item.options?.map(opt => (
                                                                <div key={opt.attribute}>
                                                                    {opt.attribute}: {opt.value}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div>Số lượng: {item.quantity}</div>
                                                        <div className="text-danger fw-bold">{Number(item.sale_price ? item.sale_price : item.original_price).toLocaleString('vi-VN')}đ</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="bg-light border border-top p-2 d-flex justify-content-end gap-4">
                                                <div>
                                                    <div>Tiền ship: </div>
                                                    <div>Tổng tiền: </div>
                                                </div>
                                                <div className="text-end">
                                                    <div>20.000đ</div>
                                                    <div>{subTotal.toLocaleString('vi-VN')}đ</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="mb-2 fs-4 ms-2">Chọn địa chỉ giao hàng</div>
                        <div className="bg-light border rounded p-2">
                            {selectedAddress
                                ? (<div className="d-flex align-items-center gap-3 p-2">
                                    <div>
                                        <GrRadialSelected className="text-primary ms-4" />
                                    </div>
                                    <div>
                                        <div className="fw-bolder">{selectedAddress.user_name} ({selectedAddress.phone_number_jdo})</div>
                                        <div className="text-muted">{selectedAddress.street} {selectedAddress.ward} {selectedAddress.city}</div>
                                    </div>
                                </div>)
                                :
                                (<div className="d-flex align-items-center gap-3 p-2">
                                    Bạn 0 có địa chỉ mặc định
                                </div>)}
                            <div className="d-flex align-items-center gap-3 border-top p-2 pointer user-select-none" onClick={() => handleChangAddress()}>
                                <div>
                                    {show ? (<FaAngleUp className="text-primary ms-4" />) : (<FaAngleDown className="text-primary ms-4" />)}
                                </div>
                                <div>
                                    Chọn địa chỉ khác đê
                                </div>
                            </div>

                            <AnimatePresence>
                                {show && (
                                    <motion.div
                                        key="address-list"
                                        initial={{ height: 0, opacity: 0 }} // Bắt đầu: ẩn
                                        animate={{ height: "auto", opacity: 1 }} // Hiện ra: tự động chiều cao
                                        exit={{ height: 0, opacity: 0 }} // Biến mất: về 0
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        style={{ overflow: 'hidden' }} // Rất quan trọng để animation "height" hoạt động
                                    >
                                        {/* Danh sách địa chỉ đã lưu */}
                                        {address.map((add) => {
                                            const isSelected = add.is_default;
                                            const isHovered = hoveredId === add.id;

                                            return (

                                                <div className="d-flex align-items-center gap-3 p-2 border-top checkout-address pointer" key={add.id} onMouseEnter={() => setHoveredId(add.id)}
                                                    onMouseLeave={() => setHoveredId(null)} onClick={() => handleSelectAddress(add.id)}>
                                                    <div>
                                                        {(isHovered || isSelected) ? (<GrRadialSelected className="text-primary ms-4" />) : (<FaRegCircle className="text-primary ms-4" />)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bolder">{add.user_name} ({add.phone_number_jdo})</div>
                                                        <div className="text-muted">{add.street} {add.ward} {add.city}</div>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Nút tạo địa chỉ mới */}
                                        <div className="mt-2 user-select-none">
                                            <button className="btn btn-primary w-100" onClick={() => setIsShow(true)}>
                                                + Tạo địa chỉ mới
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="ms-2 fs-4 mt-4 mb-2">Chọn phương thức thanh toán</div>
                        <div className="bg-light border rounded p-2">
                            {/* <div
                                className="d-flex align-items-center gap-3 p-2 pointer"
                                // 3. Cập nhật state khi click/hover
                                onClick={() => setSelectedMethod('mastercard')}
                                onMouseEnter={() => setHoveredMethod('mastercard')}
                                onMouseLeave={() => setHoveredMethod(null)}
                            > */}
                            {/* 4. Logic hiển thị icon
                                {(selectedMethod === 'mastercard' || hoveredMethod === 'mastercard') ? (
                                    <GrRadialSelected className="text-primary ms-4" />
                                ) : (
                                    <FaRegCircle className="text-primary ms-4" />
                                )}
                                <div>
                                    <FaCcMastercard className="ms-1 fs-3" />
                                </div>
                                <div>
                                    <div>L0ngkute</div>
                                </div>
                            </div> */}
                            <div className="d-flex align-items-center gap-3 p-2 pointer"
                                onClick={() => setSelectedMethod('cod')}
                                onMouseEnter={() => setHoveredMethod('cod')}
                                onMouseLeave={() => setHoveredMethod(null)}>
                                {(selectedMethod === 'cod' || hoveredMethod === 'cod') ? (
                                    <GrRadialSelected className="text-primary ms-4" />
                                ) : (
                                    <FaRegCircle className="text-primary ms-4" />
                                )}
                                <div>
                                    <FaMoneyBillWave className="ms-1 fs-3" style={{ color: '#98cb75' }} />
                                </div>
                                <div>
                                    Chọn thanh toán khi nhận hàng đê
                                </div>
                            </div>
                            <div
                                className="d-flex align-items-center gap-3 border-top p-2 pointer"
                                onClick={() => setSelectedMethod('momo')}
                                onMouseEnter={() => setHoveredMethod('momo')}
                                onMouseLeave={() => setHoveredMethod(null)}
                            >
                                {(selectedMethod === 'momo' || hoveredMethod === 'momo') ? (
                                    <GrRadialSelected className="text-primary ms-4" />
                                ) : (
                                    <FaRegCircle className="text-primary ms-4" />
                                )}
                                <div>
                                    <img src="/assets/momo.png" alt="MoMo" style={{ height: '30px', width: '30px' }} className="ms-1" />
                                </div>
                                <div>
                                    Chọn mono đê
                                </div>
                            </div>

                            <div
                                className="d-flex align-items-center gap-3 border-top p-2 pointer"
                                onClick={() => setSelectedMethod('vnpay')}
                                onMouseEnter={() => setHoveredMethod('vnpay')}
                                onMouseLeave={() => setHoveredMethod(null)}
                            >
                                {(selectedMethod === 'vnpay' || hoveredMethod === 'vnpay') ? (
                                    <GrRadialSelected className="text-primary ms-4" />
                                ) : (
                                    <FaRegCircle className="text-primary ms-4" />
                                )}
                                <div>
                                    <img src="/assets/vnpay.svg" alt="VNPay" style={{ height: '30px', width: '30px' }} className="ms-1" />
                                </div>
                                <div>
                                    Chọn vnpay đê
                                </div>
                            </div>

                        </div>
                        <div className="btn btn-primary w-100 mt-4 p-2" onClick={handlePlaceOrder}>Thanh toán</div>
                    </div>
                </div>
                {/* ... */}
                {qrImage && (
                    <div className="position-fixed top-50 start-50 translate-middle bg-light p-4 border rounded">
                        <h4 className="text-center">Quét mã để thanh toán</h4>
                        <img src={qrImage} alt="Mã VietQR" />
                        <p>Nội dung chuyển khoản: <strong>{orderId}</strong></p>
                    </div>
                )}
            </div >
        </>
    );
}