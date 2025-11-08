import React, { useState, useMemo } from 'react';
import {
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiSearch,
    FiFilter,
    FiRotateCcw // Icon cho nút "Mở cấm"
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// --- Dữ liệu mẫu (Mock Data) ---
// Đổi tên thành "data" để tránh nhầm lẫn
interface Shop {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    status: 'approved' | 'pending' | 'banned';
    joinedDate: string;
    productCount: number;
}
const mockShopsData: Shop[] = [
    { id: 'S001', name: 'Shop Cây Cảnh Mini', ownerName: 'Nguyễn Văn A', email: 'a.nguyen@example.com', status: 'approved', joinedDate: '2023-10-01', productCount: 45 },
    { id: 'S002', name: 'Gốm Sứ Bát Tràng', ownerName: 'Trần Thị B', email: 'b.tran@example.com', status: 'approved', joinedDate: '2023-09-15', productCount: 120 },
    { id: 'S003', name: 'Thời Trang Trẻ Em', ownerName: 'Lê Văn C', email: 'c.le@example.com', status: 'pending', joinedDate: '2023-11-01', productCount: 0 },
    { id: 'S004', name: 'Đồ Ăn Vặt Nhanh', ownerName: 'Phạm Hùng D', email: 'd.pham@example.com', status: 'banned', joinedDate: '2023-08-20', productCount: 15 },
    { id: 'S005', name: 'Thiết Bị Điện Tử ABC', ownerName: 'Vũ Minh E', email: 'e.vu@example.com', status: 'approved', joinedDate: '2023-10-05', productCount: 210 },
    { id: 'S006', name: 'Giày Thể Thao Cao Cấp', ownerName: 'Đỗ Thị F', email: 'f.do@example.com', status: 'pending', joinedDate: '2023-11-02', productCount: 0 },
];
// --- Kết thúc Dữ liệu mẫu ---


const AdminShopManagement: React.FC = () => {
    // --- CẬP NHẬT 1: Đưa mock data vào state ---
    const [shops, setShops] = useState<Shop[]>(mockShopsData);
    // ----------------------------------------

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Helpers ---
    const getStatusBadge = (status: 'approved' | 'pending' | 'banned') => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'pending': return 'bg-warning text-dark';
            case 'banned': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };
    const getStatusText = (status: 'approved' | 'pending' | 'banned') => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'pending': return 'Chờ duyệt';
            case 'banned': return 'Bị cấm';
            default: return 'Không rõ';
        }
    };
    // --- Kết thúc Helpers ---

    // --- Logic Lọc và Phân trang ---
    const filteredShops = useMemo(() => {
        // --- CẬP NHẬT 3: Dùng `shops` (state) thay vì `mockShops` ---
        return shops
            .filter(shop => {
                return statusFilter === 'all' || shop.status === statusFilter;
            })
            .filter(shop => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    shop.name.toLowerCase().includes(searchLower) ||
                    shop.ownerName.toLowerCase().includes(searchLower) ||
                    shop.email.toLowerCase().includes(searchLower)
                );
            });
        // Thêm `shops` vào dependency array
    }, [shops, searchTerm, statusFilter]);
    // ----------------------------------------------------

    const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
    const paginatedShops = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredShops.slice(startIndex, endIndex);
    }, [filteredShops, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    // --- Kết thúc Logic Lọc ---

    // --- CẬP NHẬT 2: Xử lý hành động bằng `setShops` ---
    const handleApprove = (shopId: string) => {
        alert(`Đã duyệt Shop ID: ${shopId}`);
        setShops(currentShops =>
            currentShops.map(shop =>
                shop.id === shopId
                    ? { ...shop, status: 'approved' } // Trả về object mới
                    : shop // Giữ nguyên object cũ
            )
        );
    };

    const handleBan = (shopId: string) => {
        alert(`Đã cấm Shop ID: ${shopId}`);
        setShops(currentShops =>
            currentShops.map(shop =>
                shop.id === shopId
                    ? { ...shop, status: 'banned' } // Trả về object mới
                    : shop // Giữ nguyên object cũ
            )
        );
    };

    const handleUnban = (shopId: string) => {
        alert(`Đã mở cấm Shop ID: ${shopId}`);
        setShops(currentShops =>
            currentShops.map(shop =>
                shop.id === shopId
                    ? { ...shop, status: 'approved' } // Trả về object mới (thành approved)
                    : shop // Giữ nguyên object cũ
            )
        );
    };
    // --- Kết thúc xử lý hành động ---

    return (
        <div>
            <h1 className="mb-4">Quản lý Cửa hàng</h1>

            {/* --- 1. KHU VỰC LỌC VÀ TÌM KIẾM (Không đổi) --- */}
            <div className="card shadow-sm mb-4">
                {/* ... (Code JSX của Card Lọc/Tìm kiếm) ... */}
                <div className="card-body">
                    <div className="row g-3">
                        {/* Input Tìm kiếm */}
                        <div className="col-md-8">
                            <label htmlFor="searchInput" className="form-label">Tìm kiếm</label>
                            <div className="input-group">
                                <span className="input-group-text"><FiSearch /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="searchInput"
                                    placeholder="Tìm theo tên shop, chủ shop, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* Select Lọc theo trạng thái */}
                        <div className="col-md-4">
                            <label htmlFor="statusFilter" className="form-label">Lọc theo trạng thái</label>
                            <div className="input-group">
                                <span className="input-group-text"><FiFilter /></span>
                                <select
                                    className="form-select"
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="banned">Bị cấm</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. BẢNG DỮ LIỆU --- */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            {/* Tiêu đề bảng (Không đổi) */}
                            <thead className="table-light">
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Tên Cửa hàng</th>
                                    <th scope="col">Chủ Shop</th>
                                    <th scope="col">Trạng thái</th>
                                    <th scope="col">Sản phẩm</th>
                                    <th scope="col">Ngày tham gia</th>
                                    <th scope="col" className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            {/* Nội dung bảng */}
                            <tbody>
                                {paginatedShops.map((shop) => (
                                    <tr key={shop.id}>
                                        <td className="fw-bold">{shop.id}</td>
                                        <td>{shop.name}</td>
                                        <td>
                                            <div>{shop.ownerName}</div>
                                            <small className="text-muted">{shop.email}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(shop.status)}`}>
                                                {getStatusText(shop.status)}
                                            </span>
                                        </td>
                                        <td>{shop.productCount}</td>
                                        <td>{shop.joinedDate}</td>
                                        <td className="text-center">
                                            <div className="btn-group" role="group">

                                                <Link
                                                    to={`/admin/shops/${shop.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Xem chi tiết"
                                                >
                                                    <FiEye />
                                                </Link>

                                                {/* Nút "Duyệt" */}
                                                {shop.status === 'pending' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Duyệt Shop"
                                                        onClick={() => handleApprove(shop.id)}
                                                    >
                                                        <FiCheckCircle />
                                                    </button>
                                                )}

                                                {/* Nút "Cấm" */}
                                                {shop.status === 'approved' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Cấm Shop"
                                                        onClick={() => handleBan(shop.id)}
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                )}

                                                {/* --- NÚT MỚI: Mở cấm --- */}
                                                {shop.status === 'banned' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-warning"
                                                        title="Mở cấm"
                                                        onClick={() => handleUnban(shop.id)}
                                                    >
                                                        <FiRotateCcw />
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- 3. THANH PHÂN TRANG (Không đổi) --- */}
                    <nav aria-label="Page navigation" className="mt-3">
                        {/* ... (Code JSX của Pagination) ... */}
                        <ul className="pagination justify-content-end mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    Trước
                                </button>
                            </li>
                            {[...Array(totalPages).keys()].map(num => {
                                const pageNum = num + 1;
                                return (
                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                            {pageNum}
                                        </button>
                                    </li>
                                );
                            })}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>

                </div>
            </div>
        </div>
    );
};

export default AdminShopManagement;