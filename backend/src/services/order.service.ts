import * as OrderModel from '../models/order.model';
import * as ShopModel from '../models/shop.model';
import { STATUS_LABEL } from '../constants/order-status';

export const getOrdersForShop = async (userId: string, status: string | undefined) => { 
    const shopId = await ShopModel.findShopIdByOwner(userId);
    if (!shopId) {
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }
    return OrderModel.findOrdersByShopId(shopId, status);
};

export const updateOrderStateByShop = async (userId: string, orderId: number, newStatus: string) => {
    const shopId = await ShopModel.findShopIdByOwner(userId);
    if (!shopId) throw new Error("Người dùng này không sở hữu Shop nào.");

    const currentOrder = await OrderModel.findOrderById(orderId);
    if (!currentOrder) throw new Error("Không tìm thấy đơn hàng.");

    let paymentStatusToUpdate: string | undefined = undefined;

    if (newStatus === 'Delivered' && 
        currentOrder.payment_method === 'COD' && 
        currentOrder.payment_status === 'Unpaid') {
        
        paymentStatusToUpdate = 'Paid';
    }

    const success = await OrderModel.updateOrderStatusByShop(
        orderId, 
        shopId, 
        newStatus, 
        paymentStatusToUpdate
    );

    if (!success) throw new Error("Cập nhật thất bại.");

    const statusName = STATUS_LABEL[newStatus] || newStatus;

    let msg = `Đã cập nhật trạng thái thành công thành "${statusName}"`;
    if (paymentStatusToUpdate) {
        msg += ` và tự động xác nhận "Đã thanh toán".`;
    }

    return { message: msg };
};

export const getOrderDetailForShop = async (userId: string, orderId: number) => {
    const shopId = await ShopModel.findShopIdByOwner(userId);
        if (!shopId) {
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }
        return OrderModel.findOrderDetailByShop(orderId, shopId);
};