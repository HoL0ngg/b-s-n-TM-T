import { useEffect, useRef, useState } from "react";
import { getCartByUserId } from "../../api/cart";
import { useAuth } from "../../context/AuthContext";
import type { CartItem, CartType } from "../../types/CartType";
// import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [cart, setCart] = useState<CartType[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    // const navigate = useNavigate();
    const { user } = useAuth();

    // Ref để lưu trữ các timer (mỗi sản phẩm 1 timer)
    const debounceTimers = useRef<{ [key: string]: number }>({});

    useEffect(() => {
        const loadCart = async (id: number) => {

            try {
                const data = await getCartByUserId(id);
                console.log(data);

                const grouped = data.reduce((acc: any, item: any) => {
                    // Lấy thông tin shop
                    const shopId = item.shop_id;
                    const shopName = item.shop_name;
                    const logoUrl = item.logo_url;

                    // Nếu shop này chưa có trong 'acc' (accumulator)
                    if (!acc[shopId]) {
                        // Tạo một mục mới cho shop
                        acc[shopId] = {
                            shop_id: shopId,
                            shop_name: shopName,
                            logo_url: logoUrl,
                            items: [] // và một mảng rỗng để chứa sản phẩm
                        };
                    }

                    // Thêm sản phẩm này vào mảng 'items' của shop đó
                    acc[shopId].items.push(item);

                    return acc;
                }, {});
                console.log(grouped);

                setCart(Object.values(grouped));
            } catch (err) {
                console.log(err);
            }

        }
        if (user)
            loadCart(user.id);
    }, [user])

    const handleCheckboxChange = (productid: number) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(productid)
                ? prevSelected.filter(id => id !== productid) // Uncheck
                : [...prevSelected, productid] // Check
        );
    };

    const handleShopCheckboxChange = (items: CartItem[]) => {
        const shopItemIds = items.map(item => item.product_id);

        setSelectedItems(prevSelected => {
            const allSelected = shopItemIds.every(id => prevSelected.includes(id));

            if (allSelected) {
                // Bỏ chọn tất cả item trong shop này
                return prevSelected.filter(id => !shopItemIds.includes(id));
            } else {
                // Chọn tất cả item trong shop này
                // (Dùng Set để tránh thêm trùng lặp)
                return [...new Set([...prevSelected, ...shopItemIds])];
            }
        });
    };

    const increment = () => (console.log("hihi"));
    const decrement = () => (console.log("heheh"));

    const calculateTotal = () => {
        if (!cart || cart.length === 0) {
            return 0;
        }

        // 1. Dùng `flatMap` để "làm phẳng" cấu trúc nhóm
        // Biến `allItems` này sẽ là một mảng `CartItem[]` đơn giản
        const allItems: CartItem[] = cart.flatMap(shop => shop.items);

        // 2. Bây giờ, bạn dùng logic .filter().reduce()
        //    giống hệt như tôi đã đề xuất
        return allItems
            .filter(item => selectedItems.includes(item.product_id))
            .reduce((sum, item) => {
                const price = item.product_price || 0;
                const quantity = item.quantity || 0;
                return sum + (price * quantity);
            }, 0);
    };

    const handleCheckout = () => {
        setLoading(true);
        setTimeout(() => {
            // navigate("/cart/Information");
        }, 1000);
    }

    if (!user) return (<div>Đang tải hihi ...</div>)

    return (
        <>
            <div className="container p-4">
                {cart.map(shop => {
                    console.log(shop);
                    const allShopItemsSelected = shop.items.every(item => selectedItems.includes(item.product_id));

                    return (
                        <div key={shop.shop_id} className="mb-4">
                            <div className="m-2 fs-4 d-flex align-items-center justify-content-between">
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={allShopItemsSelected}
                                        onChange={() => handleShopCheckboxChange(shop.items)}
                                    />
                                    <img className="m-2" src={shop.logo_url} style={{ height: '50px', width: '50px' }} /> {shop.shop_name}
                                </div>
                                <div className="text-muted pointer" style={{ fontSize: '0.8rem' }}>
                                    XÓA TẤT CẢ
                                </div>
                            </div>
                            <div className="container bg-light px-4 rounded border">
                                {shop.items.map(item => (
                                    <div key={item.product_id} className="row mb-4 border-top pt-4">
                                        <div className="col-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.product_id)}
                                                onChange={() => handleCheckboxChange(item.product_id)}
                                            />
                                            <img src={item.product_url} className="rounded ms-2" alt="" style={{ height: '150px', width: '150px' }} />
                                        </div>
                                        <div className="col-8 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="fw-bolder">{item.product_name}</div>
                                                <div>Ghi các biến thể ở đây</div>
                                                <div>Ghi các biến thể ở đây</div>
                                            </div>
                                            <div><span className="fw-bolder">{item.product_price.toLocaleString()} </span>₫</div>
                                        </div>
                                        <div className="col-2 text-end d-flex flex-column justify-content-between">
                                            <div className="d-flex justify-content-end">
                                                <div className="pointer">x</div>
                                            </div>
                                            <div className="mt-2 d-flex align-items-center gap-3 justify-content-end">
                                                <div className="d-flex my-1 border rounded-pill">
                                                    <div className="border-end px-2 py-1 pointer" onClick={decrement}><i className="fa-solid fa-minus"></i></div>
                                                    <input type="text" className="text-center text-primary" value={item.quantity} readOnly style={{ outline: "none", width: "50px", border: "none" }} />
                                                    <div className="border-start px-2 py-1 pointer" onClick={increment}><i className="fa-solid fa-plus"></i></div>
                                                </div>
                                                {/* <div className="text-muted">{product.sold_count} Sản phẩm có sẵn</div> */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                <h4 className="text-end">Tổng cộng: {calculateTotal().toLocaleString()}₫</h4>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-success" onClick={handleCheckout}>{loading ? "Đang tải..." : "Thanh toán"}</button>
                </div>
            </div>
            {loading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </>
    );
}