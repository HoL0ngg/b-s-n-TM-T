import React, { useState, useEffect } from 'react';
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
import { fetchShopsByStatusAdmin, updateShopStatusAdmin } from '../../api/admin/shopsAdmin';
import Swal from 'sweetalert2';
import Pagenum from '../../components/Admin/Pagenum';

const AdminShopManagement: React.FC = () => {

    const [shops, setShops] = useState<ShopAdminType[]>([]);
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
    }
    const handleUpdateStatus = async (
        shopId: number,
        status: number,
        title: string,
        successMsg: string,
        reason?: string
    ) => {
        const result = await Swal.fire({
            title,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                const res = await updateShopStatusAdmin(shopId, status, reason);
                Swal.fire("Thành công!", res.message || successMsg, "success");
                loadShops(); // 🔁 gọi lại hàm load danh sách
            } catch (error: any) {
                Swal.fire("Lỗi!", error.message || "Không thể cập nhật trạng thái shop.", "error");
            }
        }
    };

    const handleApprove = async (shopId: number) => {
        await handleUpdateStatus(
            shopId,
            1,
            `Xác nhận duyệt shop?`,
            `Shop ID ${shopId} đã được duyệt.`
        );
    };

    const handleBan = async (shopId: number) => {
        const { value: reason } = await Swal.fire({
            title: "Nhập lý do cấm shop",
            input: "text",
            inputPlaceholder: "Ví dụ: Vi phạm quy định",
            showCancelButton: true,
            confirmButtonText: "Cấm shop",
            cancelButtonText: "Hủy",
        });

        if (reason) {
            await handleUpdateStatus(
                shopId,
                -1,
                `Xác nhận cấm shop?`,
                `Shop ID ${shopId} đã bị cấm.`,
                reason
            );
        }
    };

    const handleUnban = async (shopId: number) => {
        await handleUpdateStatus(
            shopId,
            1,
            `Xác nhận mở cấm shop?`,
            `Shop ID ${shopId} đã được mở cấm.`
        );
    };
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
                    <Pagenum currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

                </div>
            </div>
        </div>
    );
};

export default AdminShopManagement;