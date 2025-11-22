import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { getShopOrderDetail } from '../../api/order';
import { type OrderType, type IApiError } from '../../types/OrderType'; // Import các kiểu

// Mở rộng IOrder để bao gồm 'items' (chi tiết sản phẩm)
interface IOrderDetail extends OrderType {
    items: any[]; // Bạn nên tạo interface IOrderItem sau
}

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<IOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getShopOrderDetail(id);
                setOrder(data);
            } catch (err) {
                const axiosError = err as AxiosError<IApiError>;
                setError(axiosError.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) return <div className="container mt-4">Đang tải chi tiết...</div>;
    if (error) return <div className="container mt-4" style={{ color: 'red' }}>Lỗi: {error}</div>;
    if (!order) return <div className="container mt-4">Không tìm thấy đơn hàng.</div>;

    // Giao diện chi tiết
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Chi tiết Đơn hàng #{order.order_id}</h2>
                <Link to="/seller/orders" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại danh sách
                </Link>
            </div>

            {/* Thông tin chung */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header">
                    <strong>Thông tin chung</strong>
                </div>
                <div className="card-body">
                    <p><strong>Ngày đặt:</strong> {new Date(order.order_date).toLocaleString('vi-VN')}</p>
                    <p><strong>Tổng tiền:</strong> {order.total_amount.toLocaleString('vi-VN')} VNĐ</p>
                    <p><strong>Trạng thái:</strong> <span className="badge bg-info">{order.status}</span></p>
                    <p><strong>Thanh toán:</strong> {order.payment_method} ({order.payment_status})</p>
                </div>
            </div>

            {/* Danh sách sản phẩm thuộc shop */}
            <div className="card shadow-sm border-0">
                <div className="card-header">
                    <strong>Sản phẩm trong đơn hàng (Thuộc Shop của bạn)</strong>
                </div>
                <div className="card-body">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th className="text-center">Số lượng</th>
                                <th className="text-end">Giá tại lúc mua</th>
                                <th className="text-end">Tổng phụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.item_id}>
                                    <td>{item.product_name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-end">{item.price_at_purchase.toLocaleString('vi-VN')} VNĐ</td>
                                    <td className="text-end fw-bold">{item.subtotal.toLocaleString('vi-VN')} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;