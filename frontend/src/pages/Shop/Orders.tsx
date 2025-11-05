// // src/pages/Shop/Orders.tsx
// export default function Orders() {
//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Order Shop</h1>
//       <p>Trang quản lý cửa hàng đang hoạt động bình thường!</p>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { getShopOrders, updateShopOrderStatus } from '../../api/order'; 
import { type IOrder, type OrderStatus, type IApiError } from '../../types/OrderType';

export default function Orders() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hàm tải dữ liệu đơn hàng
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data: IOrder[] = await getShopOrders();
            setOrders(data);
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            setError(axiosError.response?.data?.message || 'Lỗi khi tải đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách đơn hàng khi trang được mở
    useEffect(() => {
        fetchOrders();
    }, []);

    // Hàm xử lý khi Shop cập nhật trạng thái
    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng #${orderId} sang "${newStatus}"?`)) {
            return;
        }
        try {
            await updateShopOrderStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thành công!');
            fetchOrders(); // Tải lại danh sách
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            alert('Lỗi khi cập nhật: ' + (axiosError.response?.data?.message || 'Lỗi không xác định'));
        }
    };

    if (loading) return <div className="container mt-4">Đang tải dữ liệu đơn hàng của Shop...</div>;
    // Hiển thị lỗi từ Backend (ví dụ: "Người dùng này không sở hữu Shop nào.")
    if (error) return <div className="container mt-4" style={{ color: 'red' }}>Lỗi: {error}</div>;

    return (
        <div className="container mt-4">
            <h2>Quản lý Đơn hàng</h2>
            
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th>Mã Đơn</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center">Bạn chưa có đơn hàng nào.</td>
                        </tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order.order_id}>
                                <td>#{order.order_id}</td>
                                <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                                <td>{order.total_amount.toLocaleString('vi-VN')} VNĐ</td>
                                <td>
                                    <span className={`badge ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    {order.status === 'Pending' && (
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusChange(order.order_id, 'Processing')}
                                        >
                                            Xác nhận đơn
                                        </button>
                                    )}
                                    {order.status === 'Processing' && (
                                        <button 
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleStatusChange(order.order_id, 'Shipped')}
                                        >
                                            Giao hàng
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// Hàm tiện ích đổi màu trạng thái (dùng Bootstrap 5)
const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bg-warning text-dark';
        case 'Processing': return 'bg-info text-white';
        case 'Shipped': return 'bg-primary text-white';
        case 'Delivered': return 'bg-success text-white';
        case 'Cancelled': return 'bg-danger text-white';
        default: return 'bg-secondary text-white';
    }
};