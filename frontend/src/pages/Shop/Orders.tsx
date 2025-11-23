import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { getShopOrders, updateShopOrderStatus, apiUpdatePaymentStatus } from '../../api/order';
import { type OrderType, type OrderStatus, type IApiError } from '../../types/OrderType';

export default function Orders() {
    const [allOrders, setAllOrders] = useState<OrderType[]>([]); // Lưu toàn bộ orders
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');

    // Fetch toàn bộ orders một lần duy nhất
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch tất cả orders (không truyền statusFilter)
            const data: OrderType[] = await getShopOrders(null);
            setAllOrders(data);
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            setError(axiosError.response?.data?.message || 'Lỗi khi tải đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []); // Chỉ fetch một lần khi component mount

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng #${orderId} sang "${newStatus}"?`)) {
            return;
        }
        try {
            await updateShopOrderStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thành công!');
            fetchOrders(); // Refresh data
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            alert('Lỗi khi cập nhật: ' + (axiosError.response?.data?.message || 'Lỗi không xác định'));
        }
    };

    const handlePaymentStatusChange = async (orderId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
        if (!window.confirm(`Bạn có chắc muốn đổi trạng thái thanh toán đơn hàng #${orderId} sang "${newStatus}"?`)) {
            return;
        }
        try {
            await apiUpdatePaymentStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thanh toán thành công!');
            fetchOrders();
        } catch (err) {
            const axiosError = err as AxiosError<IApiError>;
            alert('Lỗi khi cập nhật: ' + (axiosError.response?.data?.message || 'Lỗi không xác định'));
        }
    };

    const handleFilterChange = (status: string | null) => {
        if (status) {
            setSearchParams({ status });
        } else {
            setSearchParams({});
        }
    };

    // Filter orders based on selected status (client-side filtering)
    const filteredOrders = statusFilter 
        ? allOrders.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase())
        : allOrders;

    // Count orders by status (from all orders)
    const statusCounts = {
        all: allOrders.length,
        pending: allOrders.filter(o => o.status.toLowerCase() === 'pending').length,
        confirmed: allOrders.filter(o => o.status.toLowerCase() === 'confirmed').length,
        shipping: allOrders.filter(o => o.status.toLowerCase() === 'shipping').length,
        delivered: allOrders.filter(o => o.status.toLowerCase() === 'delivered').length,
        cancelled: allOrders.filter(o => o.status.toLowerCase() === 'cancelled').length,
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#F5F5F5' }}>
                <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh', padding: '24px' }}>
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Lỗi: {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #B7CCFF 0%, #8FB0FF 100%)',
                padding: '24px 32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                            <i className="bi bi-receipt-cutoff" style={{ fontSize: '28px', color: '#FF9800' }}></i>
                        </div>
                        <div>
                            <h1 className="mb-1" style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#fff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                Quản lý đơn hàng
                            </h1>
                            <p className="mb-0" style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Theo dõi và xử lý đơn hàng của cửa hàng
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px 32px' }}>
                {/* Filter Tabs */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '20px'
                }}>
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            onClick={() => handleFilterChange(null)}
                            style={{
                                backgroundColor: !statusFilter ? '#2196F3' : '#F5F5F5',
                                color: !statusFilter ? '#fff' : '#333',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Tất cả ({statusCounts.all})
                        </button>
                        <button
                            onClick={() => handleFilterChange('pending')}
                            style={{
                                backgroundColor: statusFilter === 'pending' ? '#FF9800' : '#F5F5F5',
                                color: statusFilter === 'pending' ? '#fff' : '#333',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Chờ xử lý ({statusCounts.pending})
                        </button>
                        <button
                            onClick={() => handleFilterChange('confirmed')}
                            style={{
                                backgroundColor: statusFilter === 'confirmed' ? '#2196F3' : '#F5F5F5',
                                color: statusFilter === 'confirmed' ? '#fff' : '#333',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Đã xác nhận ({statusCounts.confirmed})
                        </button>
                        <button
                            onClick={() => handleFilterChange('shipping')}
                            style={{
                                backgroundColor: statusFilter === 'shipping' ? '#9C27B0' : '#F5F5F5',
                                color: statusFilter === 'shipping' ? '#fff' : '#333',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Đang giao ({statusCounts.shipping})
                        </button>
                        <button
                            onClick={() => handleFilterChange('delivered')}
                            style={{
                                backgroundColor: statusFilter === 'delivered' ? '#4CAF50' : '#F5F5F5',
                                color: statusFilter === 'delivered' ? '#fff' : '#333',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Đã giao ({statusCounts.delivered})
                        </button>
                        <button
                            onClick={() => handleFilterChange('cancelled')}
                            style={{
                                backgroundColor: statusFilter === 'cancelled' ? '#F44336' : '#F5F5F5',
                                color: statusFilter === 'cancelled' ? '#fff' : '#333',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Đã hủy ({statusCounts.cancelled})
                        </button>
                    </div>
                </div>

                {/* Orders Table */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        overflowX: 'auto',
                        maxHeight: '600px',
                        overflowY: 'auto'
                    }}>
                        <table className="table table-hover mb-0">
                            <thead style={{
                                backgroundColor: '#FAFAFA',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1
                            }}>
                                <tr>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', minWidth: '100px' }}>Mã đơn</th>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', minWidth: '120px' }}>Ngày đặt</th>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', textAlign: 'right', minWidth: '140px' }}>Tổng tiền</th>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', minWidth: '140px' }}>Phương thức TT</th>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', textAlign: 'center', minWidth: '120px' }}>Trạng thái TT</th>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', textAlign: 'center', minWidth: '140px' }}>Trạng thái ĐH</th>
                                    <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '16px', textAlign: 'center', minWidth: '160px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                                            <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                                            <p style={{ fontSize: '14px', marginBottom: '0' }}>
                                                {statusFilter ? `Không có đơn hàng nào với trạng thái "${statusFilter}"` : 'Bạn chưa có đơn hàng nào'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.order_id}>
                                            {/* Mã đơn */}
                                            <td style={{ padding: '16px' }}>
                                                <strong style={{ color: '#2196F3', fontSize: '14px' }}>#{order.order_id}</strong>
                                            </td>

                                            {/* Ngày đặt */}
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                                                {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                            </td>

                                            {/* Tổng tiền */}
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                    {order.total_amount.toLocaleString('vi-VN')} ₫
                                                </span>
                                            </td>

                                            {/* Phương thức TT */}
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                                                {order.payment_method}
                                            </td>

                                            {/* Trạng thái TT */}
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span 
                                                    style={{
                                                        backgroundColor: order.payment_status === 'Paid' ? '#E8F5E9' : '#FFEBEE',
                                                        color: order.payment_status === 'Paid' ? '#4CAF50' : '#F44336',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        display: 'inline-block',
                                                    }}
                                                >
                                                    {order.payment_status}
                                                </span>
                                            </td>

                                            {/* Trạng thái ĐH */}
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{
                                                    ...getStatusStyle(order.status),
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <i className={`bi ${getStatusIcon(order.status)}`}></i>
                                                    {order.status}
                                                </span>
                                            </td>

                                            {/* Hành động */}
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                    {/* Nút Xem chi tiết */}
                                                    <Link
                                                        to={`/seller/orders/${order.order_id}`}
                                                        style={{
                                                            backgroundColor: '#E3F2FD',
                                                            color: '#2196F3',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            textDecoration: 'none',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                        Chi tiết
                                                    </Link>

                                                    {/* Các nút hành động */}
                                                    {
                                                        order.payment_status === 'Unpaid' && <button
                                                        onClick={() => handlePaymentStatusChange(order.order_id, order.payment_status)}
                                                        style={{
                                                            backgroundColor: '#FFF3E0',
                                                            color: '#FF9800',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                        title="Đổi trạng thái thanh toán"
                                                    >
                                                        <i className="bi bi-check-lg"></i>
                                                        Đã thanh toán
                                                    </button>
                                                    }

                                                    {order.status.toLowerCase() === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(order.order_id, 'Confirmed')}
                                                                style={{
                                                                    backgroundColor: '#E3F2FD',
                                                                    color: '#2196F3',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                                title="Xác nhận đơn"
                                                            >
                                                                <i className="bi bi-check-lg"></i>
                                                                Xác nhận
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(order.order_id, 'Cancelled')}
                                                                style={{
                                                                    backgroundColor: '#FFEBEE',
                                                                    color: '#F44336',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                                title="Hủy đơn hàng"
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                                Hủy đơn
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status.toLowerCase() === 'confirmed' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(order.order_id, 'Shipping')}
                                                                style={{
                                                                    backgroundColor: '#E8F5E9',
                                                                    color: '#4CAF50',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                                title="Giao hàng"
                                                            >
                                                                <i className="bi bi-truck"></i>
                                                                Giao hàng
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(order.order_id, 'Cancelled')}
                                                                style={{
                                                                    backgroundColor: '#FFEBEE',
                                                                    color: '#F44336',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                                title="Hủy đơn hàng"
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                                Hủy đơn
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status.toLowerCase() === 'shipping' && (
                                                        <button
                                                            onClick={() => handleStatusChange(order.order_id, 'Delivered')}
                                                            style={{
                                                                backgroundColor: '#E8F5E9',
                                                                color: '#4CAF50',
                                                                border: 'none',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                            title="Đã giao hàng"
                                                        >
                                                            <i className="bi bi-check-circle"></i>
                                                            Đã giao
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hàm tiện ích đổi style trạng thái
const getStatusStyle = (status: OrderStatus) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
        case 'pending':
            return { backgroundColor: '#FFF3E0', color: '#FF9800' };
        case 'confirmed':
            return { backgroundColor: '#E3F2FD', color: '#2196F3' };
        case 'shipping':
            return { backgroundColor: '#F3E5F5', color: '#9C27B0' };
        case 'delivered':
            return { backgroundColor: '#E8F5E9', color: '#4CAF50' };
        case 'cancelled':
            return { backgroundColor: '#FFEBEE', color: '#F44336' };
        default:
            return { backgroundColor: '#F5F5F5', color: '#999' };
    }
};

// Hàm lấy Icon dựa trên trạng thái
const getStatusIcon = (status: OrderStatus) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
        case 'pending': return 'bi-clock-history';
        case 'confirmed': return 'bi-box-seam';
        case 'shipping': return 'bi-truck';
        case 'delivered': return 'bi-check-circle-fill';
        case 'cancelled': return 'bi-x-circle-fill';
        default: return 'bi-question-circle';
    }
};