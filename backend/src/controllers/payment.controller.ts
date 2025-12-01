import axios from "axios";
import { Request, Response } from "express";
import { VNPay, consoleLogger } from 'vnpay';
import { HashAlgorithm, VnpLocale, ProductCode, VerifyReturnUrl, VerifyIpnCall } from 'vnpay';
import {
    IpnFailChecksum,
    IpnOrderNotFound,
    IpnInvalidAmount,
    InpOrderAlreadyConfirmed,
    IpnUnknownError,
    IpnSuccess,
} from 'vnpay';
import orderService from "../services/order.service";
class PaymentController {
    readonly vnpay = new VNPay({
        tmnCode: process.env.VNP_TMN_CODE!,
        secureSecret: process.env.VNP_HASH_SECRET!,
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
        enableLog: true,
    });

    createPayment_vnpay = async (req: Request, res: Response) => {
        try {
            const orderIds = (req as any).orderIds;
            
            const tmn_orderId = `${Date.now()}-${orderIds.join('-')}`;
            const total_amount = req.body.total;

            // Tạo URL      
            const paymentUrl = this.vnpay.buildPaymentUrl({
                vnp_Amount: total_amount,
                vnp_IpAddr:
                    req.headers['x-forwarded-for'] instanceof Array
                        ? req.headers['x-forwarded-for'][0]
                        : req.headers['x-forwarded-for'] ??
                        req.connection.remoteAddress ??
                        req.socket.remoteAddress ??
                        req.ip ?? '127.0.0.1',
                vnp_TxnRef: tmn_orderId,
                vnp_OrderInfo: `Thanh toan don hang ${tmn_orderId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: process.env.VNP_RETURN_URL!, // Đường dẫn nên là của frontend
                vnp_Locale: VnpLocale.VN,
            });

            return res.json({
                success: true,
                paymentUrl
            });
        } catch (error) {
            console.log(error);
            
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo URL thanh toán',
            });
        }
    };

    // createPayment_momo = async (req: Request, res: Response) => {
    //     const order = {
    //         id: `ORDER_TESTING_${Date.now()}`,
    //         user_id: (req as any).user.id,
    //         amount: (req as any).body.total,
    //     }

    //     const partnerCode = process.env.MOMO_PARTNER_CODE!;
    //     const accessKey = process.env.MOMO_ACCESS_KEY!;

    //     const secretkey = process.env.MOMO_SECRET_KEY!;
    //     const requestId = partnerCode + new Date().getTime();
    //     const orderId = order.id;
    //     const orderInfo = `Thanh toan don hang ${orderId}`;
    //     const returnUrl = process.env.MOMO_RETURN_URL!;
    //     const ipnUrl = process.env.MOMO_IPN_URL!;

    //     const amount = order.amount;
    //     const requestType = "payWithMethod"
    //     const extraData = ""; //pass empty value if your merchant does not have stores

    //     //before sign HMAC SHA256 with format
    //     //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&returnUrl=$returnUrl&requestId=$requestId&requestType=$requestType
    //     const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + returnUrl + "&requestId=" + requestId + "&requestType=" + requestType
    //     //puts raw signature
    //     console.log("--------------------RAW SIGNATURE----------------")
    //     console.log(rawSignature)
    //     //signature
    //     const crypto = require('crypto');
    //     const signature = crypto.createHmac('sha256', secretkey)
    //         .update(rawSignature)
    //         .digest('hex');
    //     console.log("--------------------SIGNATURE----------------")
    //     console.log(signature)

    //     //json object send to MoMo endpoint
    //     const requestBody = JSON.stringify({
    //         partnerCode: partnerCode,
    //         accessKey: accessKey,
    //         requestId: requestId,
    //         amount: amount,
    //         orderId: orderId,
    //         orderInfo: orderInfo,
    //         redirectUrl: returnUrl,
    //         ipnUrl: ipnUrl,
    //         extraData: extraData,
    //         requestType: requestType,
    //         signature: signature,
    //         lang: 'vi'
    //     });


    //     try {
    //         const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });

    //         const paymentUrl = (response as any).data.payUrl;
    //         return res.status(201).json({
    //             success: true,
    //             paymentUrl,
    //             order,
    //         });
    //     } catch (error) {
    //         console.log(`Prolem with request: ${(error as any).message}`);
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Lỗi khi tạo URL thanh toán',
    //         });
    //     }
    // };

    handleIpn_vnpay = async (req, res) => {
        try {
            const verify: VerifyIpnCall = this.vnpay.verifyIpnCall(req.query,  {
                logger: {
                    type: 'all',
                    loggerFn: consoleLogger,
                },
            },);
            
            if(!verify.isVerified) {
                return res.json(IpnFailChecksum);
            }

            if (!verify.isSuccess) {
                return res.json(IpnUnknownError);
            }
            const orderIds = verify.vnp_TxnRef.split('-').slice(1);
            orderIds.forEach((orderId) => {
                orderService.updateOrderPaymentStatus(orderId, `Paid`);
            });
            // Sau đó cập nhật trạng thái trở lại cho VNPay để họ biết đã xác nhận đơn hàng
            return res.json(IpnSuccess);
        } catch (error) {
         console.log(`verify error: ${error}`);
         return res.json(IpnUnknownError);
     }
    }

    createOrder = async (req, res, next) => {
        try {
            const userId = (req as any).user.id;
            const groupedCarts = req.body.groupedCart;
            const shippingFees = req.body.shippingFees;
            const selectedAddress = req.body.selectedAddress;
            const opts = {
                address_id: selectedAddress.id,
                payment_method: req.body.paymentMethod,
                notes: null
            };
    
            const shopOrders = this.orderFormat(groupedCarts, shippingFees);
            const orderIds = await orderService.addOrders(userId, shopOrders, opts);
            console.log(orderIds);
            
            req.orderIds = orderIds;
            
            return next();
        } catch (error) {
            if(error && (error as any).status === 409) {
                console.error("paymentController: insufficient: " + JSON.stringify((error as any).details, null, 2));
                return res.status(409).json({
                    success: false,
                    message: (error as any).message || 'Insufficient stock',
                    details: (error as any).details
                });
            }

            console.error(`createOrder middleware error: `, error);
            return res.status((error as any).status || 500).json({
                success: false,
                message: (error as any).message || 'Internal server error'
            });
        }
    };

    orderFormat = (groupedCart: any[], shippingFees: any) => {
        return groupedCart.map(group => ({
            shop_id: group.shop_id,
            shipping_fee: shippingFees[group.shop_id],
            total_amount: group.items.reduce((acc, item) => {
                acc += Number(item.sale_price ?? item.original_price) * Number(item.quantity);
                return acc;
            }, 0),
            items: group.items.map((item) => ({
                product_id: item.product_id,
                variant_id: item.product_variant_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price_at_purchase: item.sale_price ?? item.original_price,
            })),
        }));
    };
}

export default new PaymentController();