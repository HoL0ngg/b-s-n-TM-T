// import React, { useState, useEffect } from 'react';
// import { AxiosError } from 'axios';
// import { useSearchParams } from 'react-router-dom';
// import { getShopOrders, updateShopOrderStatus } from '../../api/order'; 
// import { type IOrder, type OrderStatus, type IApiError } from '../../types/OrderType';
// import 'bootstrap-icons/font/bootstrap-icons.css';

// export default function Orders() {
//     const [orders, setOrders] = useState<IOrder[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const [searchParams] = useSearchParams();
//     const statusFilter = searchParams.get('status');

// const fetchOrders = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const data: IOrder[] = await getShopOrders(statusFilter);
//             setOrders(data);
//         } catch (err) {
//             const axiosError = err as AxiosError<IApiError>;
//             setError(axiosError.response?.data?.message || 'Lỗi khi tải đơn hàng.');
//         } finally {
//             setLoading(false);
//         }
//     };
//     useEffect(() => {
//         fetchOrders();
//     }, [statusFilter]);

//     const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
//         if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng #${orderId} sang "${newStatus}"?`)) {
//             return;
//         }
//         try {
//             await updateShopOrderStatus(orderId, newStatus);
//             alert('Cập nhật trạng thái thành công!');
//             fetchOrders();
//         } catch (err) {
//             const axiosError = err as AxiosError<IApiError>;
//             alert('Lỗi khi cập nhật: ' + (axiosError.response?.data?.message || 'Lỗi không xác định'));
//         }
//     };

//     if (loading) return <div className="container mt-4">Đang tải dữ liệu đơn hàng của Shop...</div>;
//     if (error) return <div className="container mt-4" style={{ color: 'red' }}>Lỗi: {error}</div>;

//     return (
//         <div className="container mt-4">
//             <h2>Quản lý Đơn hàng</h2>

//             <table className="table table-striped table-bordered">
//                 <thead className="thead-dark">
//                     <tr>
//                         <th>Mã Đơn</th>
//                         <th>Ngày đặt</th>
//                         <th>Tổng tiền</th>
//                         <th>Trạng thái</th>
//                         <th>Hành động</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {orders.length === 0 ? (
//                         <tr>
//                             <td colSpan={5} className="text-center">Bạn chưa có đơn hàng nào.</td>
//                         </tr>
//                     ) : (
//                         orders.map(order => (
//                             <tr key={order.order_id}>
//                                 <td>#{order.order_id}</td>
//                                 <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
//                                 <td>{order.total_amount.toLocaleString('vi-VN')} VNĐ</td>
//                                 <td>
//                                     <span className={`badge ${getStatusColor(order.status)}`}>
//                                         {order.status}
//                                     </span>
//                                 </td>
//                                 <td>
//                                     {order.status === 'Pending' && (
//                                         <button 
//                                             className="btn btn-primary btn-sm"
//                                             onClick={() => handleStatusChange(order.order_id, 'Processing')}
//                                         >
//                                             Xác nhận đơn
//                                         </button>
//                                     )}
//                                     {order.status === 'Processing' && (
//                                         <button 
//                                             className="btn btn-success btn-sm"
//                                             onClick={() => handleStatusChange(order.order_id, 'Shipped')}
//                                         >
//                                             Giao hàng
//                                         </button>
//                                     )}
//                                 </td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// // Hàm tiện ích đổi màu trạng thái (dùng Bootstrap 5)
// const getStatusColor = (status: OrderStatus) => {
//     switch (status) {
//         case 'Pending': return 'bg-warning text-dark';
//         case 'Processing': return 'bg-info text-white';
//         case 'Shipped': return 'bg-primary text-white';
//         case 'Delivered': return 'bg-success text-white';
//         case 'Cancelled': return 'bg-danger text-white';
//         default: return 'bg-secondary text-white';
//     }
// };

