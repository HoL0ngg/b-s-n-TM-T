import { useState, useEffect } from 'react';
import {
    FaSearch, FaFilter, FaEye, FaCalendarAlt, FaFileExport
} from 'react-icons/fa';
import { type OrderType } from '../../types/OrderType'
import { apiGetAllOrders } from '../../api/order';
import OrderDetailModal from '../../components/OrderDetailModal';

export default function AdminOrders() {
    // --- STATE QUẢN LÝ ---
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // Gọi API (Backend cần hỗ trợ các tham số này)
            const data = await apiGetAllOrders(currentPage, 10, filterStatus, searchTerm);

            setOrders(data.data);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce Search & Fetch Effect
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 500); // Đợi 0.5s sau khi gõ phím
        return () => clearTimeout(timeout);
    }, [currentPage, filterStatus, searchTerm]);


    // --- HELPERS ---

    // Hàm hiển thị Badge trạng thái đẹp mắt
    const renderStatusBadge = (status: string) => {
        const config: any = {
            pending: { label: 'Chờ xử lý', class: 'bg-warning-subtle text-warning border border-warning' },
            confirmed: { label: 'Đã xác nhận', class: 'bg-primary-subtle text-primary border border-primary' },
            shipping: { label: 'Đang giao', class: 'bg-info-subtle text-info border border-info' },
            delivered: { label: 'Thành công', class: 'bg-success-subtle text-success border border-success' },
            cancelled: { label: 'Đã hủy', class: 'bg-danger-subtle text-danger border border-danger' },
        };
        const style = config[status] || { label: status, class: 'bg-secondary text-white' };

        return (
            <span className={`badge rounded-pill fw-normal px-3 py-2 ${style.class}`}>
                {style.label}
            </span>
        );
    };

    // Hàm mở modal
    const handleOpenDetail = (id: number) => {
        setSelectedOrderId(id);
        setShowModal(true);
    };

    // --- GIAO DIỆN (JSX) ---
    return (
        <div className="container-fluid py-4 bg-light min-vh-100">

            {/* 1. HEADER & ACTIONS */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Quản lý Đơn hàng</h3>
                    <p className="text-muted mb-0">Xem và quản lý tất cả đơn hàng trên hệ thống</p>
                </div>
                <button className="btn btn-outline-success d-flex align-items-center gap-2 shadow-sm">
                    <FaFileExport /> Xuất Excel
                </button>
            </div>

            {/* 2. THANH CÔNG CỤ (FILTER & SEARCH) */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">

                        {/* Search Box */}
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Tìm mã đơn, tên khách..."
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><FaFilter className="text-muted" /></span>
                                <select
                                    className="form-select"
                                    value={filterStatus}
                                    onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="shipping">Đang giao hàng</option>
                                    <option value="delivered">Giao thành công</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Filter (Optional) */}
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><FaCalendarAlt className="text-muted" /></span>
                                <input type="date" className="form-control" />
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <div className="col-md-2 text-end">
                            <button className="btn btn-light w-100 border" onClick={fetchOrders}>
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. BẢNG DỮ LIỆU */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4 py-3">Mã đơn</th>
                                    <th className='py-3'>Khách hàng</th>
                                    <th className='py-3'>Cửa hàng</th>
                                    <th className='py-3'>Ngày đặt</th>
                                    <th className="text-end py-3">Tổng tiền</th>
                                    <th className="text-center py-3">Trạng thái</th>
                                    <th className="text-end pe-4 py-3">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    // Skeleton Loading hoặc Spinner
                                    <tr>
                                        <td colSpan={7} className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <div className="mt-2 text-muted">Đang tải dữ liệu...</div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan={7} className="text-center py-5 text-muted">
                                            <img src="/assets/empty-box.png" alt="" style={{ width: 64, opacity: 0.5 }} className="mb-3" />
                                            <p>Không tìm thấy đơn hàng nào phù hợp.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    // Data Rows
                                    orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td className="ps-4 fw-bold text-primary">#{order.order_id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-circle bg-secondary bg-opacity-10 rounded-circle me-2 d-flex justify-content-center align-items-center fw-bold text-secondary">
                                                        <img src={order.avatar_url} alt='avt' style={{ width: 35, height: 35 }} />
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <div className="fw-semibold ms-2">{order.customer_phone}</div>
                                                        <small className='ms-2 text-muted'>{order.custmer_email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border fw-normal">
                                                    {order.shop_name}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                                <br />
                                                <small>{new Date(order.order_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small>
                                            </td>
                                            <td className="text-end fw-bold">
                                                {Number(order.total_amount).toLocaleString()} ₫
                                            </td>
                                            <td className="text-center">
                                                {renderStatusBadge(order.status)}
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                    onClick={() => handleOpenDetail(order.order_id)}
                                                >
                                                    <FaEye /> Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. PHÂN TRANG */}
                {!isLoading && orders.length > 0 && (
                    <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Trang {currentPage} / {totalPages}
                        </small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                                        Trước
                                    </button>
                                </li>
                                {/* Render số trang đơn giản */}
                                {[...Array(totalPages)].map((_, i) => {
                                    // Chỉ hiện trang gần hiện tại (Logic rút gọn nếu muốn)
                                    if (i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) {
                                        return (
                                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                            </li>
                                        );
                                    }
                                    if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                                        return <li key={i} className="page-item disabled"><span className="page-link">...</span></li>
                                    }
                                    return null;
                                })}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                                        Sau
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            <OrderDetailModal
                show={showModal}
                onHide={() => setShowModal(false)}
                orderId={selectedOrderId}
                onUpdateSuccess={fetchOrders} // Load lại bảng sau khi update
            />

        </div>
    );
}