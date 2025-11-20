import React, { useState, useMemo } from 'react';
import {
    FiSearch,
    FiFilter,
    FiPlus,
    FiChevronDown,
    FiChevronRight,
    FiEdit,
    FiTrash2,
    FiTag,
    FiCheckCircle,
    FiXCircle
} from "react-icons/fi";


// --- INTERFACE/TYPE DEFINITIONS ---

/**
 * Định nghĩa cấu trúc dữ liệu cho một Danh mục (Category).
 */
interface Category {
    id: number;
    name: string;
    slug: string;
    is_active: boolean; // Trạng thái: true (Hoạt động) / false (Đã khóa)
    product_count: number;
    created_at: string;
    parent_id: number | null;
    subcategories?: Category[]; // Danh mục con (Optional)
}

// --- MOCK DATA ---
const initialCategories: Category[] = [
    {
        id: 1, name: "Thời Trang Nam", slug: "thoi-trang-nam", is_active: true, product_count: 1200, created_at: "2024-05-10", parent_id: null,
        subcategories: [
            { id: 11, name: "Áo Sơ Mi", slug: "ao-so-mi", is_active: true, product_count: 500, created_at: "2024-05-11", parent_id: 1, subcategories: [] },
            { id: 12, name: "Quần Jeans & Kaki", slug: "quan-jeans", is_active: true, product_count: 450, created_at: "2024-05-12", parent_id: 1, subcategories: [] },
            {
                id: 13, name: "Phụ Kiện Nam", slug: "phu-kien-nam", is_active: false, product_count: 250, created_at: "2024-05-13", parent_id: 1,
                subcategories: [
                    { id: 131, name: "Thắt Lưng", slug: "that-lung", is_active: true, product_count: 100, created_at: "2024-05-14", parent_id: 13, subcategories: [] },
                    { id: 132, name: "Ví Da", slug: "vi-da", is_active: true, product_count: 150, created_at: "2024-05-15", parent_id: 13, subcategories: [] },
                ]
            },
        ]
    },
    {
        id: 2, name: "Sản Phẩm Công Nghệ", slug: "san-pham-cong-nghe", is_active: true, product_count: 500, created_at: "2024-05-01", parent_id: null,
        subcategories: [
            { id: 21, name: "Điện Thoại", slug: "dien-thoai", is_active: true, product_count: 300, created_at: "2024-05-02", parent_id: 2, subcategories: [] },
            { id: 22, name: "Phụ Kiện Máy Tính", slug: "phu-kien-may-tinh", is_active: false, product_count: 200, created_at: "2024-05-03", parent_id: 2, subcategories: [] },
        ]
    },
    { id: 3, name: "Đồ Gia Dụng", slug: "do-gia-dung", is_active: false, product_count: 800, created_at: "2024-04-20", parent_id: null, subcategories: [] },
];

// --- HELPER FUNCTIONS ---

/**
 * Trả về Tailwind classes cho huy hiệu trạng thái.
 * @param {boolean} isActive - Trạng thái hoạt động của danh mục.
 * @returns {string} Chuỗi class CSS.
 */
const getStatusBadge = (isActive: boolean): string => isActive ? 'badge bg-success' : 'badge bg-danger';

/**
 * Trả về văn bản đại diện cho trạng thái.
 * @param {boolean} isActive - Trạng thái hoạt động của danh mục.
 * @returns {string} Văn bản trạng thái.
 */
const getStatusText = (isActive: boolean): string => isActive ? 'Hoạt động' : 'Đã khóa';

/**
 * Hàm đệ quy lọc danh mục dựa trên từ khóa tìm kiếm và trạng thái.
 * @param {Category[]} categories - Mảng danh mục cần lọc.
 * @param {string} searchTerm - Từ khóa tìm kiếm (tên hoặc slug).
 * @param {('all' | 'true' | 'false')} isActiveFilter - Bộ lọc trạng thái.
 * @returns {Category[]} Mảng danh mục đã lọc.
 */
const filterNestedCategories = (categories: Category[], searchTerm: string, isActiveFilter: 'all' | 'true' | 'false'): Category[] => {
    const term = searchTerm.toLowerCase();
    const filterStatus: boolean | null = isActiveFilter === 'all' ? null : isActiveFilter === 'true';

    return categories.filter(category => {
        const matchesTerm = category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term);
        const matchesStatus = filterStatus === null || category.is_active === filterStatus;

        // Nếu danh mục cha khớp, bao gồm nó (và các danh mục con của nó)
        if (matchesTerm && matchesStatus) {
            return true;
        }

        // Kiểm tra xem bất kỳ danh mục con nào có khớp với tiêu chí không
        if (category.subcategories && category.subcategories.length > 0) {
            // Kiểm tra đệ quy
            const hasMatchingChild = filterNestedCategories(category.subcategories, searchTerm, isActiveFilter).length > 0;
            // Bao gồm danh mục cha nếu có danh mục con khớp (để hiển thị hệ thống phân cấp)
            if (hasMatchingChild) {
                return true;
            }
        }

        return false;
    }).map(category => ({
        ...category,
        // Đệ quy lọc các danh mục con dựa trên tiêu chí
        subcategories: category.subcategories ? filterNestedCategories(category.subcategories, searchTerm, isActiveFilter) : []
    }));
};

