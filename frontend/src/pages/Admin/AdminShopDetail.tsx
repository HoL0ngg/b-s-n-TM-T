import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiArrowLeft, FiCheckCircle, FiXCircle, FiDollarSign,
    FiBox, FiShoppingCart, FiUser, FiHome, FiMail, FiPhone
} from 'react-icons/fi';

// --- Dữ liệu mẫu (Tạm thời đặt ở đây) ---
// (Bạn có thể tái sử dụng dữ liệu từ file trước hoặc fetch API thật)
interface Shop {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    status: 'approved' | 'pending' | 'banned';
    joinedDate: string;
    productCount: number;
    totalRevenue: number;
    totalOrders: number;
}
const mockShops: Shop[] = [
    { id: 'S001', name: 'Shop Cây Cảnh Mini', ownerName: 'Nguyễn Văn A', email: 'a.nguyen@example.com', phone: '0901234567', address: '123 Đường ABC, Q.1, TP.HCM', description: 'Chuyên cây cảnh mini, tiểu cảnh', status: 'approved', joinedDate: '2023-10-01', productCount: 45, totalRevenue: 15000000, totalOrders: 120 },
    { id: 'S003', name: 'Thời Trang Trẻ Em', ownerName: 'Lê Văn C', email: 'c.le@example.com', phone: '0907654321', address: '456 Đường XYZ, Q.3, TP.HCM', description: 'Quần áo trẻ em nhập khẩu', status: 'pending', joinedDate: '2023-11-01', productCount: 0, totalRevenue: 0, totalOrders: 0 },
    { id: 'S004', name: 'Đồ Ăn Vặt Nhanh', ownerName: 'Phạm Hùng D', email: 'd.pham@example.com', phone: '0908889999', address: '789 Đường DEF, Q.10, TP.HCM', description: 'Đồ ăn vặt các loại', status: 'banned', joinedDate: '2023-08-20', productCount: 15, totalRevenue: 2500000, totalOrders: 50 },
    // ... (các shop khác)
];
// (Dữ liệu mẫu cho các tab, bạn sẽ fetch chúng dựa trên shop ID)
const mockProducts = [{ id: 'P01', name: 'Cây Kim Tiền', price: 150000, status: 'approved' }, { id: 'P02', name: 'Sen Đá', price: 50000, status: 'pending' }];
const mockOrders = [{ id: 'O901', customer: 'Khách A', total: 200000, status: 'completed' }, { id: 'O902', customer: 'Khách B', total: 50000, status: 'processing' }];
// --- Kết thúc Dữ liệu mẫu ---


const AdminShopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [shop, setShop] = useState<Shop | null>(null);
    const [activeTab, setActiveTab] = useState('overview'); // State cho tab

    // Giả lập Fetch API lấy chi tiết shop
    useEffect(() => {
        // Trong ứng dụng thật, bạn sẽ gọi API: fetch(`/api/admin/shops/${id}`)
        const foundShop = mockShops.find(s => s.id === id) || null;
        setShop(foundShop);
    }, [id]);

    // Helper render badge
    const getStatusBadge = (status: 'approved' | 'pending' | 'banned') => {
        const map = {
            approved: { class: 'bg-success', text: 'Đã duyệt' },
            pending: { class: 'bg-warning text-dark', text: 'Chờ duyệt' },
            banned: { class: 'bg-danger', text: 'Bị cấm' },
        };
        return <span className={`badge ${map[status].class}`}>{map[status].text}</span>;
    };

    if (!shop) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Xử lý sự kiện (placeholder)
    const handleApprove = () => alert(`Duyệt shop ${shop.name}`);
    const handleBan = () => alert(`Cấm shop ${shop.name}`);
    const handleUnban = () => alert(`Mở khóa shop ${shop.name}`);


    return (
        <div>
            {/* --- 1. HEADER VÀ NÚT QUAY LẠI --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0 d-inline-block me-2">{shop.name}</h1>
                    {getStatusBadge(shop.status)}
                </div>
                <Link to="/admin/shops" className="btn btn-outline-secondary">
                    <FiArrowLeft className="me-1" />
                    Quay lại danh sách
                </Link>
            </div>

            {/* --- 2. KHU VỰC HÀNH ĐỘNG --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-body d-flex gap-2">
                    {shop.status === 'pending' && (
                        <button className="btn btn-success" onClick={handleApprove}>
                            <FiCheckCircle className="me-1" /> Duyệt Shop
                        </button>
                    )}
                    {shop.status === 'approved' && (
                        <button className="btn btn-danger" onClick={handleBan}>
                            <FiXCircle className="me-1" /> Cấm Shop
                        </button>
                    )}
                    {shop.status === 'banned' && (
                        <button className="btn btn-warning" onClick={handleUnban}>
                            <FiCheckCircle className="me-1" /> Mở khóa Shop
                        </button>
                    )}
                    <button className="btn btn-outline-primary ms-auto">
                        <FiMail className="me-1" /> Gửi thông báo
                    </button>
                </div>
            </div>

            {/* --- 3. THỐNG KÊ NHANH --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm bg-primary text-white h-100">
                        <div className="card-body d-flex align-items-center">
                            <FiDollarSign size={40} className="opacity-50 me-3" />
                            <div>
                                <h6 className="card-subtitle mb-1">TỔNG DOANH THU</h6>
                                <h4 className="card-title mb-0">{shop.totalRevenue.toLocaleString()} VNĐ</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm bg-info text-white h-100">
                        <div className="card-body d-flex align-items-center">
                            <FiShoppingCart size={40} className="opacity-50 me-3" />
                            <div>
                                <h6 className="card-subtitle mb-1">TỔNG ĐƠN HÀNG</h6>
                                <h4 className="card-title mb-0">{shop.totalOrders}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm bg-secondary text-white h-100">
                        <div className="card-body d-flex align-items-center">
                            <FiBox size={40} className="opacity-50 me-3" />
                            <div>
                                <h6 className="card-subtitle mb-1">SỐ SẢN PHẨM</h6>
                                <h4 className="card-title mb-0">{shop.productCount}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 4. KHU VỰC TAB --- */}
            <div className="card shadow-sm">
                {/* Nav Tabs */}
                <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs" role="tablist">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Tổng quan
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                                onClick={() => setActiveTab('products')}
                            >
                                Sản phẩm ({mockProducts.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                Đơn hàng ({mockOrders.length})
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Tab Content */}
                <div className="card-body p-4">
                    {/* --- Tab 1: Tổng quan --- */}
                    {activeTab === 'overview' && (
                        <div className="row g-4">
                            <div className="col-md-6">
                                <h5>Thông tin Chủ shop</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex align-items-center"><FiUser className="me-2 text-muted" /> {shop.ownerName}</li>
                                    <li className="list-group-item d-flex align-items-center"><FiMail className="me-2 text-muted" /> {shop.email}</li>
                                    <li className="list-group-item d-flex align-items-center"><FiPhone className="me-2 text-muted" /> {shop.phone}</li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h5>Thông tin Cửa hàng</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex align-items-center"><FiHome className="me-2 text-muted" /> {shop.address}</li>
                                    <li className="list-group-item">
                                        <strong className="d-block mb-1">Mô tả:</strong>
                                        {shop.description}
                                    </li>
                                    <li className="list-group-item">
                                        <strong className="d-block mb-1">Ngày tham gia:</strong>
                                        {shop.joinedDate}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* --- Tab 2: Sản phẩm --- */}
                    {activeTab === 'products' && (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Tên Sản phẩm</th>
                                        <th scope="col">Giá</th>
                                        <th scope="col">Trạng thái</th>
                                        <th scope="col">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockProducts.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.name}</td>
                                            <td>{p.price.toLocaleString()} VNĐ</td>
                                            <td>
                                                <span className={`badge ${p.status === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {p.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </td>
                                            <td><button className="btn btn-sm btn-outline-primary">Xem</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- Tab 3: Đơn hàng --- */}
                    {activeTab === 'orders' && (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">ID Đơn hàng</th>
                                        <th scope="col">Khách hàng</th>
                                        <th scope="col">Tổng tiền</th>
                                        <th scope="col">Trạng thái</th>
                                        <th scope="col">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockOrders.map(o => (
                                        <tr key={o.id}>
                                            <td>{o.id}</td>
                                            <td>{o.customer}</td>
                                            <td>{o.total.toLocaleString()} VNĐ</td>
                                            <td>
                                                <span className={`badge ${o.status === 'completed' ? 'bg-success' : 'bg-info'}`}>
                                                    {o.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                                </span>
                                            </td>
                                            <td><button className="btn btn-sm btn-outline-primary">Xem</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminShopDetail;