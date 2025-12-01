import { useEffect, useState } from "react";
import { apiGetOrderDetail, apiGetUserOrders, apiCancelOrder, apiConfirmOrderReceived } from "../../api/order";
import type { OrderType, OrderDetailType } from "../../types/OrderType";
import { submitReview, checkOrderReviewed } from "../../api/user";

export default function Purchase() {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Sort order for date
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    const [reviewModal, setReviewModal] = useState(false);
    const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [confirmedOrders, setConfirmedOrders] = useState<Set<number>>(new Set());
    const [reviewedOrders, setReviewedOrders] = useState<Set<number>>(new Set());

    // Load orders based on active tab, page, and sort
    useEffect(() => {
        loadOrders(activeTab, currentPage);
    }, [activeTab, currentPage]);

    const loadOrders = async (status: string, page: number = 1) => {
        setLoading(true);
        setError("");
        try {
            const data = await apiGetUserOrders(page, itemsPerPage, status);
            console.log(data);

            let ordersList = data.orders || data || [];

            ordersList = ordersList.sort((a: OrderType, b: OrderType) => {
                const dateA = new Date(a.order_date).getTime();
                const dateB = new Date(b.order_date).getTime();
                return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
            });
            console.log(ordersList);
            
            setOrders(ordersList);

            // Check which orders have been reviewed
            const reviewedSet = new Set<number>();
            for (const order of ordersList) {
                try {
                    const isReviewed = await checkOrderReviewed(order.order_id);
                    if (isReviewed) {
                        reviewedSet.add(order.order_id);
                    }
                } catch (err) {
                    console.error(`Failed to check review status for order ${order.order_id}`);
                }
            }
            setReviewedOrders(reviewedSet);

            const total = data.total || ordersList.length;
            setTotalPages(Math.ceil(total / itemsPerPage));
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tải đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleSortToggle = () => {
        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        // Re-sort current orders
        const sorted = [...orders].sort((a, b) => {
            const dateA = new Date(a.order_date).getTime();
            const dateB = new Date(b.order_date).getTime();
            return sortOrder === "desc" ? dateA - dateB : dateB - dateA;
        });
        setOrders(sorted);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        try {
            await apiCancelOrder(orderId);
            alert("Hủy đơn hàng thành công!");
            loadOrders(activeTab, currentPage);
        } catch (err: any) {
            alert(err.response?.data?.message || "Không thể hủy đơn hàng");
        }
    };

    const handleConfirmReceived = async (orderId: number) => {
        if (!window.confirm("Bạn xác nhận đã nhận được hàng?")) return;
        try {
            await apiConfirmOrderReceived(orderId);
            setConfirmedOrders(prev => new Set(prev).add(orderId));
            alert("Đã xác nhận nhận hàng thành công!");
            loadOrders(activeTab, currentPage);
        } catch (err: any) {
            alert(err.response?.data?.message || "Không thể xác nhận nhận hàng");
        }
    };

    const handleOpenReview = (orderId: number) => {
        setReviewOrderId(orderId);
        setReviewModal(true);
        setReviewText("");
        setReviewRating(5);
    };

    const handleSubmitReview = async () => {
        if (!reviewOrderId) return;

        try {
            await submitReview(reviewOrderId, reviewText, reviewRating);

            setReviewedOrders(prev => new Set(prev).add(reviewOrderId));
            setReviewModal(false);
            alert("Cảm ơn bạn đã đánh giá!");
        } catch (err) {
            alert("Không thể gửi đánh giá. Vui lòng thử lại.");
        }
    };

    const handleViewDetails = async (orderId: number) => {
        try {
            const data = await apiGetOrderDetail(orderId);
            setSelectedOrder(data);
            setShowModal(true);
        } catch (err: any) {
            alert("Không thể tải chi tiết đơn hàng");
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { class: string; text: string } } = {
            pending: { class: "bg-warning text-dark py-2 px-3", text: "Chờ xác nhận" },
            confirmed: { class: "bg-info text-white py-2 px-3", text: "Đã xác nhận" },
            shipping: { class: "bg-primary py-2 px-3", text: "Đang giao" },
            delivered: { class: "bg-success py-2 px-3", text: "Hoàn thành" },
            cancelled: { class: "bg-danger py-2 px-3", text: "Đã hủy" },
        };
        const s = statusMap[status.toLowerCase()] || { class: "bg-secondary", text: status };
        return <div className={`badge ${s.class}`}>{s.text}</div>;
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { class: string; text: string } } = {
            unpaid: { class: "bg-warning text-dark py-2 px-3", text: "Chưa thanh toán" },
            paid: { class: "bg-success py-2 px-3", text: "Đã thanh toán" },
            failed: { class: "bg-danger py-2 px-3", text: "Thanh toán thất bại" },
        };
        const s = statusMap[status.toLowerCase()] || { class: "bg-secondary", text: status };
        return <div className={`badge ${s.class}`}>{s.text}</div>;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Đơn hàng của tôi</h4>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleSortToggle}
                >
                    <i className={`fas fa-sort-amount-${sortOrder === "desc" ? "down" : "up"}`}></i>
                    {" "}
                    Ngày đặt: {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
                </button>
            </div>

            {/* Tabs for filtering orders */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "all" ? "active text-primary fw-semibold" : "text-muted"}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "pending" ? "active text-primary fw-semibold" : "text-muted"}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Chờ xác nhận
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "shipping" ? "active text-primary fw-semibold" : "text-muted"}`}
                        onClick={() => setActiveTab("shipping")}
                    >
                        Đang giao
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "delivered" ? "active text-primary fw-semibold" : "text-muted"}`}
                        onClick={() => setActiveTab("delivered")}
                    >
                        Hoàn thành
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "cancelled" ? "active text-primary fw-semibold" : "text-muted"}`}
                        onClick={() => setActiveTab("cancelled")}
                    >
                        Đã hủy
                    </button>
                </li>
            </ul>

            {/* Loading state */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Orders list */}
            {!loading && !error && orders.length === 0 && (
                <div className="text-center py-5">
                    <p className="text-muted">Chưa có đơn hàng nào</p>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="list-group">
                    {orders.map((order) => (
                        <div
                            key={order.order_id}
                            className="list-group-item list-group-item-action mb-3"
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <strong>Đơn hàng #{order.order_id}</strong>
                                    <br />
                                    <small className="text-muted">
                                        Ngày đặt: <span className="fw-semibold">{formatDate(order.order_date)}</span>
                                    </small>
                                    {order.shop_name && (
                                        <>
                                            <br />
                                            <small className="text-muted">
                                                Cửa hàng: <span className="fw-semibold">{order.shop_name}</span>
                                            </small>
                                        </>
                                    )}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {order.payment_status !== "Failed" ? getStatusBadge(order.status) : ""}
                                    {getPaymentStatusBadge(order.payment_status)}
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong className="text-primary">Tổng tiền: {formatCurrency(order.total_amount)}</strong>
                                    <br />
                                    <small className="text-muted">
                                        Phương thức: <span className="fw-semibold">{order.payment_method}</span>
                                    </small>
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleViewDetails(order.order_id)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {order.status.toLowerCase() === "pending" && (
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleCancelOrder(order.order_id)}
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                    {order.status.toLowerCase() === "shipping" && !confirmedOrders.has(order.order_id) && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleConfirmReceived(order.order_id)}
                                        >
                                            Đã nhận hàng
                                        </button>
                                    )}
                                    {(order.status.toLowerCase() === "delivered" || confirmedOrders.has(order.order_id)) && !reviewedOrders.has(order.order_id) && (
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleOpenReview(order.order_id)}
                                        >
                                            Viết đánh giá
                                        </button>
                                    )}
                                    {reviewedOrders.has(order.order_id) && (
                                        <span className="badge bg-success align-self-center">Đã đánh giá</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && orders.length > 0 && totalPages > 1 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <li
                                        key={page}
                                        className={`page-item ${currentPage === page ? "active" : ""}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return (
                                    <li key={page} className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                );
                            }
                            return null;
                        })}
                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Chi tiết đơn hàng #{selectedOrder.id}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Order Info */}
                                <div className="mb-3">
                                    <h6>Thông tin đơn hàng</h6>
                                    <p className="mb-1">
                                        <strong>Ngày đặt:</strong>{" "}
                                        {formatDate(selectedOrder.order_date)}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Trạng thái:</strong>{" "}
                                        {getStatusBadge(selectedOrder.status)}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Thanh toán:</strong>{" "}
                                        {getPaymentStatusBadge(selectedOrder.payment_status)}
                                    </p>

                                    <p className="mb-1">
                                        <strong>Phương thức thanh toán:</strong>{" "}
                                        {selectedOrder.payment_method}
                                    </p>
                                    {selectedOrder.note && (
                                        <p className="mb-1">
                                            <strong>Ghi chú:</strong> {selectedOrder.note}
                                        </p>
                                    )}
                                </div>

                                {/* Shipping Info */}
                                <div className="mb-3">
                                    <h6>Thông tin giao hàng</h6>
                                    <p className="mb-1">
                                        <strong>Địa chỉ:</strong> {selectedOrder.shipping_address}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Số điện thoại:</strong> {selectedOrder.phone_number}
                                    </p>
                                </div>

                                {/* Shop Info */}
                                {selectedOrder.shop_name && (
                                    <div className="mb-3">
                                        <h6>Thông tin cửa hàng</h6>
                                        <p className="mb-1">
                                            <strong>Tên:</strong> {selectedOrder.shop_name}
                                        </p>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="mb-3">
                                    <h6>Sản phẩm</h6>
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                {item.image_url && (
                                                                    <img
                                                                        src={item.image_url}
                                                                        alt={item.product_name}
                                                                        style={{
                                                                            width: "50px",
                                                                            height: "50px",
                                                                            objectFit: "cover",
                                                                            marginRight: "10px",
                                                                        }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    {item.product_name}
                                                                    {item.options_string && (
                                                                        <small className="text-muted d-block">
                                                                            {item.options_string}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{item.quantity}</td>
                                                        <td>{formatCurrency(item.price_at_purchase)}</td>
                                                        <td>{formatCurrency(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="text-end">
                                    <h5>
                                        Tổng cộng: {formatCurrency(selectedOrder.total_amount)}
                                    </h5>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setReviewModal(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Đánh giá đơn hàng #{reviewOrderId}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setReviewModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Đánh giá của bạn</label>
                                    <div className="d-flex gap-2 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <i
                                                key={star}
                                                className={`fa${star <= reviewRating ? "s" : "r"} fa-star fa-2x`}
                                                style={{
                                                    cursor: "pointer",
                                                    color: star <= reviewRating ? "#ffc107" : "#e0e0e0"
                                                }}
                                                onClick={() => setReviewRating(star)}
                                            ></i>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nhận xét (tối thiểu 10 ký tự)</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                        maxLength={500}
                                    ></textarea>
                                    <small className="text-muted">{reviewText.length}/500 ký tự</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setReviewModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmitReview}
                                >
                                    Gửi đánh giá
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
