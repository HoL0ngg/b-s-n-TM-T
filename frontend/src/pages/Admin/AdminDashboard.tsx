import React, { useState, useEffect } from 'react';
import {
    FaShoppingBag, FaUserFriends, FaMoneyBillWave,
    FaStore,
    FaEllipsisH
} from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

import { apiGetDashboardStats, type DashboardStats } from '../../api/admin'

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                // Gọi API (không truyền tham số để lấy mặc định tháng này)
                const data = await apiGetDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Lỗi tải thống kê:", err);
                setError("Không thể tải dữ liệu thống kê.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const renderStatusBadge = (status: string) => {
        const badges: { [key: string]: string } = {
            delivered: 'bg-success-subtle text-success',
            pending: 'bg-warning-subtle text-warning',
            shipping: 'bg-info-subtle text-info',
            cancelled: 'bg-danger-subtle text-danger',
        };
        const labels: { [key: string]: string } = {
            delivered: 'Hoàn thành',
            pending: 'Chờ xử lý',
            shipping: 'Đang giao',
            cancelled: 'Đã hủy',
        };
        return (
            <span className={`badge rounded-pill px-3 py-2 ${badges[status] || 'bg-secondary'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (isLoading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!stats) return null;

    return (
        <div className="container-fluid py-4">

            {/* --- HEADER & FILTER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Tổng quan</h3>
                    <p className="text-muted mb-0">Chào mừng trở lại, Admin!</p>
                </div>
                <div className="d-flex gap-2">
                    <select className="form-select form-select-sm shadow-sm" style={{ width: '150px' }}>
                        <option>7 ngày qua</option>
                        <option>Tháng này</option>
                        <option>Năm nay</option>
                    </select>
                    <button className="btn btn-primary btn-sm shadow-sm">Xuất báo cáo</button>
                </div>
            </div>

            {/* --- 1. STATS CARDS (THẺ THỐNG KÊ) --- */}
            <div className="row g-3 mb-4">
                {/* Doanh thu */}
                <StatsCard
                    title="Tổng doanh thu"
                    value={`${Math.round(stats.summary.revenue).toLocaleString('vi-VN')}₫`}
                    icon={<FaMoneyBillWave size={24} />}
                    color="primary"
                />
                {/* Đơn hàng */}
                <StatsCard
                    title="Tổng đơn hàng"
                    value={stats.summary.orders}
                    icon={<FaShoppingBag size={24} />}
                    color="success"
                />
                {/* Khách hàng mới */}
                <StatsCard
                    title="Khách hàng mới"
                    value={stats.summary.new_users}
                    icon={<FaUserFriends size={24} />}
                    color="info"
                />
                {/* Shop mới */}
                <StatsCard
                    title="Shop mới"
                    value={stats.summary.new_shops}
                    icon={<FaStore size={24} />}
                    color="warning"
                />
            </div>

            {/* --- 2. CHARTS SECTION --- */}
            <div className="row g-4 mb-4">

                {/* A. Top Shops (Biểu đồ cột) */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold text-dark">Top 5 Shop Doanh Thu Cao</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={stats.topShops.slice(0, 5)} // Lấy 5 shop đầu
                                        layout="vertical" // Biểu đồ ngang cho dễ đọc tên shop
                                        margin={{ left: 40 }} // Thêm lề cho tên shop
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip formatter={(value) => Math.round(Number(value)).toLocaleString('vi-VN') + '₫'} />
                                        <Bar dataKey="total_revenue" fill="#0d6efd" name="Doanh thu" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Top Khách hàng (Bảng) */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold text-dark">Khách Hàng VIP</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Khách hàng</th>
                                        <th className="text-center">Số đơn</th>
                                        <th className="text-end pe-4">Chi tiêu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topCustomers.map((customer, index) => (
                                        <tr key={index}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={customer.avatar_url || '/assets/panda.png'}
                                                        alt=""
                                                        className="rounded-circle me-2"
                                                        style={{ width: 32, height: 32 }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold small">{customer.full_name}</div>
                                                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{customer.phone_number}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">{customer.total_orders}</td>
                                            <td className="text-end pe-4 fw-bold text-primary">
                                                {Math.round(customer.total_spent).toLocaleString('vi-VN')}₫
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Biểu đồ Doanh thu (Area Chart) - Chiếm 8 cột */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark">Phân tích Doanh thu</h5>
                            <button className="btn btn-light btn-sm"><FaEllipsisH /></button>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={stats.revenueChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            {/* Tạo hiệu ứng Gradient (mờ dần xuống dưới) */}
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6c757d' }}
                                            tickFormatter={(value) => `${value / 1000000}M`} // Rút gọn số (15M)
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number) => [Math.round(value).toLocaleString() + ' ₫', 'Doanh thu']}
                                        />
                                        <Area
                                            type="monotone" // Đường cong mềm mại
                                            dataKey="revenue"
                                            stroke="#0d6efd"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ Lượng đơn hàng (Bar Chart) - Chiếm 4 cột */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold text-dark">Lượng đơn hàng</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={stats.revenueChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        {/* Cột màu xanh lá */}
                                        <Bar dataKey="orders" name="Đơn hàng" fill="#198754" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. RECENT ORDERS TABLE --- */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-dark">Đơn hàng gần đây</h5>
                    <button className="btn btn-light btn-sm text-primary fw-semibold">Xem tất cả</button>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover text-center table-striped">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Shop</th>
                                    <th>Ngày đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* DÙNG DỮ LIỆU THẬT TỪ API */}
                                {stats.recentOrders.map((order) => (
                                    <tr key={order.order_id} className='text-center'>
                                        <td className="ps-4 fw-bold text-primary">#{order.order_id}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {/* Avatar khách hàng (nếu có) */}
                                                <div className="avatar-circle bg-secondary bg-opacity-10 text-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 12, overflow: 'hidden' }}>
                                                    {order.customer_avatar ? (
                                                        <img src={order.customer_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        order.customer.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div>{order.customer}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {order.shop_name}
                                        </td>
                                        {/* Format ngày tháng */}
                                        <td className="text-muted">
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="text-center fw-bold">
                                            {Number(order.total).toLocaleString('vi-VN')} ₫
                                        </td>
                                        <td className="text-center">
                                            {renderStatusBadge(order.status)}
                                        </td>
                                        <td className="text-center pe-4">
                                            <button className="btn btn-sm btn-outline-secondary">Chi tiết</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

const StatsCard = ({ title, value, icon, color }: any) => (
    <div className="col-12 col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                    <div>
                        <span className="d-block text-muted text-uppercase small fw-bold">{title}</span>
                        <h4 className={`mb-0 text-${color} fw-bold`}>{value}</h4>
                    </div>
                    <div className={`icon-shape bg-${color} bg-opacity-10 text-${color} rounded-3 p-3 d-flex align-items-center justify-content-center`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    </div>
);