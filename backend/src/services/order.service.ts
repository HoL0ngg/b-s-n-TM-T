import * as OrderModel from '../models/order.model';
import * as ShopModel from '../models/shop.model'; // Import model shop

/**
 * [Shop] Lấy các đơn hàng liên quan đến Shop của người dùng
 *
 * Đây là nơi xử lý bảo mật "không cần role":
 * 1. Lấy userId (SĐT) từ Controller.
 * 2. Kiểm tra xem SĐT này có phải là 'owner_id' của một shop nào không.
 * 3. Nếu không, ném lỗi.
 * 4. Nếu có, lấy Shop ID và dùng nó để tìm đơn hàng.
 */
export const getOrdersForShop = async (userId: string) => { // userId là SĐT
    // Bước 1: Kiểm tra xem người dùng này có phải chủ shop không
    const shopId = await ShopModel.findShopIdByOwner(userId);
    
    // Bước 2: Nếu không phải chủ shop (shopId = null), ném lỗi
    if (!shopId) {
        // Lỗi này sẽ bị Controller bắt và gửi về Frontend
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }
    
    // Bước 3: Nếu là chủ shop, lấy đơn hàng bằng Shop ID
    return OrderModel.findOrdersByShopId(shopId);
};

/**
 * [Shop] Cập nhật trạng thái đơn hàng
 *
 * Logic bảo mật tương tự như trên.
 */
export const updateOrderStateByShop = async (userId: string, orderId: number, newStatus: string) => {
    // Bước 1: Kiểm tra xem người dùng này có phải chủ shop không
    const shopId = await ShopModel.findShopIdByOwner(userId);
    
    // Bước 2: Nếu không phải chủ shop, ném lỗi
    if (!shopId) {
        throw new Error("Người dùng này không sở hữu Shop nào.");
    }

    // Bước 3: Nếu là chủ shop, yêu cầu Model cập nhật.
    // (Model sẽ tự kiểm tra xem shopId có quyền trên orderId này không)
    return OrderModel.updateOrderStatusByShop(orderId, shopId, newStatus);
};