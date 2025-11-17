import React, { useState, useEffect, useCallback } from 'react';
import {
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiSearch,
    FiFilter,
    FiRotateCcw // Dùng lại cho việc "Duyệt lại"
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { fetchProductsByStatusAdmin, updateProductStatusAdmin } from '../../api/admin/productsAdmin';
import type { ProductTypeAdmin } from '../../types/admin/ProductTypeAdmin';
import Swal from 'sweetalert2';
import Pagenum from '../../components/Admin/Pagenum';
const AdminProductApproval: React.FC = () => {
    // --- State ---
    const [products, setProducts] = useState<ProductTypeAdmin[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // FIX: Thống nhất dùng '-1' cho 'rejected' để khớp với helper
    // '0' = pending, '1' = approved, '-1' = rejected, 'all' = tất cả
    const [statusFilter, setStatusFilter] = useState('0');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0); // CHANGED: Thêm state cho tổng số trang
    const itemsPerPage = 10; // Vẫn dùng để truyền cho API

    // --- Helpers ---
    const getStatusBadge = (status: string | number) => { // CHANGED
        switch (String(status)) { // CHANGED
            case '1': return 'bg-success';
            case '0': return 'bg-warning text-dark';
            case '-1': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };
    const getStatusText = (status: string | number) => { // CHANGED
        switch (String(status)) { // CHANGED
            case '1': return 'Đã duyệt';
            case '0': return 'Chờ duyệt';
            case '-1': return 'Bị từ chối';
            default: return 'Không rõ';
        }
    };
    // ...

    const handlePageChange = (page: number) => {
        // Check này vẫn đúng
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    // --- Kết thúc Logic Lọc ---
    ;

    const handleApprove = async (productId: number) => {
        try {
            // Hiển thị thông báo loading
            Swal.fire({
                title: 'Đang duyệt...',
                text: 'Vui lòng chờ trong giây lát.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Gọi API
            const data = await updateProductStatusAdmin(productId, 1);

            // Cập nhật UI
            setProducts(prevProducts =>
                prevProducts.filter(product => product.id !== productId)
            );

            // Hiển thị thành công
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: data.message || `Đã duyệt thành công sản phẩm ID: ${productId}`,
                timer: 2000,
                showConfirmButton: false
            });

        } catch (err: any) {
            // Hiển thị lỗi
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: err?.response?.data?.message || err.message || 'Lỗi không xác định',
            });
        }
    };
    const handleReject = async (productId: number) => {
        const { value: reason } = await Swal.fire({
            title: "Nhập lý do từ chối",
            input: "text",
            inputPlaceholder: "Ví dụ: Hình ảnh không hợp lệ",
            showCancelButton: true,
            confirmButtonText: "Xác nhận từ chối",
            cancelButtonText: "Hủy",
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "Bạn cần nhập lý do!";
                }
            }
        });

        // Nếu người dùng nhập lý do
        if (reason) {
            console.log(reason);

            try {
                const response = await updateProductStatusAdmin(productId, -1, reason);

                // response là { message: string }
                Swal.fire("Thành công!", response.message, "success");

                // Xóa sản phẩm vừa từ chối khỏi UI
                setProducts(prevProducts =>
                    prevProducts.filter(product => product.id !== productId)
                );

            } catch (err: any) {
                Swal.fire("Lỗi!", err.message || "Không thể cập nhật trạng thái sản phẩm.", "error");
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // 'smooth' để cuộn mượt, 'auto' để cuộn ngay lập tức
        });
    }

    const loadProducts = useCallback(async () => {
        try {
            // CHANGED: Truyền đầy đủ state cho API
            const data = await fetchProductsByStatusAdmin(
                statusFilter,
                currentPage,
                itemsPerPage,
                searchTerm
            );
            setProducts(data.products);
            setTotalPages(data.totalPages); // Cập nhật tổng số trang từ server            
            scrollToTop();
        } catch (error) {
            console.log(error);
            setProducts([]); // Xóa list nếu lỗi
            setTotalPages(0);
        }
    }, [statusFilter, currentPage, searchTerm])

    // CHANGED: useEffect phải theo dõi các state filter
    useEffect(() => {
        loadProducts();
        // FIX: Thêm dependencies
    }, [loadProducts]);

    // FIX: Reset về trang 1 khi filter hoặc search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm]);
    return (
        <div>
            <h1 className="mb-4">Kiểm duyệt Sản phẩm</h1>

            {/* --- 1. KHU VỰC LỌC VÀ TÌM KIẾM --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-body ">
                    <div className="row g-3">
                        {/* Input Tìm kiếm */}
                        <div className="col-md-8  overflow-y-scroll">
                            <label htmlFor="searchInput" className="form-label">Tìm kiếm</label>
                            <div className="input-group">
                                <span className="input-group-text"><FiSearch /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="searchInput"
                                    placeholder="Tìm theo tên sản phẩm, tên shop, danh mục..."
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
                                    value={statusFilter} // Gắn state
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="0">Chờ duyệt</option>
                                    <option value="1">Đã duyệt</option>
                                    <option value="-1">Bị từ chối</option>
                                    <option value="all">Tất cả</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. BẢNG DỮ LIỆU SẢN PHẨM --- */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            {/* Tiêu đề bảng */}
                            <thead className="table-light">
                                <tr>
                                    <th scope="col" style={{ minWidth: '300px' }}>Sản phẩm</th>
                                    <th scope="col">Cửa hàng</th>
                                    <th scope="col">Danh mục</th>
                                    <th scope="col">Giá</th>
                                    <th scope="col">Trạng thái</th>
                                    <th scope="col" className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            {/* Nội dung bảng */}
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        {/* Cột sản phẩm (Ảnh + Tên) */}
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="rounded"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '1rem' }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "https://placehold.co/60x60/EFEFEF/AAAAAA?text=Lỗi";
                                                    }}
                                                />
                                                <div>
                                                    <div className="fw-bold">{product.name}</div>
                                                    <small className="text-muted">ID: {product.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.shop_name}</td>
                                        <td>{product.category_name}</td>
                                        <td className="fw-bold">{product.base_price.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(product.status.toString())}`}>
                                                {getStatusText(product.status.toString())}
                                            </span>
                                        </td>

                                        {/* Cột hành động */}
                                        <td className="text-center">
                                            <div className="btn-group" role="group">

                                                {/* Nút "Xem": Link đến trang sản phẩm công khai */}
                                                <Link
                                                    to={`/product/${product.id}`} // Link đến trang chi tiết sản phẩm (public)
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Xem chi tiết"
                                                    target="_blank" // Mở tab mới
                                                >
                                                    <FiEye />
                                                </Link>

                                                {/* Nút "Duyệt" */}
                                                {(product.status.toString() === '0' || product.status.toString() === '-1') && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title={product.status.toString() === '0' ? 'Duyệt' : 'Duyệt lại'}
                                                        onClick={() => handleApprove(product.id)}
                                                    >
                                                        {/* Nếu đang từ chối -> Dùng icon "Duyệt lại" */}
                                                        {product.status.toString() === '-1' ? <FiRotateCcw /> : <FiCheckCircle />}
                                                    </button>
                                                )}

                                                {/* Nút "Từ chối" */}
                                                {(product.status.toString() === '0' || product.status.toString() === '1') && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Từ chối"
                                                        onClick={() => handleReject(product.id)}
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- 3. THANH PHÂN TRANG (Giống hệt trang Shop) --- */}

                    <Pagenum currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

                </div>
            </div>
        </div>
    );
};

export default AdminProductApproval;