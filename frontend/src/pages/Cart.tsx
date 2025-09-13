export default function Cart() {
    const cart = [
        { id: 1, name: "Laptop Dell XPS", price: 25000000, quantity: 1 },
        { id: 2, name: "Tai nghe Sony", price: 3500000, quantity: 2 },
    ];

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="container mt-4">
            <h3>Giỏ hàng</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.price.toLocaleString()} ₫</td>
                            <td>{item.quantity}</td>
                            <td>{(item.price * item.quantity).toLocaleString()} ₫</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h4 className="text-end">Tổng cộng: {total.toLocaleString()} ₫</h4>
            <button className="btn btn-success float-end">Thanh toán</button>
        </div>
    );
}
