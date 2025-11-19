// backend/src/constants/order-status.ts

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export const STATUS_LABEL: Record<string, string> = {
  'Pending': 'Chờ xác nhận',
  'Processing': 'Đang xử lý',
  'Shipped': 'Đang giao',
  'Delivered': 'Đã giao',
  'Cancelled': 'Đã hủy'
};

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Processing', 'Cancelled'],
  'Processing': ['Shipped', 'Cancelled'],
  'Shipped': ['Delivered'],
  'Delivered': [],
  'Cancelled': [],
};

export const canTransition = (currentStatus: string, nextStatus: string): boolean => {
  if (currentStatus === nextStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
};