// --- CATEGORY ROW COMPONENT PROPS ---
interface CategoryItemProps {
    category: Category;
    level?: number;
    expandedIds: number[];
    onExpandToggle: (id: number) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

// --- CATEGORY ROW COMPONENT (Recursive) ---

const CategoryItem: React.FC<CategoryItemProps> = ({ category, level = 0, expandedIds, onExpandToggle, onEdit, onDelete }) => {
    const isExpanded = expandedIds.includes(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    // Khoảng cách lề trái để tạo độ sâu phân cấp
    const paddingLeft = `${1 + level * 1.5}rem`;
    // Màu nền cho danh mục con
    const rowClass = level > 0 ? 'table-secondary' : '';

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onExpandToggle(category.id);
    };

    return (
        <>
            {/* Hàng Danh mục chính */}
            <tr className={`align-middle ${rowClass}`}>
                {/* Tên Danh mục */}
                <td className="py-3 px-4 text-sm fw-bold text-dark" style={{ paddingLeft }}>
                    <div className="d-flex align-items-center">
                        {/* Nút Mở rộng/Thu gọn */}
                        {hasSubcategories ? (
                            <button
                                onClick={handleToggle}
                                className="btn btn-sm btn-link p-0 text-decoration-none me-2"
                                title={isExpanded ? "Thu gọn" : "Mở rộng"}
                            >
                                {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                            </button>
                        ) : (
                            // Icon placeholder cho danh mục không có con
                            <FiTag size={16} className="text-muted opacity-50 me-2" style={{ marginLeft: '1.75rem' }} />
                        )}
                        <span className={level === 0 ? 'fw-bold' : 'fw-normal'}>{category.name}</span>
                    </div>
                </td>

                {/* Slug */}
                <td className="text-muted">{category.slug}</td>

                {/* Số lượng Sản phẩm */}
                <td className="text-center text-primary fw-bold">
                    {category.product_count.toLocaleString('vi-VN')}
                </td>

                {/* Trạng thái */}
                <td>
                    <span className={getStatusBadge(category.is_active)}>
                        {category.is_active ? <FiCheckCircle size={12} className="me-1" /> : <FiXCircle size={12} className="me-1" />}
                        {getStatusText(category.is_active)}
                    </span>
                </td>

                {/* Ngày tạo */}
                <td className="text-muted">
                    {new Date(category.created_at).toLocaleDateString('vi-VN')}
                </td>

                {/* Hành động */}
                <td className="text-center">
                    <div className="btn-group" role="group">
                        <button
                            onClick={() => onEdit(category)}
                            className="btn btn-sm btn-outline-primary"
                            title="Chỉnh sửa"
                        >
                            <FiEdit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(category.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Xóa"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Render Subcategories if expanded and they exist */}
            {isExpanded && hasSubcategories && category.subcategories!.map(subCategory => (
                <CategoryItem
                    key={subCategory.id}
                    category={subCategory}
                    level={level + 1}
                    expandedIds={expandedIds}
                    onExpandToggle={onExpandToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
};


// --- MAIN APP COMPONENT ---

const AdminCategoriesManagement: React.FC = () => {
    // State cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [expandedIds, setExpandedIds] = useState<number[]>([1, 13]); // State theo dõi ID danh mục đang mở rộng

    // --- LOGIC FUNCTIONS ---

    const handleExpandToggle = (id: number) => {
        setExpandedIds(prevIds =>
            prevIds.includes(id)
                ? prevIds.filter(expandId => expandId !== id)
                : [...prevIds, id]
        );
    };

    const handleAdd = () => {
        // Mock: Mở Modal thêm mới
        console.log("Thêm danh mục mới: Mở Modal");
        const mockAlert = document.getElementById('mock-alert');
        if (mockAlert) {
            mockAlert.innerHTML = 'Đã click Thêm Danh mục mới.';
            mockAlert.style.display = 'block';
            setTimeout(() => { mockAlert.style.display = 'none'; }, 3000);
        }
    };

    const handleEdit = (category: Category) => {
        // Mock: Mở Modal chỉnh sửa
        console.log(`Chỉnh sửa danh mục: ${category.name}`);
        const mockAlert = document.getElementById('mock-alert');
        if (mockAlert) {
            mockAlert.innerHTML = `Đã click Chỉnh sửa: ${category.name}`;
            mockAlert.style.display = 'block';
            setTimeout(() => { mockAlert.style.display = 'none'; }, 3000);
        }
    };

    const handleDelete = (id: number) => {
        console.log(`Xóa danh mục ID: ${id}`);

        // Sử dụng window.prompt thay cho window.confirm/alert
        const isConfirmed = window.prompt(`Xác nhận xóa danh mục ID ${id}? Nhập "Xóa" để tiếp tục:`);

        if (isConfirmed === 'Xóa') {
            // Hàm đệ quy loại bỏ một danh mục bằng ID.
            const recursiveDelete = (cats: Category[], targetId: number): Category[] => {
                return cats
                    .filter(cat => cat.id !== targetId)
                    .map(cat => ({
                        ...cat,
                        subcategories: cat.subcategories ? recursiveDelete(cat.subcategories, targetId) : []
                    }));
            };

            setCategories(prev => recursiveDelete(prev, id));

            const mockAlert = document.getElementById('mock-alert');
            if (mockAlert) {
                mockAlert.innerHTML = `Danh mục ID ${id} đã được xóa (mock).`;
                mockAlert.style.display = 'block';
                setTimeout(() => { mockAlert.style.display = 'none'; }, 3000);
            }
        }
    };

    // --- FILTERED DATA (Sử dụng useMemo để tối ưu hóa hiệu suất) ---

    const filteredCategories = useMemo(() => {
        // Lọc các danh mục cấp cao nhất (chúng sẽ chứa các danh mục con đã lọc)
        return filterNestedCategories(initialCategories, searchTerm, statusFilter);
    }, [searchTerm, statusFilter]);

    // --- MOCK PHÂN TRANG (Giữ đơn giản) ---
    const paginatedCategories = filteredCategories;


    return (
        <div className="container-fluid py-4 bg-light min-vh-100">

            <style>
                {`
                /* Custom style for the fixed mock alert */
                #mock-alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background-color: #198754; /* Success green from Bootstrap */
                    color: white;
                    padding: 10px 20px;
                    border-radius: .25rem;
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
                    z-index: 1080; /* Above typical Bootstrap modals/navbars */
                    display: none;
                }
                .card {
                    border-radius: 0.5rem;
                }
                .table td {
                    padding-top: .75rem;
                    padding-bottom: .75rem;
                }
                .btn-link {
                    color: var(--bs-indigo); /* Ensuring link color matches primary color scheme */
                }
                `}
            </style>

            <h1 className="mb-4 text-dark">Quản lý Danh mục Sản phẩm</h1>

            {/* Mock Alert for Feedback */}
            <div id="mock-alert" className="alert alert-success p-3" role="alert"></div>

            <div className="row">
                <div className="col-12">
                    {/* --- 0. KHU VỰC THÊM MỚI --- */}
                    <div className="d-flex justify-content-end mb-4">
                        <button
                            onClick={handleAdd}
                            className="btn btn-primary shadow-sm"
                        >
                            <FiPlus size={18} className="me-2" />
                            Thêm Danh mục mới
                        </button>
                    </div>

                    {/* --- 1. KHU VỰC LỌC VÀ TÌM KIẾM --- */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                {/* Input Tìm kiếm */}
                                <div className="col-md-8">
                                    <label htmlFor="searchInput" className="form-label">Tìm kiếm theo tên</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><FiSearch size={18} /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="searchInput"
                                            placeholder="Tìm theo tên danh mục, slug..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Select Lọc theo trạng thái */}
                                <div className="col-md-4">
                                    <label htmlFor="statusFilter" className="form-label">Lọc theo trạng thái</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><FiFilter size={18} /></span>
                                        <select
                                            className="form-select"
                                            id="statusFilter"
                                            value={statusFilter}
                                            // TypeScript requires correct type assertion for event target value
                                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="true">Hoạt động</option>
                                            <option value="false">Đã khóa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. BẢNG DỮ LIỆU ĐA CẤP --- */}
                    <div className="card shadow-sm overflow-hidden">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover table-striped align-middle mb-0">
                                    {/* Tiêu đề bảng */}
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" className="py-3 px-4">Tên Danh mục</th>
                                            <th scope="col" className="py-3 px-4">Slug</th>
                                            <th scope="col" className="py-3 px-4 text-center">Sản phẩm</th>
                                            <th scope="col" className="py-3 px-4">Trạng thái</th>
                                            <th scope="col" className="py-3 px-4">Ngày tạo</th>
                                            <th scope="col" className="py-3 px-4 text-center">Hành động</th>
                                        </tr>
                                    </thead>

                                    {/* Nội dung bảng */}
                                    <tbody>
                                        {paginatedCategories.length > 0 ? (
                                            paginatedCategories.map((category) => (
                                                <CategoryItem
                                                    key={category.id}
                                                    category={category}
                                                    expandedIds={expandedIds}
                                                    onExpandToggle={handleExpandToggle}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="py-5 text-center text-muted fs-5">
                                                    Không tìm thấy danh mục nào phù hợp.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- 3. THANH PHÂN TRANG (Mocked) --- */}
                        <div className="card-footer bg-light py-3 border-top d-flex justify-content-between align-items-center">
                            <span className="text-muted small">
                                Hiển thị {paginatedCategories.length} danh mục (Tổng cộng {initialCategories.length} danh mục).
                            </span>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className="page-item disabled">
                                        <a className="page-link" href="#">Trước</a>
                                    </li>
                                    <li className="page-item active" aria-current="page">
                                        <a className="page-link" href="#">1</a>
                                    </li>
                                    <li className="page-item disabled">
                                        <a className="page-link" href="#">Sau</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminCategoriesManagement;