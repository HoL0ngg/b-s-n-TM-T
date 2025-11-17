// backend/src/services/shop.info.service.ts
import pool from "../config/db";

class ShopInfoService {
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

  public getShopByShopId = async (shopId: string | number): Promise<any> => {
    const query = 'SELECT * FROM shop_info WHERE shop_id = ? LIMIT 1';
    
    try {
      const [rows]: any = await pool.execute(query, [shopId]);
      return rows && rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getShopByShopId service:', error);
      throw error;
    }
  }

  // ✅ GIỮ NGUYÊN shop_id - để liên kết với bảng shops
  public createShop = async (data: any, userId: number): Promise<any> => {
    const {
      shop_id,  // ← BẮT BUỘC - FK tới bảng shops
      address, 
      email, 
      phone,
      shipping_methods,
      business_type, 
      invoice_email, 
      tax_code,
      identity_type, 
      identity_number, 
      identity_full_name
    } = data;
    
    // ✅ Validate shop_id
    if (!shop_id) {
      throw new Error('shop_id is required (must reference shops table)');
    }

    const shippingMethodsJson = typeof shipping_methods === 'string' 
      ? shipping_methods 
      : JSON.stringify(shipping_methods || []);

    // ✅ id tự tăng, shop_id là FK
    const query = `
      INSERT INTO shop_info (
        shop_id, user_id, address, email, phone,
        shipping_methods,
        business_type, invoice_email, tax_code,
        identity_type, identity_number, identity_full_name,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
      shop_id,  // ← FK tới shops.id
      userId, 
      address, 
      email, 
      phone,
      shippingMethodsJson,
      business_type, 
      invoice_email, 
      tax_code,
      identity_type, 
      identity_number, 
      identity_full_name
    ];

    console.log('📝 Creating shop_info with values:', values);

    try {
      const [result]: any = await pool.execute(query, values);
      
      return {
        id: result.insertId,  // ← PK của shop_info
        shop_id,              // ← FK tới shops
        user_id: userId,
        ...data
      };
      
    } catch (error: any) {
      console.error('❌ Error in createShop service:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('shop_id')) {
          throw new Error('Shop này đã có thông tin chi tiết rồi.');
        }
        if (error.message.includes('user_id')) {
          throw new Error('User này đã đăng ký shop rồi.');
        }
      }
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('shop_id không tồn tại trong bảng shops.');
      }
      
      throw error; 
    }
  }

  public updateShop = async (shopId: number, data: any): Promise<any> => {
    const address = data.address || null;
    const email = data.email || null;
    const phone = data.phone || null;
    const shippingMethods = data.shipping_methods || data.shippingMethods || null;
    const businessType = data.business_type || data.businessType || null;
    const invoiceEmail = data.invoice_email || data.invoiceEmail || null;
    const taxCode = data.tax_code || data.taxCode || null;
    const identityType = data.identity_type || data.identityType || null;
    const identityNumber = data.identity_number || data.identityNumber || null;
    const identityFullName = data.identity_full_name || data.identityFullName || null;
    
    const shippingMethodsJson = shippingMethods 
      ? (typeof shippingMethods === 'string' ? shippingMethods : JSON.stringify(shippingMethods))
      : null;

    const query = `
      UPDATE shop_info SET
        address = COALESCE(?, address),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        shipping_methods = COALESCE(?, shipping_methods),
        business_type = COALESCE(?, business_type),
        invoice_email = COALESCE(?, invoice_email),
        tax_code = COALESCE(?, tax_code),
        identity_type = COALESCE(?, identity_type),
        identity_number = COALESCE(?, identity_number),
        identity_full_name = COALESCE(?, identity_full_name),
        updated_at = NOW()
      WHERE shop_id = ?
    `;
    
    const values = [
      address, email, phone,
      shippingMethodsJson,
      businessType, invoiceEmail, taxCode,
      identityType, identityNumber, identityFullName,
      shopId
    ];

    try {
      const [result]: any = await pool.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Shop không tồn tại');
      }
      
      return result;
    } catch (error: any) {
      console.error('Update shop error:', error);
      throw error;
    }
  }

  // ✅ Delete shop info
  public deleteShop = async (shopId: number): Promise<any> => {
    const query = 'DELETE FROM shop_info WHERE shop_id = ?';
    
    try {
      const [result]: any = await pool.execute(query, [shopId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Shop không tồn tại');
      }
      
      return result;
    } catch (error: any) {
      console.error('Delete shop error:', error);
      throw error;
    }
  }
}

export default new ShopInfoService();