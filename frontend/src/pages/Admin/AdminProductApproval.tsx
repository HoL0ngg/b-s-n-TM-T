import React, { useState, useMemo } from 'react';
import {
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiSearch,
    FiFilter,
    FiRotateCcw // Dùng lại cho việc "Duyệt lại"
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// --- Dữ liệu mẫu (Mock Data) ---
// Giờ là danh sách sản phẩm
interface Product {
    id: string;
    name: string;
    imageUrl: string; // Thêm ảnh thumbnail
    shopName: string; // Tên shop đăng
    category: string;
    price: number;
    status: 'approved' | 'pending' | 'rejected';
}

const mockProductsData: Product[] = [
    { id: '3', name: 'Áo thun nam Cotton', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Áo', shopName: 'Shop Cây Cảnh Mini', category: 'Thời trang', price: 250000, status: 'pending' },
    { id: 'P2002', name: 'Bonsai mini để bàn', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Cây', shopName: 'Shop Cây Cảnh Mini', category: 'Nhà cửa', price: 550000, status: 'approved' },
    { id: 'P2003', name: 'Ấm trà gốm Bát Tràng', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Gốm', shopName: 'Gốm Sứ Bát Tràng', category: 'Nhà cửa', price: 1200000, status: 'approved' },
    { id: 'P2004', name: 'Quần short Kaki', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Quần', shopName: 'Thời Trang Trẻ Em', category: 'Thời trang', price: 180000, status: 'pending' },
    { id: 'P2005', name: 'Giày thể thao A-01', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Giày', shopName: 'Giày Thể Thao Cao Cấp', category: 'Giày dép', price: 890000, status: 'rejected' },
    { id: 'P2006', name: 'Váy đầm công chúa', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Váy', shopName: 'Thời Trang Trẻ Em', category: 'Thời trang', price: 320000, status: 'pending' },
    { id: 'P2007', name: 'Sạc dự phòng 20000mAh', imageUrl: 'https://placehold.co/60x60/EFEFEF/AAAAAA?text=Sạc', shopName: 'Thiết Bị Điện Tử ABC', category: 'Điện tử', price: 450000, status: 'approved' },
];
// --- Kết thúc Dữ liệu mẫu ---


const AdminProductApproval: React.FC = () => {
    // --- State ---
    const [products, setProducts] = useState<Product[]>(mockProductsData);
    const [searchTerm, setSearchTerm] = useState('');

    // Mặc định lọc "Chờ duyệt"
    const [statusFilter, setStatusFilter] = useState('pending');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Helpers ---
    const getStatusBadge = (status: 'approved' | 'pending' | 'rejected') => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'pending': return 'bg-warning text-dark';
            case 'rejected': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };
    const getStatusText = (status: 'approved' | 'pending' | 'rejected') => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'pending': return 'Chờ duyệt';
            case 'rejected': return 'Bị từ chối';
            default: return 'Không rõ';
        }
    };
    // Định dạng tiền tệ
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
    // --- Kết thúc Helpers ---

    // --- Logic Lọc và Phân trang (Tương tự trang Shop) ---
    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                return statusFilter === 'all' || product.status === statusFilter;
            })
            .filter(product => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    product.name.toLowerCase().includes(searchLower) ||
                    product.shopName.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower)
                );
            });
    }, [products, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    // --- Kết thúc Logic Lọc ---

    // --- Xử lý hành động ---
    const handleApprove = (productId: string) => {
        alert(`Đã duyệt Sản phẩm ID: ${productId}`);
        setProducts(currentProducts =>
            currentProducts.map(product =>
                product.id === productId
                    ? { ...product, status: 'approved' }
                    : product
            )
        );
    };

    const handleReject = (productId: string) => {
        // Trong thực tế, bạn có thể muốn một Modal hỏi lý do từ chối
        alert(`Đã từ chối Sản phẩm ID: ${productId}`);
        setProducts(currentProducts =>
            currentProducts.map(product =>
                product.id === productId
                    ? { ...product, status: 'rejected' }
                    : product
            )
        );
    };
    // --- Kết thúc xử lý hành động ---

    return (
        <div>
            <h1 className="mb-4">Kiểm duyệt Sản phẩm</h1>

            {/* --- 1. KHU VỰC LỌC VÀ TÌM KIẾM --- */}
            <div className="card shadow-sm mb-4">
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
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="rejected">Bị từ chối</option>
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
                                {paginatedProducts.map((product) => (
                                    <tr key={product.id}>
                                        {/* Cột sản phẩm (Ảnh + Tên) */}
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="rounded"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '1rem' }}
                                                    onError={(e) => {
                                                        // Xử lý nếu ảnh lỗi
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
                                        <td>{product.shopName}</td>
                                        <td>{product.category}</td>
                                        <td className="fw-bold">{formatPrice(product.price)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(product.status)}`}>
                                                {getStatusText(product.status)}
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
                                                {(product.status === 'pending' || product.status === 'rejected') && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title={product.status === 'pending' ? 'Duyệt' : 'Duyệt lại'}
                                                        onClick={() => handleApprove(product.id)}
                                                    >
                                                        {/* Nếu đang từ chối -> Dùng icon "Duyệt lại" */}
                                                        {product.status === 'rejected' ? <FiRotateCcw /> : <FiCheckCircle />}
                                                    </button>
                                                )}

                                                {/* Nút "Từ chối" */}
                                                {(product.status === 'pending' || product.status === 'approved') && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Từ chối / Gỡ"
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
                    <nav aria-label="Page navigation" className="mt-3">
                        <ul className="pagination justify-content-end mb-0">
                            {/* Nút Trang trước */}
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    Trước
                                </button>
                            </li>

                            {/* Các nút số trang */}
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

                            {/* Nút Trang sau */}
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

export default AdminProductApproval;