// frontend/src/constants/order-status.ts

// 1. Các trạng thái đơn hàng (Logic)
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

// 2. Nhãn hiển thị tiếng Việt (Dùng cho UI) --> ĐÂY LÀ CÁI BẠN ĐANG THIẾU
export const STATUS_LABEL: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

// 3. Màu sắc hiển thị (Dùng cho UI)
export const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-warning text-dark',
  Processing: 'bg-info text-white',
  Shipped: 'bg-primary text-white',
  Delivered: 'bg-success text-white',
  Cancelled: 'bg-danger text-white',
};

// 4. Quy tắc chuyển đổi (Logic)
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};