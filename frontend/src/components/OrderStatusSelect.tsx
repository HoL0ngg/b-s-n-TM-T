'use client';

import { STATUS_TRANSITIONS, STATUS_LABEL, STATUS_COLOR } from '../constants/order-status';

import { type OrderStatus } from '../types/OrderType'; 

interface Props {
  orderId: number;
  currentStatus: OrderStatus; 
  onSuccess?: () => void;
}

export default function OrderStatusSelect({ orderId, currentStatus, onSuccess }: Props) {
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];

  if (allowed.length === 0) {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[currentStatus as keyof typeof STATUS_COLOR]}`}>
        {STATUS_LABEL[currentStatus as keyof typeof STATUS_LABEL]}
      </span>
    );
  }

  const handleChange = async (newStatus: string) => {
    if (!confirm(`Chuyển trạng thái sang "${STATUS_LABEL[newStatus as keyof typeof STATUS_LABEL]}"?`)) return;

    try {
      const res = await fetch(`/api/shop/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Cập nhật thành công!');
      onSuccess?.();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-1 border rounded text-sm"
    >
      <option value={currentStatus}>
        {STATUS_LABEL[currentStatus as keyof typeof STATUS_LABEL]} (hiện tại)
      </option>
      
      {allowed.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABEL[status as keyof typeof STATUS_LABEL]}
        </option>
      ))}
    </select>
  );
}