// import React, { useState, useMemo } from 'react';
// import { Search, Filter, Plus, ChevronDown, ChevronRight, Edit, Trash2, Tag, CheckCircle, XCircle } from 'lucide-react';

// // --- MOCK DATA ---
// const initialCategories = [
//     {
//         id: 1, name: "Thời Trang Nam", slug: "thoi-trang-nam", is_active: true, product_count: 1200, created_at: "2024-05-10", parent_id: null,
//         subcategories: [
//             { id: 11, name: "Áo Sơ Mi", slug: "ao-so-mi", is_active: true, product_count: 500, created_at: "2024-05-11", parent_id: 1, subcategories: [] },
//             { id: 12, name: "Quần Jeans & Kaki", slug: "quan-jeans", is_active: true, product_count: 450, created_at: "2024-05-12", parent_id: 1, subcategories: [] },
//             {
//                 id: 13, name: "Phụ Kiện Nam", slug: "phu-kien-nam", is_active: false, product_count: 250, created_at: "2024-05-13", parent_id: 1,
//                 subcategories: [
//                     { id: 131, name: "Thắt Lưng", slug: "that-lung", is_active: true, product_count: 100, created_at: "2024-05-14", parent_id: 13, subcategories: [] },
//                     { id: 132, name: "Ví Da", slug: "vi-da", is_active: true, product_count: 150, created_at: "2024-05-15", parent_id: 13, subcategories: [] },
//                 ]
//             },
//         ]
//     },
//     {
//         id: 2, name: "Sản Phẩm Công Nghệ", slug: "san-pham-cong-nghe", is_active: true, product_count: 500, created_at: "2024-05-01", parent_id: null,
//         subcategories: [
//             { id: 21, name: "Điện Thoại", slug: "dien-thoai", is_active: true, product_count: 300, created_at: "2024-05-02", parent_id: 2, subcategories: [] },
//             { id: 22, name: "Phụ Kiện Máy Tính", slug: "phu-kien-may-tinh", is_active: false, product_count: 200, created_at: "2024-05-03", parent_id: 2, subcategories: [] },
//         ]
//     },
//     { id: 3, name: "Đồ Gia Dụng", slug: "do-gia-dung", is_active: false, product_count: 800, created_at: "2024-04-20", parent_id: null, subcategories: [] },
// ];

// // --- HELPER FUNCTIONS ---
// const getStatusBadge = (isActive) => isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
// const getStatusText = (isActive) => isActive ? 'Hoạt động' : 'Đã khóa';

// // Recursive function to flatten and filter categories
// const filterNestedCategories = (categories, searchTerm, isActiveFilter) => {
//     const term = searchTerm.toLowerCase();
//     const filterStatus = isActiveFilter === 'all' ? null : isActiveFilter === 'true';

//     return categories.filter(category => {
//         const matchesTerm = category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term);
//         const matchesStatus = filterStatus === null || category.is_active === filterStatus;

//         // If a parent category matches, include it (and its children)
//         if (matchesTerm && matchesStatus) {
//             return true;
//         }

//         // Check if any subcategory matches the criteria
//         if (category.subcategories && category.subcategories.length > 0) {
//             const hasMatchingChild = filterNestedCategories(category.subcategories, searchTerm, isActiveFilter).length > 0;
//             // Include the parent if a child matches (to display the hierarchy)
//             if (hasMatchingChild) {
//                 return true;
//             }
//         }

//         return false;
//     }).map(category => ({
//         ...category,
//         // Recursively filter subcategories based on the criteria
//         subcategories: category.subcategories ? filterNestedCategories(category.subcategories, searchTerm, isActiveFilter) : []
//     }));
// };

// // --- CATEGORY ROW COMPONENT (Recursive) ---

// const CategoryItem = ({ category, level = 0, expandedIds, onExpandToggle, onEdit, onDelete }) => {
//     const isExpanded = expandedIds.includes(category.id);
//     const hasSubcategories = category.subcategories && category.subcategories.length > 0;

//     const paddingLeft = `${1 + level * 1.5}rem`; // Indentation for nesting

//     const handleToggle = (e) => {
//         e.stopPropagation();
//         onExpandToggle(category.id);
//     };

