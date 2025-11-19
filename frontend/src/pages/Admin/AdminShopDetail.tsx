import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiArrowLeft, FiCheckCircle, FiXCircle, FiDollarSign,
    FiBox, FiShoppingCart, FiUser, FiHome, FiMail, FiPhone,
    FiEye
} from 'react-icons/fi';
import type { ProductType } from '../../types/ProductType';
import type { ShopType } from '../../types/ShopType';
import { fetchShopDetail } from '../../api/admin/shopsAdmin';
import type { UserAdminType } from '../../types/admin/UserTypeAdmin';
import Pagenum from '../../components/Admin/Pagenum';
import { set } from 'date-fns';

const mockOrders = [{ id: 'O901', customer: 'Khách A', total: 200000, status: 'completed' }, { id: 'O902', customer: 'Khách B', total: 50000, status: 'processing' }];

const AdminShopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [shop, setShop] = useState<ShopType | null>(null);
    const [activeTab, setActiveTab] = useState('overview'); // State cho tab
    const [products, setProducts] = useState<ProductType[]>([]);
    const [user, setUser] = useState<UserAdminType | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    useEffect(() => {
        loadInfo(Number(id), currentPage, itemsPerPage);
    }, [id, currentPage]);
    const loadInfo = async (shopId: number, page: number, limit: number) => {
        try {
            const data = await fetchShopDetail(shopId, page, limit);
            setShop(data.shop);
            setUser(data.userInfo);
            setProducts(data.products);
            setTotalPages(data.totalPages);
            console.log("Shop detail data:", data);
        } catch (error) {
            console.error("Lỗi tải thông tin shop:", error);
        }
    }
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };
    // Helper render badge
    const getStatusBadge = (status: string) => {
        let className = 'badge ';
        let text = '';

        switch (status) {
            case 'approved':
                className += 'bg-success';
                text = 'Đã duyệt';
                break;
            case 'pending':
                className += 'bg-warning text-dark';
                text = 'Chờ duyệt';
                break;
            case 'banned':
                className += 'bg-danger';
                text = 'Bị cấm';
                break;
            default:
                className += 'bg-secondary';
                text = 'Không xác định';
        }

        return <span className={className}>{text}</span>;
    }; // ✔ đóng function
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
                    {getStatusBadge(shop.status.toString())}
                </div>
                <Link to="/admin/shops" className="btn btn-outline-secondary">
                    <FiArrowLeft className="me-1" />
                    Quay lại danh sách
                </Link>
            </div>

            {/* --- 2. KHU VỰC HÀNH ĐỘNG --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-body d-flex gap-2">
                    {shop.status === 0 && (
                        <button className="btn btn-success" onClick={handleApprove}>
                            <FiCheckCircle className="me-1" /> Duyệt Shop
                        </button>
                    )}
                    {shop.status === 1 && (
                        <button className="btn btn-danger" onClick={handleBan}>
                            <FiXCircle className="me-1" /> Cấm Shop
                        </button>
                    )}
                    {shop.status === -1 && (
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
                                {/* <h4 className="card-title mb-0">{shop.totalRevenue.toLocaleString()} VNĐ</h4> */}
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
                                {/* <h4 className="card-title mb-0">{shop.totalOrders}</h4> */}
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
                                <h4 className="card-title mb-0">{products.length}</h4>
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
                                Sản phẩm ({products.length})
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
                                    <li className="list-group-item d-flex align-items-center"><FiUser className="me-2 text-muted" /> {user?.name}</li>
                                    <li className="list-group-item d-flex align-items-center"><FiMail className="me-2 text-muted" /> {user?.email}</li>
                                    <li className="list-group-item d-flex align-items-center"><FiPhone className="me-2 text-muted" /> {user?.phone}</li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h5>Thông tin Cửa hàng</h5>
                                <ul className="list-group list-group-flush">
                                    {/* <li className="list-group-item d-flex align-items-center"><FiHome className="me-2 text-muted" /> {shop.address}</li> */}
                                    <li className="list-group-item">
                                        <strong className="d-block mb-1">Mô tả:</strong>
                                        {shop.description}
                                    </li>
                                    <li className="list-group-item">
                                        <strong className="d-block mb-1">Ngày tham gia:</strong>
                                        {new Date(shop.created_at).toLocaleDateString()}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* --- Tab 2: Sản phẩm --- */}
                    {activeTab === 'products' && (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className=" text-center table-light">
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Tên Sản phẩm</th>
                                        <th scope="col">Giá</th>
                                        <th scope="col">Trạng thái</th>
                                        <th scope="col">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr className="text-center" key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.name}</td>
                                            <td>{p.base_price.toLocaleString()} VNĐ</td>
                                            <td>
                                                <span className={`badge ${p.status === 1 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {p.status === 1 ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    to={`/product/${p.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Xem chi tiết"
                                                >
                                                    <FiEye />
                                                </Link>
                                            </td>
                                            {/* <td><button className="btn btn-sm btn-outline-primary">Xem</button></td> */}
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

                    <Pagenum currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
            </div>
        </div>
    );
};

export default AdminShopDetail;