import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useSearchParams, Link } from 'react-router-dom'; // 1. Import thêm 'Link'
import { getShopOrders, updateShopOrderStatus } from '../../api/order';
import { type IOrder, type OrderStatus, type IApiError } from '../../types/OrderType';
// 2. Import Bootstrap Icons (giả sử bạn đã setup, nếu chưa hãy npm install bootstrap-icons)
// import 'bootstrap-icons/font/bootstrap-icons.css'; 

export default function Orders() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data: IOrder[] = await getShopOrders(statusFilter);
            setOrders(data);
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            setError(axiosError.response?.data?.message || 'Lỗi khi tải đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng #${orderId} sang "${newStatus}"?`)) {
            return;
        }
        try {
            await updateShopOrderStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thành công!');
            fetchOrders();
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            alert('Lỗi khi cập nhật: ' + (axiosError.response?.data?.message || 'Lỗi không xác định'));
        }
    };

    if (loading) return <div className="container mt-4">Đang tải dữ liệu đơn hàng của Shop...</div>;
    if (error) return <div className="container mt-4" style={{ color: 'red' }}>Lỗi: {error}</div>;

    // 3. --- GIAO DIỆN NÂNG CẤP BẮT ĐẦU TỪ ĐÂY ---
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Quản lý Đơn hàng</h2>

            {/* Bọc bảng trong 1 card để chuyên nghiệp hơn */}
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">Mã Đơn</th>
                                <th scope="col">Ngày đặt</th>
                                <th scope="col" className="text-end">Tổng tiền</th>
                                <th scope="col">Phương thức TT</th>
                                <th scope="col" className="text-center">Trạng thái TT</th>
                                <th scope="col" className="text-center">Trạng thái ĐH</th>
                                <th scope="col" className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-4">Bạn chưa có đơn hàng nào.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.order_id}>
                                        {/* Mã Đơn */}
                                        <td>
                                            <strong className="text-primary">#{order.order_id}</strong>
                                        </td>

                                        {/* Ngày đặt */}
                                        <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>

                                        {/* Tổng tiền (Căn phải) */}
                                        <td className="text-end fw-bold">
                                            {order.total_amount.toLocaleString('vi-VN')} VNĐ
                                        </td>

                                        {/* Phương thức TT */}
                                        <td>{order.payment_method}</td>

                                        {/* Trạng thái TT (Căn giữa) */}
                                        <td className="text-center">
                                            <span className={`badge ${order.payment_status === 'Paid' ? 'bg-success' : 'bg-secondary'}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>

                                        {/* Trạng thái ĐH (Căn giữa, có Icon) */}
                                        <td className="text-center">
                                            <span className={`badge ${getStatusColor(order.status)}`}>
                                                <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* Hành động (Căn giữa) */}
                                        <td className="text-center">
                                            {/* Nút Xem chi tiết (ví dụ) */}
                                            <Link
                                                to={`/seller/orders/${order.order_id}`}
                                                className="btn btn-sm btn-outline-primary me-2"
                                                title="Xem chi tiết"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </Link>

                                            {/* Các nút hành động */}
                                            {order.status === 'Pending' && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    title="Xác nhận đơn"
                                                    onClick={() => handleStatusChange(order.order_id, 'Processing')}
                                                >
                                                    <i className="bi bi-check-lg"></i>
                                                </button>
                                            )}
                                            {order.status === 'Processing' && (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    title="Giao hàng"
                                                    onClick={() => handleStatusChange(order.order_id, 'Shipped')}
                                                >
                                                    <i className="bi bi-truck"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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

// 4. HÀM MỚI: Lấy Icon dựa trên trạng thái
const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bi-clock-history';
        case 'Processing': return 'bi-box-seam';
        case 'Shipped': return 'bi-truck';
        case 'Delivered': return 'bi-check-circle-fill';
        case 'Cancelled': return 'bi-x-circle-fill';
        default: return 'bi-question-circle';
    }
};