//     return (
//         <>
//             {/* Main Category Row */}
//             <tr className={`border-b hover:bg-gray-50 ${level > 0 ? 'bg-indigo-50/50' : 'bg-white'}`}>
//                 {/* Tên Danh mục */}
//                 <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap" style={{ paddingLeft }}>
//                     <div className="flex items-center space-x-2">
//                         {/* Toggle Button */}
//                         {hasSubcategories ? (
//                             <button
//                                 onClick={handleToggle}
//                                 className="text-gray-500 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-100 transition duration-150"
//                                 title={isExpanded ? "Thu gọn" : "Mở rộng"}
//                             >
//                                 {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//                             </button>
//                         ) : (
//                             <Tag size={16} className="text-gray-400 opacity-50 ml-6" /> // Placeholder icon for no children
//                         )}
//                         <span className={level === 0 ? 'font-bold' : 'font-medium'}>{category.name}</span>
//                     </div>
//                 </td>

//                 {/* Slug */}
//                 <td className="py-3 px-4 text-sm text-gray-500">{category.slug}</td>

//                 {/* Số lượng Sản phẩm */}
//                 <td className="py-3 px-4 text-sm text-center font-semibold text-indigo-600">
//                     {category.product_count.toLocaleString('vi-VN')}
//                 </td>

//                 {/* Trạng thái */}
//                 <td className="py-3 px-4 text-sm">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(category.is_active)}`}>
//                         {category.is_active ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
//                         {getStatusText(category.is_active)}
//                     </span>
//                 </td>

//                 {/* Ngày tạo */}
//                 <td className="py-3 px-4 text-sm text-gray-500">
//                     {new Date(category.created_at).toLocaleDateString('vi-VN')}
//                 </td>

//                 {/* Hành động */}
//                 <td className="py-3 px-4 text-sm text-center">
//                     <div className="flex justify-center space-x-2">
//                         <button
//                             onClick={() => onEdit(category)}
//                             className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition duration-150"
//                             title="Chỉnh sửa"
//                         >
//                             <Edit size={16} />
//                         </button>
//                         <button
//                             onClick={() => onDelete(category.id)}
//                             className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition duration-150"
//                             title="Xóa"
//                         >
//                             <Trash2 size={16} />
//                         </button>
//                     </div>
//                 </td>
//             </tr>

//             {/* Render Subcategories if expanded and they exist */}
//             {isExpanded && hasSubcategories && category.subcategories.map(subCategory => (
//                 <CategoryItem
//                     key={subCategory.id}
//                     category={subCategory}
//                     level={level + 1}
//                     expandedIds={expandedIds}
//                     onExpandToggle={onExpandToggle}
//                     onEdit={onEdit}
//                     onDelete={onDelete}
//                 />
//             ))}
//         </>
//     );
// };


// // --- MAIN APP COMPONENT ---

// const App = () => {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'true', 'false'
//     const [categories, setCategories] = useState(initialCategories);
//     const [expandedIds, setExpandedIds] = useState([1, 13]); // State to track expanded category IDs

//     // --- LOGIC FUNCTIONS ---

//     const handleExpandToggle = (id) => {
//         setExpandedIds(prevIds =>
//             prevIds.includes(id)
//                 ? prevIds.filter(expandId => expandId !== id)
//                 : [...prevIds, id]
//         );
//     };

//     const handleAdd = () => {
//         // Implement logic to show a modal for adding a new category/subcategory
//         console.log("Thêm danh mục mới: Mở Modal");
//         alert("Thêm danh mục mới: Mở Modal");
//     };

//     const handleEdit = (category) => {
//         // Implement logic to show a modal for editing
//         console.log(`Chỉnh sửa danh mục: ${category.name}`);
//         alert(`Chỉnh sửa danh mục: ${category.name}`);
//     };

//     const handleDelete = (id) => {
//         // Implement logic for deletion confirmation
//         console.log(`Xóa danh mục ID: ${id}`);
//         // In a real app, use a custom modal for confirmation.
//         if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục ID ${id}?`)) {
//             // Mock deletion: You would typically call an API here.
//             setCategories(prev => prev.filter(cat => cat.id !== id));
//             alert(`Danh mục ID ${id} đã được xóa (mock).`);
//         }
//     };

//     // --- FILTERED DATA (Using useMemo for performance) ---

//     const filteredCategories = useMemo(() => {
//         // Filter only the top-level categories, which contain the filtered subcategories
//         return filterNestedCategories(initialCategories, searchTerm, statusFilter);
//     }, [searchTerm, statusFilter]);

//     // --- PAGINATION MOCK ---
//     // Since this is a nested structure, pagination logic is complex in a real app (often handled by the server).
//     // For this UI mock, we will treat all filtered top-level items as the current page.
//     const ITEMS_PER_PAGE = 10;
//     const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
//     const startIndex = 0; // Fixed for simplicity
//     const endIndex = filteredCategories.length;
//     const paginatedCategories = filteredCategories.slice(startIndex, endIndex);


