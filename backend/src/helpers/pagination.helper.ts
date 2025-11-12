import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import type { Product, ProductResponse } from "../models/product.model";

export const paginationProducts = async (whereClause: string,
    params: any[],
    page: number = 1,
    limit: number = 12,
    orderBy: string = ""
): Promise<ProductResponse> => {
    const offset = (page - 1) * limit;
    const countSql = `
        SELECT COUNT(*) AS totalRows 
        FROM v_products_list 
        ${whereClause}
    `;

    type TotalCount = { totalRows: number };
    const [countRows] = await pool.query<TotalCount[] & RowDataPacket[]>(countSql, params);
    const totalRows = countRows[0].totalRows;
    const totalPages = Math.ceil(totalRows / limit);

    const dataSql = `
        SELECT * FROM v_products_list
        ${whereClause}
        ${orderBy}
        LIMIT ? 
        OFFSET ?
        `;
    // JOIN shops ON v_products_list.shop_id = shops.id

    const finalParams = [...params, limit, offset];

    const [rows] = await pool.query<Product[] & RowDataPacket[]>(dataSql, finalParams);

    return { products: rows as Product[], totalPages };
}