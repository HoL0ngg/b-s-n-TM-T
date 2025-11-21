import { Request, Response } from 'express';
import { calculateShippingFee } from '../services/shipping.service';
import shopService from '../services/shop.service';

const WAREHOUSE_ADDRESS = process.env.WAREHOUSE_ADDRESS;

class ShippingController {

    async calculateFee(req: Request, res: Response) {
        try {
            const { street, shop_id } = req.body;

            const another_street = await shopService.getShopStreetAddress(shop_id);

            const feeData = await calculateShippingFee(another_street, street);

            res.json(feeData); // Ví dụ: { distanceKm: "10.5", shippingFee: 53000 }

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ShippingController();