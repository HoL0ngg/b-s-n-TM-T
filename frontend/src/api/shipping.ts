import api from "./api";

export const calculateShippingFee = async (destinationAddress: string, shop_id: number): Promise<number> => {
    const res = await api.post("/shipping", {
        street: destinationAddress,
        shop_id: shop_id
    });
    console.log(res.data);

    return res.data.shippingFee;
}