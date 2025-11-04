import { Request, Response } from 'express';
import { calculateShippingFee } from '../services/shipping.service';
// Import hàm bạn đã tạo ở bước trước

// --- RẤT QUAN TRỌNG ---
// Bạn phải thêm địa chỉ kho của mình vào file .env
// Ví dụ: WAREHOUSE_ADDRESS="123 Kho Hàng Của Tôi, Quận Ba Đình, Hà Nội"
const WAREHOUSE_ADDRESS = process.env.WAREHOUSE_ADDRESS;

class ShippingController {

    async calculateFee(req: Request, res: Response) {
        try {
            // 1. Lấy địa chỉ giao hàng từ body
            const { street, ward, city, shop_id } = req.body;

            if (!street || !ward || !city || !shop_id) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ địa chỉ" });
            }
            if (!WAREHOUSE_ADDRESS) {
                throw new Error("Chưa cấu hình địa chỉ kho hàng trên server");
            }

            // 2. Ghép lại thành chuỗi địa chỉ
            const deliveryAddress = `${street}, ${ward}, ${city}`;

            // 3. Gọi hàm service (từ bài trước)
            // (Hàm này đã chứa logic gọi Nominatim và OSRM)
            const feeData = await calculateShippingFee(WAREHOUSE_ADDRESS, deliveryAddress);

            // 4. Trả về kết quả
            res.json(feeData); // Ví dụ: { distanceKm: "10.5", shippingFee: 53000 }

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ShippingController();