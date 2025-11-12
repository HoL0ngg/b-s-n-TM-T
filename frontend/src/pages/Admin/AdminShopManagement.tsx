import React, { useState, useMemo, use, useEffect } from 'react';
import {
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiSearch,
    FiFilter,
    FiRotateCcw // Icon cho nút "Mở cấm"
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ShopAdminType } from '../../types/ShopType';
import { fetchShopsByStatusAdmin } from '../../api/admin/shopsAdmin';


// --- Dữ liệu mẫu (Mock Data) ---
// Đổi tên thành "data" để tránh nhầm lẫn
// interface Shop {
//     id: string;
//     name: string;
//     ownerName: string;
//     email: string;
//     status: 'approved' | 'pending' | 'banned';
//     joinedDate: string;
//     productCount: number;
// }
// const mockShopsData: Shop[] = [
//     { id: 'S001', name: 'Shop Cây Cảnh Mini', ownerName: 'Nguyễn Văn A', email: 'a.nguyen@example.com', status: 'approved', joinedDate: '2023-10-01', productCount: 45 },
//     { id: 'S002', name: 'Gốm Sứ Bát Tràng', ownerName: 'Trần Thị B', email: 'b.tran@example.com', status: 'approved', joinedDate: '2023-09-15', productCount: 120 },
//     { id: 'S003', name: 'Thời Trang Trẻ Em', ownerName: 'Lê Văn C', email: 'c.le@example.com', status: 'pending', joinedDate: '2023-11-01', productCount: 0 },
//     { id: 'S004', name: 'Đồ Ăn Vặt Nhanh', ownerName: 'Phạm Hùng D', email: 'd.pham@example.com', status: 'banned', joinedDate: '2023-08-20', productCount: 15 },
//     { id: 'S005', name: 'Thiết Bị Điện Tử ABC', ownerName: 'Vũ Minh E', email: 'e.vu@example.com', status: 'approved', joinedDate: '2023-10-05', productCount: 210 },
//     { id: 'S006', name: 'Giày Thể Thao Cao Cấp', ownerName: 'Đỗ Thị F', email: 'f.do@example.com', status: 'pending', joinedDate: '2023-11-02', productCount: 0 },
// ];
// // --- Kết thúc Dữ liệu mẫu-- -


const AdminShopManagement: React.FC = () => {

    const [shops, setShops] = useState<ShopAdminType[]>([]);
    // ----------------------------------------

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 5;

    // --- Helpers ---
    const getStatusBadge = (status: number | string) => {
        switch (status) {
            case '1': return 'bg-success';
            case '0': return 'bg-warning text-dark';
            case '-1': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };
    const getStatusText = (status: number | string) => {
        switch (status) {
            case '1': return 'Đã duyệt';
            case '0': return 'Chờ duyệt';
            case '-1': return 'Bị cấm';
            default: return 'Không rõ';
        }
    };

    // ----------------------------------------------------
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    // --- Kết thúc Logic Lọc ---


    const handleApprove = (shopId: number) => {
        alert(`Đã duyệt Shop ID: ${shopId}`);
    };

    const handleBan = (shopId: number) => {
        alert(`Đã cấm Shop ID: ${shopId}`);
    };

    const handleUnban = (shopId: number) => {
        alert(`Đã mở cấm Shop ID: ${shopId}`);
    };
    // --- Kết thúc xử lý hành động ---
    const loadShops = async () => {

        try {
            const data = await fetchShopsByStatusAdmin(
                statusFilter,
                currentPage,
                itemsPerPage,
                searchTerm
            );
            console.log(statusFilter);
            console.log("Dữ liệu shop tải về:", data);

            setShops(data.shops);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.log("Lỗi khi tải danh sách shop:", error);
        }
    }

    useEffect(() => {
        loadShops();
    }, [statusFilter, currentPage, searchTerm]);

    useEffect(() => {
        setCurrentPage(1); // Reset về trang 1 khi bộ lọc hoặc tìm kiếm thay đổi
    }, [statusFilter, searchTerm]);
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
                                    <option value="1">Đã duyệt</option>
                                    <option value="0">Chờ duyệt</option>
                                    <option value="-1">Bị cấm</option>
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
                                    <th scope="col">Hình ảnh</th>
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
                                {shops.map((shop) => (
                                    <tr key={shop.id}>
                                        <td className="fw-bold">
                                            <img
                                                src={shop.logo_url}
                                                alt={shop.name}
                                                className="rounded"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '1rem' }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "https://placehold.co/60x60/EFEFEF/AAAAAA?text=Lỗi";
                                                }}
                                            />
                                        </td>
                                        <td>{shop.name}</td>
                                        <td>
                                            <div>{shop.username}</div>
                                            <small className="text-muted">{shop.phone_number}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(shop.status.toString())}`}>
                                                {getStatusText(shop.status.toString())}
                                            </span>
                                        </td>
                                        <td>{shop.totalProduct}</td>
                                        <td>{new Date(shop.created_at).toLocaleDateString()}</td>
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
                                                {shop.status === 0 && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Duyệt Shop"
                                                        onClick={() => handleApprove(shop.id)}
                                                    >
                                                        <FiCheckCircle />
                                                    </button>
                                                )}

                                                {/* Nút "Cấm" */}
                                                {shop.status === 1 && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Cấm Shop"
                                                        onClick={() => handleBan(shop.id)}
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                )}

                                                {/* --- NÚT MỚI: Mở cấm --- */}
                                                {shop.status === -1 && (
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
                        {/* Sử dụng `totalPages > 1` là một điều kiện tốt hơn 
      thay vì `products.length > 0` để hiển thị phân trang 
    */}
                        {totalPages > 1 && (
                            <ul className="pagination justify-content-end mb-0">
                                {/* Nút Trang trước */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        Trước
                                    </button>
                                </li>

                                {/* Hiển thị số trang (ĐÃ CẬP NHẬT LOGIC) */}
                                {(() => {
                                    const pages: (number | "dots")[] = [];

                                    // Sử dụng biến 'currentPage' từ code gốc của bạn
                                    const page = currentPage;

                                    if (totalPages <= 3) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else if (page <= 3) {
                                        pages.push(1, 2, 3, "dots", totalPages);
                                    } else if (page >= totalPages - 2) {
                                        pages.push(1, "dots", totalPages - 2, totalPages - 1, totalPages);
                                    } else {
                                        pages.push(1, "dots", page - 1, page, page + 1, "dots", totalPages);
                                    }

                                    // Render mảng 'pages' ra thành các thẻ <li>
                                    return pages.map((p, index) =>
                                        p === "dots" ? (
                                            <li key={`dots-${index}`} className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        ) : (
                                            <li
                                                key={`page-${p}`}
                                                // Dùng class 'active' của Bootstrap
                                                className={`page-item ${currentPage === p ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(p)}
                                                >
                                                    {p}
                                                </button>
                                            </li>
                                        )
                                    );
                                })()}

                                {/* Nút Trang sau */}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        Sau
                                    </button>
                                </li>
                            </ul>
                        )}
                    </nav>

                </div>
            </div>
        </div>
    );
};

export default AdminShopManagement;