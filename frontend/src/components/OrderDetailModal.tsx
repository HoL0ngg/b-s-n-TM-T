import { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Badge, Spinner } from 'react-bootstrap';
import type { OrderDetailType } from '../types/OrderType';
import { apiGetOrderDetail } from '../api/order';

interface OrderDetailModalProps {
    show: boolean;
    onHide: () => void;
    orderId: number | null;
    onUpdateSuccess: () => void; // Callback để reload bảng danh sách
}

export default function OrderDetailModal({ show, onHide, orderId, onUpdateSuccess }: OrderDetailModalProps) {

    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // State cho dropdown chọn trạng thái mới
    const [newStatus, setNewStatus] = useState("");

    // 1. Tải dữ liệu khi Modal mở
    useEffect(() => {
        if (show && orderId) {
            setIsLoading(true);
            apiGetOrderDetail(orderId)
                .then((data: any) => {
                    setOrder(data);
                    setNewStatus(data.status);
                })
                .catch((err: any) => {
                    console.error("Lỗi tải chi tiết đơn hàng:", err);
                    alert("Không thể tải thông tin đơn hàng.");
                    onHide();
                })
                .finally(() => setIsLoading(false));
        } else {
            setOrder(null);
        }
    }, [show, orderId]);

    // 2. Xử lý cập nhật trạng thái
    const handleUpdateStatus = async () => {
        if (!orderId) return;

        // Xác nhận trước khi đổi
        if (!window.confirm("Bạn chắc chắn muốn cập nhật trạng thái đơn hàng?")) return;

        setIsUpdating(true);
        try {
            // await apiUpdateOrderStatus(orderId, newStatus);
            // alert("Cập nhật trạng thái thành công!");
            onUpdateSuccess(); // Báo cha reload
            onHide(); // Đóng modal
        } catch (error) {
            console.error(error);
            alert("Lỗi khi cập nhật trạng thái.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Helper: Danh sách trạng thái để render option
    const STATUS_OPTIONS = [
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'shipping', label: 'Đang giao hàng' },
        { value: 'delivered', label: 'Giao thành công' },
        { value: 'cancelled', label: 'Đã hủy' },
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Chi tiết đơn hàng <span className="text-primary">#{orderId}</span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {isLoading || !order ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="container-fluid px-0">

                        {/* --- PHẦN 1: THÔNG TIN CHUNG --- */}
                        <div className="row mb-4 g-3">
                            {/* Cột Trái: Thông tin Khách hàng */}
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded h-100 border">
                                    <h6 className="fw-bold border-bottom pb-2 mb-3">Thông tin khách hàng</h6>
                                    <div className="d-flex align-items-center mb-3">
                                        <img
                                            src={order.customer_avatar || '/assets/panda.png'}
                                            alt="Avatar"
                                            className="rounded-circle me-3 border"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div>{order.phone_number}</div>
                                        </div>
                                    </div>
                                    <p className="mb-1"><small className="fw-bold">Email:</small> {order.customer_email || "Chưa cập nhật"}</p>
                                    <p className="mb-0"><small className="fw-bold">Địa chỉ giao:</small> {order.shipping_address}</p>
                                </div>
                            </div>

                            {/* Cột Phải: Thông tin Đơn hàng */}
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded h-100 border">
                                    <h6 className="fw-bold border-bottom pb-2 mb-3">Thông tin đơn hàng</h6>
                                    <p className="mb-2 d-flex justify-content-between">
                                        <span>Cửa hàng:</span>
                                        <span className="fw-bold">{order.shop_name}</span>
                                    </p>
                                    <p className="mb-2 d-flex justify-content-between">
                                        <span>Ngày đặt:</span>
                                        <span>{new Date(order.order_date).toLocaleString('vi-VN')}</span>
                                    </p>
                                    <p className="mb-2 d-flex justify-content-between">
                                        <span>Thanh toán:</span>
                                        <Badge bg="secondary">{order.payment_method}</Badge>
                                    </p>
                                    <p className="mb-0 d-flex justify-content-between">
                                        <span>Ghi chú:</span>
                                        <span className="text-muted fst-italic">{order.note || "Không có"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* --- PHẦN 2: DANH SÁCH SẢN PHẨM --- */}
                        <h6 className="fw-bold mb-3">Sản phẩm ({order.items.length})</h6>
                        <div className="table-responsive border rounded mb-4">
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{ width: '50%' }}>Sản phẩm</th>
                                        <th className="text-center">Biến thể</th>
                                        <th className="text-center">SL</th>
                                        <th className="text-end">Đơn giá</th>
                                        <th className="text-end pe-3">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.order_id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={item.image_url || '/assets/placeholder.png'}
                                                        alt=""
                                                        className="rounded border me-2"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                    <span className="fw-medium text-truncate" style={{ maxWidth: '200px' }} title={item.product_name}>
                                                        {item.product_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center text-muted small">
                                                {item.options_string || "-"}
                                            </td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end">{Number(item.price_at_purchase).toLocaleString()}₫</td>
                                            <td className="text-end fw-bold pe-3">
                                                {Math.round(Number(item.subtotal)).toLocaleString()}₫
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-light">
                                    <tr>
                                        <td colSpan={4} className="text-end fw-bold py-3">Tổng thanh toán:</td>
                                        <td className="text-end fw-bold text-danger fs-5 pe-3 py-3">
                                            {Number(order.total_amount).toLocaleString()}₫
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </div>

                        {/* --- PHẦN 3: CẬP NHẬT TRẠNG THÁI --- */}
                        <div className="p-3 bg-info bg-opacity-10 border border-info rounded">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <label className="form-label fw-bold mb-0 me-2">Trạng thái đơn hàng:</label>
                                    <small className="text-muted d-block d-md-inline">Cập nhật tiến độ xử lý đơn hàng này</small>
                                </div>
                                <div className="d-flex gap-2">
                                    <Form.Select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        style={{ minWidth: '200px' }}
                                        disabled={isUpdating}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Button
                                        variant="primary"
                                        onClick={handleUpdateStatus}
                                        disabled={isUpdating || newStatus === order.status} // Disable nếu chưa đổi trạng thái
                                    >
                                        {isUpdating ? <Spinner size="sm" animation="border" /> : "Cập nhật"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Đóng</Button>
            </Modal.Footer>
        </Modal>
    );
}