//     return (
//         <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
//             <style>
//                 {`
//                 .input-group-text {
//                     @apply px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-500;
//                 }
//                 .form-control, .form-select {
//                     @apply block w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150;
//                 }
//                 .form-label {
//                     @apply block text-sm font-medium text-gray-700 mb-1;
//                 }
//                 .card {
//                     @apply bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-xl;
//                 }
//                 .table-light th {
//                     @apply bg-indigo-50 text-indigo-700 uppercase tracking-wider text-xs font-semibold;
//                 }
//                 .btn-primary {
//                     @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150;
//                 }
//                 .btn-sm {
//                     @apply px-2 py-1 text-xs;
//                 }
//                 `}
//             </style>

//             <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Danh mục Sản phẩm</h1>

//             {/* --- 0. KHU VỰC THÊM MỚI --- */}
//             <div className="flex justify-end mb-4">
//                 <button
//                     onClick={handleAdd}
//                     className="btn-primary"
//                 >
//                     <Plus size={18} className="mr-2" />
//                     Thêm Danh mục mới
//                 </button>
//             </div>

//             {/* --- 1. KHU VỰC LỌC VÀ TÌM KIẾM --- */}
//             <div className="card mb-6">
//                 <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {/* Input Tìm kiếm */}
//                         <div className="col-span-1 md:col-span-2">
//                             <label htmlFor="searchInput" className="form-label">Tìm kiếm theo tên</label>
//                             <div className="flex">
//                                 <span className="input-group-text"><Search size={18} /></span>
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     id="searchInput"
//                                     placeholder="Tìm theo tên danh mục, slug..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                             </div>
//                         </div>

//                         {/* Select Lọc theo trạng thái */}
//                         <div className="col-span-1">
//                             <label htmlFor="statusFilter" className="form-label">Lọc theo trạng thái</label>
//                             <div className="flex">
//                                 <span className="input-group-text"><Filter size={18} /></span>
//                                 <select
//                                     className="form-select"
//                                     id="statusFilter"
//                                     value={statusFilter}
//                                     onChange={(e) => setStatusFilter(e.target.value)}
//                                 >
//                                     <option value="all">Tất cả</option>
//                                     <option value="true">Hoạt động</option>
//                                     <option value="false">Đã khóa</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* --- 2. BẢNG DỮ LIỆU ĐA CẤP --- */}
//             <div className="card overflow-hidden">
//                 <div className="p-6">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             {/* Tiêu đề bảng */}
//                             <thead className="table-light">
//                                 <tr>
//                                     <th scope="col" className="py-3 px-4 text-left">Tên Danh mục</th>
//                                     <th scope="col" className="py-3 px-4 text-left">Slug</th>
//                                     <th scope="col" className="py-3 px-4 text-center">Sản phẩm</th>
//                                     <th scope="col" className="py-3 px-4 text-left">Trạng thái</th>
//                                     <th scope="col" className="py-3 px-4 text-left">Ngày tạo</th>
//                                     <th scope="col" className="py-3 px-4 text-center">Hành động</th>
//                                 </tr>
//                             </thead>

//                             {/* Nội dung bảng */}
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {paginatedCategories.length > 0 ? (
//                                     paginatedCategories.map((category) => (
//                                         <CategoryItem
//                                             key={category.id}
//                                             category={category}
//                                             expandedIds={expandedIds}
//                                             onExpandToggle={handleExpandToggle}
//                                             onEdit={handleEdit}
//                                             onDelete={handleDelete}
//                                         />
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan="6" className="py-10 text-center text-gray-500 text-lg">
//                                             Không tìm thấy danh mục nào phù hợp.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* --- 3. THANH PHÂN TRANG (Mocked) --- */}
//                 <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
//                     <span className="text-sm text-gray-700">
//                         Hiển thị {paginatedCategories.length} danh mục (Tổng cộng {initialCategories.length} danh mục).
//                     </span>
//                     <div className="flex items-center space-x-1">
//                         <button className="px-3 py-1 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-100 cursor-not-allowed" disabled>
//                             Trước
//                         </button>
//                         <span className="px-3 py-1 text-sm font-semibold bg-indigo-600 text-white rounded-lg">1</span>
//                         {/* {totalPages > 1 && <span className="px-3 py-1 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-100">2</span>} */}
//                         <button className="px-3 py-1 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-100 cursor-not-allowed" disabled>
//                             Sau
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Modal placeholder would go here */}

//         </div>
//     );
// }

// export default App;