import Breadcrumbs from "../components/Breadcrumb";
import { useState } from "react";

export default function Cart() {
    const cartShop = [
        { id: 1, name: "Long kute" },
        { id: 2, name: "L0ngkute" }
    ]

    const cartItems = [
        { shopid: 1, productid: 1, name: "Áo thun nam", price: 200000, quantity: 2 },
        { shopid: 1, productid: 2, name: "Quần jean nữ", price: 300000, quantity: 1 },
        { shopid: 2, productid: 3, name: "Giày thể thao", price: 500000, quantity: 1 },
    ]

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleCheckboxChange = (productid: number) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(productid)
                ? prevSelected.filter(id => id !== productid) // Uncheck
                : [...prevSelected, productid] // Check
        );
    };

    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.productid))
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    return (
        <>
            <Breadcrumbs />
            <div className="container mt-4 bg-light p-4 rounded shadow">
                {cartShop.map(shop => {
                    const items = cartItems.filter(item => item.shopid === shop.id);
                    return (
                        <div key={shop.id} className="mb-4">
                            <h4 className="mb-3">Shop: {shop.name}</h4>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.productid}>
                                            <td><input type="checkbox" checked={selectedItems.includes(item.productid)} onChange={() => handleCheckboxChange(item.productid)} /></td>
                                            <td>{item.name}</td>
                                            <td>{item.price.toLocaleString()} ₫</td>
                                            <td>{item.quantity}</td>
                                            <td>{(item.price * item.quantity).toLocaleString()} ₫</td>
                                            <td><button className="btn btn-danger btn-sm">Xóa</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
                <h4 className="text-end">Tổng cộng: {calculateTotal().toLocaleString()}₫</h4>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-success">Thanh toán</button>
                </div>
            </div>
        </>
    );
}
