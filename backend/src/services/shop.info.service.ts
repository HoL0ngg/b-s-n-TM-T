// backend/src/services/shop.info.ts
import pool from "../config/db";

class ShopInfoService {
  // Thay đổi kiểu dữ liệu cho linh hoạt hơn
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
  public createShop = async (data: any, userId: number): Promise<any> => {
    const {
      shopName, address, email, phone,
      shippingMethods,
      businessType, invoiceEmail, taxCode,
      identityType, identityNumber, identityFullName
    } = data;
    
    const shippingMethodsJson = JSON.stringify(shippingMethods || []);

    const query = `
      INSERT INTO shop_info (
        user_id, shop_name, address, email, phone,
        shipping_methods,
        business_type, invoice_email, tax_code,
        identity_type, identity_number, identity_full_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 'userId' (kiểu number) sẽ được chèn vào cột 'user_id' (kiểu VARCHAR)
    // MySQL sẽ tự động chuyển đổi nó thành string.
    const values = [
      userId, 
      shopName, address, email, phone,
      shippingMethodsJson,
      businessType, invoiceEmail, taxCode,
      identityType, identityNumber, identityFullName
    ];

    try {
      const [result] = await pool.execute(query, values);
      return result; 
      
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('shop_name_unique')) {
          throw new Error('Tên shop này đã tồn tại.');
        }
        if (error.message.includes('user_id_unique')) {
          throw new Error('Số điện thoại này đã đăng ký shop.');
        }
      }
      throw error; 
    }
  }
  public updateShop = async (shopId: number, data: any): Promise<any> => {
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

    const query = `
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
    
    const values = [
      shopName, address, email, phone,
      shippingMethodsJson,
      businessType, invoiceEmail, taxCode,
      identityType, identityNumber, identityFullName,
      shopId
    ];

    // Log để debug
    console.log('Update values:', values);
    console.log('Values with undefined:', values.map((v, i) => v === undefined ? `Index ${i} is undefined` : null).filter(Boolean));

    try {
      const [result] = await pool.execute(query, values);
      return result;
    } catch (error: any) {
      console.error('Update shop error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Tên shop này đã tồn tại.');
      }
      throw error;
    }
  }
}


export default new ShopInfoService();