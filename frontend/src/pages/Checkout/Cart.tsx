import { useEffect, useRef, useState } from "react";
import { getCartByUserId, updateProductQuantity } from "../../api/cart";
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
        const loadCart = async () => {
            try {
                const data = await getCartByUserId();

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
                // console.log(grouped);

                setCart(Object.values(grouped));
            } catch (err) {
                console.log(err);
            }
        }
        loadCart();
    }, [user]);

    // Hàm (giả lập) gọi API để cập nhật CSDL
    const updateCartInDatabase = async (productId: number, newQuantity: number) => {
        console.log(`%cCALLING API:`, 'color: #f0a;', `Cập nhật product_id ${productId} thành số lượng ${newQuantity}`);
        try {
            const res = await updateProductQuantity(productId, newQuantity);
            if (!res.success) {
                console.log("Có lỗi");
            }
        } catch (Err) {
            console.log(Err);
        }
    };

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

    /**
 * Hàm chính xử lý tất cả logic thay đổi số lượng.
 */
    const handleQuantityChange = (productId: number, newQuantity: number) => {
        const finalQuantity = Math.max(newQuantity, 1);

        setCart(currentCart => {
            // Dùng map để tạo mảng shop mới (immutable)
            return currentCart.map(shop => {
                // Tìm xem item có trong shop này không
                const itemExistsInThisShop = shop.items.some(
                    item => item.product_id === productId
                );

                // Nếu không có, trả về shop này y nguyên
                if (!itemExistsInThisShop) {
                    return shop;
                }

                // Nếu có, tạo mảng 'items' mới cho shop này
                const newItems = shop.items.map(item => {
                    // Nếu không phải item cần tìm, trả về y nguyên
                    if (item.product_id !== productId) {
                        return item;
                    }
                    // Nếu đúng là item, trả về item mới với quantity đã cập nhật
                    return { ...item, quantity: finalQuantity };
                });

                // Trả về shop với mảng 'items' đã được cập nhật
                return { ...shop, items: newItems };
            });
        });

        // Hủy bỏ timer cũ của sản phẩm này (nếu có)
        if (debounceTimers.current[productId]) {
            clearTimeout(debounceTimers.current[productId]);
        }

        // Đặt một timer mới
        debounceTimers.current[productId] = setTimeout(() => {
            // Gọi API sau 1.5 giây
            updateCartInDatabase(productId, finalQuantity);
        }, 1500); // 1.5 giây
    };

    const handleIncrease = (productId: number, currentQuantity: number) => {
        handleQuantityChange(productId, currentQuantity + 1);
    };

    const handleDecrease = (productId: number, currentQuantity: number) => {
        handleQuantityChange(productId, currentQuantity - 1);
    };

    const handleCheckout = () => {
        setLoading(true);
        setTimeout(() => {
            // navigate("/cart/Information");
        }, 1000);
    }

    if (!user) return (<div>Đăng nhập đi b ei</div>)

    return (
        <>
            <div className="container p-4">
                {cart.map(shop => {
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
                                                    <div className="border-end px-2 py-1 pointer" onClick={() => handleDecrease(item.product_id, item.quantity)}><i className="fa-solid fa-minus"></i></div>
                                                    <input type="text" className="text-center text-primary" value={item.quantity} readOnly style={{ outline: "none", width: "50px", border: "none" }} />
                                                    <div className="border-start px-2 py-1 pointer" onClick={() => handleIncrease(item.product_id, item.quantity)}><i className="fa-solid fa-plus"></i></div>
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