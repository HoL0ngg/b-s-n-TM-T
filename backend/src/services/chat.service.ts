import OpenAI from "openai";
import { ENV } from "../config/env";
import pool from "../config/db";

const openai = new OpenAI({
    apiKey: ENV.OPENAI_API_KEY
});

// Helper function to search for products
async function searchProducts(keyword: string): Promise<any[]> {
    const conn = await pool.getConnection();
    try {
        // Split keyword into individual words for better matching
        const keywords = keyword.trim().split(/\s+/);

        // Build LIKE conditions for each keyword
        const conditions = keywords.map(() => 'p.name LIKE ?').join(' AND ');
        const params = keywords.map(k => `%${k}%`);

        const query = `
            SELECT p.id, p.name, p.base_price, pi.image_url
            FROM products p
            LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_main = 1
            WHERE ${conditions} AND p.status = 1
            LIMIT 5
        `;
        const [rows] = await conn.query(query, params);

        return rows as any[];
    } finally {
        conn.release();
    }
}

export async function getChatReply(message: string): Promise<string> {
    try {
        // Check if user is searching for a product
        const searchPatterns = [
            /(?:tìm|tìm kiếm)\s+(.+?)(?:\s+(?:đi|nào|được|không|ko|k|ạ|nhé))?$/i,
            /có\s+(.+?)\s+(?:không|ko|k|nào)/i,
            /(.+?)\s+ở\s*đâu/i,
            /(?:looking for|find|search(?:\s+for)?)\s+(.+?)(?:\s+(?:please|pls))?$/i,
            /(.+?)\s+(?:giá|bao nhiêu|giá bán)/i,
        ];

        let searchKeyword: string | null = null;
        for (const pattern of searchPatterns) {
            const match = message.match(pattern);
            if (match) {
                searchKeyword = match[1].trim();
                // Remove trailing punctuation
                searchKeyword = searchKeyword.replace(/[?.!,]+$/, '');
                break;
            }
        }

        // If it's a product search query
        if (searchKeyword) {
            console.log(searchKeyword);
            const products = await searchProducts(searchKeyword);

            if (products.length > 0) {
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const productLinks = products.map(p =>
                    `- [${p.name}](${frontendUrl}/product/${p.id}) - ${Number(p.base_price).toLocaleString('vi-VN')}đ`
                ).join('\n');

                return `Tôi tìm thấy ${products.length} sản phẩm cho "${searchKeyword}":\n\n${productLinks}\n\nBạn có thể click vào link để xem chi tiết sản phẩm!`;
            } else {
                return `Xin lỗi, tôi không tìm thấy sản phẩm nào với từ khóa "${searchKeyword}". Bạn có thể thử tìm kiếm với từ khóa khác hoặc duyệt qua danh mục sản phẩm của chúng tôi.`;
            }
        }

        // Normal chatbot response for non-search queries
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Bạn là nhân viên hỗ trợ khách hàng chuyên nghiệp của sàn thương mại điện tử "BáSàn".

**THÔNG TIN VỀ BASAN:**
- BáSàn là nền tảng mua bán trực tuyến kết nối người mua và người bán
- Hotline: 0937211264 (8h-22h)
- Email: hihi@gmail.com

**HƯỚNG DẪN CHO KHÁCH HÀNG:**

1. **Mua hàng:**
   - Tìm kiếm sản phẩm qua thanh tìm kiếm hoặc duyệt theo danh mục
   - Chọn sản phẩm → Chọn phân loại (màu sắc, kích thước) → Chọn số lượng
   - Nhấn "Thêm vào giỏ hàng" hoặc "Mua ngay" để thanh toán trực tiếp
   - Tại giỏ hàng, chọn sản phẩm muốn mua → Nhấn "Thanh toán"
   - Điền địa chỉ giao hàng và chọn phương thức thanh toán (COD/VNPay)

2. **Quản lý đơn hàng:**
   - Vào "Đơn mua" (icon người dùng → Đơn mua)
   - Xem trạng thái: Chờ xác nhận / Đang giao / Đã giao / Đã hủy
   - Có thể hủy đơn khi đang "Chờ xác nhận"
   - Nhấn "Đã nhận hàng" khi nhận được sản phẩm
   - Viết đánh giá sau khi xác nhận đã nhận hàng

3. **Tìm shop:**
   - Click vào tên shop trên trang sản phẩm
   - Xem tất cả sản phẩm, đánh giá và thông tin shop

4. **Tài khoản:**
   - Đăng ký bằng email và số điện thoại (có xác thực OTP)
   - Quản lý thông tin cá nhân tại "Hồ sơ"
   - Thêm/sửa địa chỉ giao hàng tại "Địa chỉ"

5. **Trở thành người bán:**
   - Click icon cửa hàng trên thanh menu
   - Điền thông tin đăng ký shop
   - Sau khi được duyệt, có thể đăng sản phẩm và quản lý đơn hàng

**CHÍNH SÁCH:**
- Hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi
- Miễn phí vận chuyển cho đơn từ 150,000đ
- Thanh toán an toàn với nhiều phương thức

**LƯU Ý:** Nếu khách hỏi về sản phẩm cụ thể (ví dụ: "tìm son maybelline", "có áo thun không"), hãy gợi ý họ sử dụng thanh tìm kiếm hoặc nói "Để tìm sản phẩm cụ thể, bạn có thể hỏi tôi với cú pháp: 'tìm [tên sản phẩm]' và tôi sẽ tìm giúp bạn!"

Hãy trả lời chuyên nghiệp, lịch sự, ngắn gọn (2-4 câu). Nếu khách hỏi ngoài phạm vi, hướng dẫn liên hệ hotline.`,
                },
                { role: "user", content: message },
            ],
        });

        return completion.choices[0].message?.content || "Xin lỗi, không có phản hồi.";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("Có lỗi khi gọi OpenAI API");
    }
}