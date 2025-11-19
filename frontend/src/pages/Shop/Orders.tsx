import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useSearchParams, Link } from 'react-router-dom';

import { getShopOrders, updateShopOrderStatus } from '../../api/order';
import { type IOrder, type OrderStatus, type IApiError } from '../../types/OrderType';

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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
            
            const data = await getShopOrders(statusFilter);
            
            if (Array.isArray(data)) {
                setOrders(data);
            } else if (data && Array.isArray((data as any).data)) {
                setOrders((data as any).data);
            } else {
                setOrders([]); 
            }
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            setError(axiosError.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        if (!window.confirm(`Xác nhận chuyển đơn hàng #${orderId} sang trạng thái "${newStatus}"?`)) {
            return;
        }
        try {
            await updateShopOrderStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thành công!');
            fetchOrders();
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            alert('Lỗi: ' + (axiosError.response?.data?.message || 'Không thể cập nhật trạng thái.'));
        }
    };

    const getValidNextStatuses = (currentStatus: string): OrderStatus[] => {
        const validStatuses: OrderStatus[] = [currentStatus as OrderStatus];
        switch (currentStatus) {
            case 'Pending': validStatuses.push('Processing', 'Cancelled'); break;
            case 'Processing': validStatuses.push('Shipped', 'Cancelled'); break;
            case 'Shipped': validStatuses.push('Delivered', 'Cancelled'); break;
        }
        const statusSet = new Set(validStatuses);
        return ALL_STATUSES.filter(status => statusSet.has(status));
    };

    if (loading) return <div className="container mt-4 text-center"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Đang tải dữ liệu...</p></div>;
    if (error) return <div className="container mt-4 alert alert-danger">Lỗi: {error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Quản lý Đơn hàng</h2>
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col">Mã Đơn</th>
                                    <th scope="col">Khách hàng</th>
                                    <th scope="col">Ngày đặt</th>
                                    <th scope="col" className="text-end">Tổng tiền</th>
                                    <th scope="col">TT Thanh toán</th>
                                    <th scope="col" className="text-center">Trạng thái</th>
                                    <th scope="col" className="text-center" style={{ minWidth: '190px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center p-4 text-muted">Không tìm thấy đơn hàng nào.</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.order_id}>
                                            {/* 1. Mã Đơn */}
                                            <td>
                                                <strong className="text-primary">#{order.order_id}</strong>
                                            </td>

                                            {/* 2. Khách hàng (SĐT) */}
                                            <td>
                                                <i className="bi bi-person-circle me-1 text-secondary"></i>
                                                {order.user_id}
                                            </td>
                                            
                                            {/* 3. Ngày đặt */}
                                            <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                                            
                                            {/* 4. Tổng tiền (Bao gồm phí ship nếu muốn hiển thị tooltip) */}
                                            <td className="text-end fw-bold" title={`Phí ship: ${order.shipping_fee?.toLocaleString('vi-VN')}đ`}>
                                                {order.total_amount?.toLocaleString('vi-VN')} đ
                                            </td>
                                            
                                            {/* 5. Trạng thái Thanh toán */}
                                            <td>
                                                <div className="d-flex flex-column small">
                                                    {/* <span className="fw-bold mb-1">{order.payment_method}</span> */}
                                                    
                                                    {order.payment_status === 'Paid' ? (
                                                        <span className="badge bg-success bg-opacity-10 text-success border border-success">
                                                            <i className="bi bi-check-circle-fill me-1"></i> Đã thanh toán
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                                                            <i className="bi bi-hourglass-split me-1"></i> Chưa thanh toán
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* 6. Trạng thái Đơn hàng */}
                                            <td className="text-center">
                                                <span className={`badge ${getStatusColor(order.status as OrderStatus)}`}>
                                                    <i className={`bi ${getStatusIcon(order.status as OrderStatus)} me-1`}></i>
                                                    {order.status}
                                                </span>
                                            </td>
                                            
                                            {/* 7. Hành động */}
                                            <td className="text-center">
                                                <Link to={`/seller/orders/${order.order_id}`} className="btn btn-sm btn-outline-primary me-2" title="Xem chi tiết">
                                                    <i className="bi bi-eye"></i>
                                                </Link>
                                                
                                                {order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                                                    <select
                                                        className="form-select form-select-sm d-inline-block cursor-pointer"
                                                        style={{ width: 'auto', borderColor: '#0d6efd' }}
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value as OrderStatus)}
                                                    >
                                                        {getValidNextStatuses(order.status).map(status => (
                                                            <option key={status} value={status}>
                                                                {status === order.status ? status : `${status}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-success"><i className="bi bi-check-all"></i> Hoàn tất</span>
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
        </div>
    );
}

// --- Helper Functions ---
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