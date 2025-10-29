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
import { FaAngleUp } from "react-icons/fa6";
import AddressModal from "../../components/AddressModel";

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

    return (
        <>
            <AddressModal isShow={isShow} onClose={() => setIsShow(false)} onSaveSuccess={handleSaveSuccess} />
            <div className="container p-4">
                <div className="row gx-5">
                    <div className="col-7">
                        <div className="container p-4">
                            {groupedCart.map((shopGroup) => (
                                <div key={shopGroup.shop_id} className="shop-container mb-4">
                                    <div className="shop-header d-flex align-items-center mb-2">
                                        <img src={shopGroup.logo_url} alt={shopGroup.shop_name} style={{ height: '30px', margin: '0 10px' }} />
                                        <h5 className="mb-0">{shopGroup.shop_name}</h5>
                                    </div>

                                    {/* --- PHẦN DANH SÁCH SẢN PHẨM CỦA SHOP --- */}
                                    <div className="items-list border rounded p-3">

                                        {/* 2. Vòng lặp TRONG: Lặp qua từng SẢN PHẨM của shop đó */}
                                        {shopGroup.items.map((item) => (

                                            <div key={item.product_variant_id} className="cart-item d-flex mb-3">
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
                                                    <div className="text-danger fw-bold">{item.product_price.toLocaleString()}đ</div>
                                                </div>

                                                {/* (Thêm nút tăng/giảm số lượng ở đây) */}
                                            </div>

                                        ))}
                                    </div>
                                    <div>
                                        <div>Tiền ship: 30k</div>
                                        <div>Thành tiền: {total}đ</div>
                                    </div>
                                </div>

                            ))}
                        </div>
                    </div>
                    <div className="col-5">
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
                            <div className="d-flex align-items-center gap-3 p-2">
                                <div>
                                    <FaCcMastercard className="ms-4 fs-3" />
                                </div>
                                <div>
                                    <div className="fw-bolder">L0ngkute (0937211264)</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 border-top p-2">
                                <div>
                                    <img src="/assets/momo.png" alt="" style={{ height: '30px', width: '30px' }} className="ms-4" />
                                </div>
                                <div>
                                    Chọn mono đê
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 border-top p-2">
                                <div>
                                    <img src="/assets/vnpay.svg" alt="" style={{ height: '30px', width: '30px' }} className="ms-4" />
                                </div>
                                <div>
                                    Chọn vnpay đê
                                </div>
                            </div>
                        </div>
                        <div className="btn btn-primary w-100 mt-4 p-2">Thanh toán</div>
                    </div>
                </div>
            </div>
        </>
    );
}