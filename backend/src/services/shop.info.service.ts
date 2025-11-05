import pool from "../config/db";

class ShopInfoService {
    
    // Hàm này giữ nguyên, không thay đổi
    public getShopByUserId = async (userId: string | number): Promise<any> => {
        const query = 'SELECT * FROM shop_info WHERE user_id = ? LIMIT 1';
        
        try {
            const [rows]: any = await pool.execute(query, [userId]);
            return rows && rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error in getShopByUserId service:', error);
            throw error;
        }
    }

    /**
     * SỬA LỖI: 
     * 1. Thay đổi 'userId: number' thành 'userId: string' để khớp với `owner_id`
     * 2. Dùng Transaction để INSERT vào cả 2 bảng `shop_info` và `shops`
     */
    public createShop = async (data: any, userId: string): Promise<any> => {
        const {
            shopName, address, email, phone,
            shippingMethods,
            businessType, invoiceEmail, taxCode,
            identityType, identityNumber, identityFullName
        } = data;
        
        const shippingMethodsJson = JSON.stringify(shippingMethods || []);

        // 1. Lấy 1 kết nối (connection) từ pool
        const connection = await pool.getConnection();
        
        try {
            // 2. Bắt đầu Transaction
            await connection.beginTransaction();

            // 3. INSERT vào bảng shop_info
            const infoQuery = `
                INSERT INTO shop_info (
                    user_id, shop_name, address, email, phone,
                    shipping_methods,
                    business_type, invoice_email, tax_code,
                    identity_type, identity_number, identity_full_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const infoValues = [
                userId, // Đây là user_id (string phone)
                shopName, address, email, phone,
                shippingMethodsJson,
                businessType, invoiceEmail, taxCode,
                identityType, identityNumber, identityFullName
            ];
            await connection.execute(infoQuery, infoValues);

            // 4. INSERT vào bảng shops (PHẦN BỊ THIẾU)
            const shopQuery = `
                INSERT INTO shops 
                (name, logo_url, description, status, owner_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.execute(shopQuery, [
                shopName,
                '/assets/shops/default_logo.png', // Logo mặc định
                `Chào mừng đến với ${shopName}`, // Mô tả mặc định
                1, // Status: Active
                userId // owner_id (string phone)
            ]);

            // 5. Commit (Lưu) Transaction
            await connection.commit();
            
            return { success: true, message: "Đăng ký shop thành công!" };

        } catch (error: any) {
            // 6. Rollback (Hủy) nếu có lỗi
            await connection.rollback();

            // Giữ lại phần xử lý lỗi ER_DUP_ENTRY của bạn
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('shop_name_unique') || error.message.includes('shops.name_UNIQUE')) {
                    throw new Error('Tên shop này đã tồn tại.');
                }
                if (error.message.includes('user_id_unique') || error.message.includes('shops.owner_id_UNIQUE')) {
                    throw new Error('Số điện thoại này đã đăng ký shop.');
                }
            }
            console.error('Lỗi khi tạo shop:', error);
            throw error; 

        } finally {
            // 7. Luôn luôn trả kết nối về pool
            connection.release();
        }
    }

    /**
     * NÂNG CẤP:
     * 1. Dùng Transaction để cập nhật cả 2 bảng
     * 2. Lấy `ownerId` từ `shopId` (của shop_info) để cập nhật bảng `shops`
     */
    public updateShop = async (shopInfoId: number, data: any): Promise<any> => {
        const shopName = data.shopName || data.shop_name || null;
        const address = data.address || null;
        const email = data.email || null;
        const phone = data.phone || null;
        const shippingMethods = data.shippingMethods || data.shipping_methods || null;
        const businessType = data.businessType || data.business_type || null;
        const invoiceEmail = data.invoiceEmail || data.invoice_email || null;
        const taxCode = data.taxCode || data.tax_code || null;
        const identityType = data.identityType || data.identity_type || null;
        const identityNumber = data.identityNumber || data.identity_number || null;
        const identityFullName = data.identityFullName || data.identity_full_name || null;
        
        const shippingMethodsJson = shippingMethods 
            ? (typeof shippingMethods === 'string' ? shippingMethods : JSON.stringify(shippingMethods))
            : null;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Bước 1: Cập nhật bảng `shop_info` (Giữ nguyên logic của bạn)
            const infoQuery = `
                UPDATE shop_info SET
                    shop_name = COALESCE(?, shop_name),
                    address = COALESCE(?, address),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    shipping_methods = COALESCE(?, shipping_methods),
                    business_type = COALESCE(?, business_type),
                    invoice_email = COALESCE(?, invoice_email),
                    tax_code = COALESCE(?, tax_code),
                    identity_type = COALESCE(?, identity_type),
                    identity_number = COALESCE(?, identity_number),
                    identity_full_name = COALESCE(?, identity_full_name)
                WHERE id = ?
            `;
            const infoValues = [
                shopName, address, email, phone,
                shippingMethodsJson,
                businessType, invoiceEmail, taxCode,
                identityType, identityNumber, identityFullName,
                shopInfoId // shopId này là 'id' của bảng `shop_info`
            ];
            await connection.execute(infoQuery, infoValues);

            // Bước 2: Lấy `user_id` (ownerId) từ bảng `shop_info`
            const [infoRows]: any = await connection.execute('SELECT user_id FROM shop_info WHERE id = ?', [shopInfoId]);
            if (!infoRows || infoRows.length === 0) {
                throw new Error("Không tìm thấy shop info để cập nhật.");
            }
            const ownerId = infoRows[0].user_id;

            // Bước 3: Cập nhật bảng `shops` (nếu có tên shop mới)
            if (shopName) {
                const shopQuery = `
                    UPDATE shops SET
                        name = COALESCE(?, name)
                    WHERE owner_id = ?
                `;
                await connection.execute(shopQuery, [shopName, ownerId]);
            }
            
            await connection.commit();
            return { success: true, message: "Cập nhật shop thành công!" };

        } catch (error: any) {
            await connection.rollback();
            console.error('Update shop error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Tên shop này đã tồn tại.');
            }
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new ShopInfoService();