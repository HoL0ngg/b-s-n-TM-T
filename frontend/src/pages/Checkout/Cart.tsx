import { useState } from "react";
// import { useNavigate } from "react-router-dom";

export default function Cart() {
    const cartShop = [
        { id: 1, name: "Long kute" },
        { id: 2, name: "L0ngkute" }
    ];

    const cartItems = [
        { shopid: 1, productid: 1, name: "Áo thun nam", price: 200000, quantity: 2 },
        { shopid: 1, productid: 2, name: "Quần jean nữ", price: 300000, quantity: 1 },
        { shopid: 2, productid: 3, name: "Giày thể thao", price: 500000, quantity: 1 },
        { shopid: 2, productid: 4, name: "Giày thể thao", price: 500000, quantity: 1 },
        { shopid: 2, productid: 5, name: "Giày thể thao", price: 500000, quantity: 1 },
    ];

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    // const navigate = useNavigate();

    const handleCheckboxChange = (productid: number) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(productid)
                ? prevSelected.filter(id => id !== productid) // Uncheck
                : [...prevSelected, productid] // Check
        );
    };

    const handleShopCheckboxChange = (shopid: number) => {
        const shopItemIds = cartItems.filter(item => item.shopid === shopid).map(item => item.productid);

        setSelectedItems(prevSelected => {
            const allSelected = shopItemIds.every(id => prevSelected.includes(id));
            if (allSelected) {
                // Uncheck all items in the shop
                return prevSelected.filter(id => !shopItemIds.includes(id));
            } else {
                // Check all items in the shop
                return [...prevSelected, ...shopItemIds.filter(id => !prevSelected.includes(id))];
            }
        });
    };

    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.productid))
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleCheckout = () => {
        setLoading(true);
        setTimeout(() => {
            // navigate("/cart/Information");
        }, 1000);
    }

    return (
        <>
            <div className="container p-4">
                {cartShop.map(shop => {
                    const items = cartItems.filter(item => item.shopid === shop.id);
                    const allShopItemsSelected = items.every(item => selectedItems.includes(item.productid));

                    return (
                        <div key={shop.id} className="mb-4">
                            <div className="m-2 fs-4 d-flex align-items-center justify-content-between">
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={allShopItemsSelected}
                                        onChange={() => handleShopCheckboxChange(shop.id)}
                                    />
                                    <img className="m-2" src="/assets/shops/thegioiskinfood.png" style={{ height: '50px', width: '50px' }} /> {shop.name}
                                </div>
                                <div className="text-muted pointer" style={{ fontSize: '0.8rem' }}>
                                    XÓA TẤT CẢ
                                </div>
                            </div>
                            <div className="container bg-light px-4 rounded border">
                                {items.map(item => (
                                    <div key={item.productid} className="row mb-4 border-top pt-4">
                                        <div className="col-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.productid)}
                                                onChange={() => handleCheckboxChange(item.productid)}
                                            />
                                            <img src="/assets/products/son2.jpg" className="rounded ms-2" alt="" style={{ height: '150px', width: '150px' }} />
                                        </div>
                                        <div className="col-7 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="fw-bolder">{item.name}</div>
                                                <div>Ghi các biến thể ở đây</div>
                                                <div>Ghi các biến thể ở đây</div>
                                            </div>
                                            <div>{item.price.toLocaleString()} ₫</div>
                                        </div>
                                        <div className="col-3 text-end d-flex flex-column justify-content-between">
                                            <div className="pointer">x</div>
                                            <div>
                                                <span>-</span>
                                                <span>1</span>
                                                <span>+</span>
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