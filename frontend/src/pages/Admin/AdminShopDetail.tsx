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
import type { OrderType } from '../../types/OrderType';
import { fetchAllOrders } from '../../api/admin/ordersAdmin';
import { set } from 'date-fns';


const AdminShopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [shop, setShop] = useState<ShopType | null>(null);
    const [activeTab, setActiveTab] = useState('overview'); // State cho tab
    const [products, setProducts] = useState<ProductType[]>([]);
    const [user, setUser] = useState<UserAdminType | null>(null);
    const [totalPagesProducts, setTotalPagesProducts] = useState<number>(0);
    const [totalPagesOrders, setTotalPagesOrders] = useState<number>(0);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const itemsPerPage = 7;

    useEffect(() => {
        loadInfo(Number(id));
        fetchOrders();
    }, [id, currentPage]);

    const loadInfo = async (shopId: number) => {
        try {
            const data = await fetchShopDetail(shopId, currentPage, itemsPerPage);
            setShop(data.shop);
            setUser(data.userInfo);
            setProducts(data.products);
            setTotalPagesProducts(data.totalPages);
            // console.log("Shop detail data:", data);
        } catch (error) {
            console.error("Lỗi tải thông tin shop:", error);
        }
    }
    const fetchOrders = async () => {
        try {

            const data = await fetchAllOrders(Number(id), currentPage, itemsPerPage);

            setOrders(data.data);
            setTotalPagesOrders(data.pagination.totalPages);
            setTotalOrders(data.pagination.totalOrders);
            setTotalRevenue(data.pagination.totalRevenue);
            // console.log("Orders", data.data);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        }
    };
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Helper render badge
    const getStatusBadge = (status: number) => {
        let className = 'badge ';
        let text = '';

        switch (status) {
            case 1:
                className += 'bg-success';
                text = 'Đã duyệt';
                break;
            case 0:
                className += 'bg-warning text-dark';
                text = 'Chờ duyệt';
                break;
            case -1:
                className += 'bg-danger';
                text = 'Bị cấm';
                break;
            default:
                className += 'bg-secondary';
                text = 'Không xác định';
        }

        return <span className={className}>{text}</span>;
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

    const renderStatusBadgeOrder = (status: string) => {
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
    const formatVND = (amount: number | string): string => {
        // Chuyển string thành number nếu cần, hoặc đảm bảo nó là number
        const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(numberAmount)) {
            return "0 ₫"; // Trả về giá trị mặc định nếu không phải số hợp lệ
        }

        return numberAmount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }
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


            {/* --- 3. THỐNG KÊ NHANH --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm bg-primary text-white h-100">
                        <div className="card-body d-flex align-items-center">
                            <FiDollarSign size={40} className="opacity-50 me-3" />
                            <div>
                                <h6 className="card-subtitle mb-1">TỔNG DOANH THU</h6>
                                <h4 className="card-title mb-0">{formatVND(totalRevenue)}</h4>
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
                                <h4 className="card-title mb-0">{totalOrders}</h4>
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
                                <h4 className="card-title mb-0">{shop.totalProduct}</h4>
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
                                Sản phẩm ({shop.totalProduct})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                Đơn hàng ({totalOrders})
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
                            <table className="table table-hover text-center">
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
                                                    target="_blank"
                                                >
                                                    <FiEye />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagenum currentPage={currentPage} totalPages={totalPagesProducts} onPageChange={handlePageChange} />
                        </div>
                    )}

                    {/* --- Tab 3: Đơn hàng --- */}
                    {activeTab === 'orders' && (
                        <div className="table-responsive">
                            <table className="table table-hover text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">ID Đơn hàng</th>
                                        <th scope="col">SĐT Khách hàng</th>
                                        <th scope="col">Tổng tiền</th>
                                        <th scope="col">Trạng thái</th>
                                        <th scope="col">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.order_id}>
                                            <td>{o.order_id}</td>
                                            <td>{o.customer_phone}</td>
                                            <td>{formatVND(o.total_amount)}</td>
                                            <td>
                                                {renderStatusBadgeOrder(o.status)}
                                            </td>
                                            <td><button className="btn btn-sm btn-outline-primary">Chi tiết</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagenum currentPage={currentPage} totalPages={totalPagesOrders} onPageChange={handlePageChange} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminShopDetail;