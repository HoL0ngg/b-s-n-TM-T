import * as OrderModel from '../models/order.model';
import * as ShopModel from '../models/shop.model';

export const getOrdersForShop = async (userId: string, status: string | undefined) => { 
    const shopId = await ShopModel.findShopIdByOwner(userId);
    if (!shopId) {
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }
    return OrderModel.findOrdersByShopId(shopId, status);
};

export const updateOrderStateByShop = async (userId: string, orderId: number, newStatus: string) => {
    const shopId = await ShopModel.findShopIdByOwner(userId);
    if (!shopId) {
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }

    return OrderModel.updateOrderStatusByShop(orderId, shopId, newStatus);
};

/**
 * [Shop] Lấy chi tiết 1 đơn hàng
 */
export const getOrderDetailForShop = async (userId: string, orderId: number) => {
    const shopId = await ShopModel.findShopIdByOwner(userId);
        if (!shopId) {
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }
        return OrderModel.findOrderDetailByShop(orderId, shopId);
};