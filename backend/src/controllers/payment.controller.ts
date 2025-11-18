import axios from "axios";
import { Request, Response } from "express";
import { VNPay } from 'vnpay';
import { HashAlgorithm, VnpLocale, ProductCode, VerifyReturnUrl } from 'vnpay';

class PaymentController {
    createPayment_vnpay = async (req: Request, res: Response) => {
        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE!,
            secureSecret: process.env.VNP_HASH_SECRET!,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            enableLog: true,
        });

        try {
            const order = {
                id: `ORDER_TESTING_${Date.now()}`,
                user_id: (req as any).user.id,
                amount: (req as any).body.total,
            }
            // Tạo URL      
            const paymentUrl = vnpay.buildPaymentUrl({
                vnp_Amount: order.amount,
                vnp_IpAddr:
                    req.headers['x-forwarded-for'] instanceof Array
                        ? req.headers['x-forwarded-for'][0]
                        : req.headers['x-forwarded-for'] ??
                        req.connection.remoteAddress ??
                        req.socket.remoteAddress ??
                        req.ip ?? '127.0.0.1',
                vnp_TxnRef: order.id,
                vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: process.env.VNP_RETURN_URL!, // Đường dẫn nên là của frontend
                vnp_Locale: VnpLocale.VN,
            });

            return res.json({
                success: true,
                paymentUrl,
                order,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo URL thanh toán',
            });
        }
    };

    createPayment_momo = async (req: Request, res: Response) => {
        const order = {
            id: `ORDER_TESTING_${Date.now()}`,
            user_id: (req as any).user.id,
            amount: (req as any).body.total,
        }

        const partnerCode = process.env.MOMO_PARTNER_CODE!;
        const accessKey = process.env.MOMO_ACCESS_KEY!;

        const secretkey = process.env.MOMO_SECRET_KEY!;
        const requestId = partnerCode + new Date().getTime();
        const orderId = order.id;
        const orderInfo = `Thanh toan don hang ${orderId}`;
        const returnUrl = process.env.MOMO_RETURN_URL!;
        const ipnUrl = process.env.MOMO_IPN_URL!;

        const amount = order.amount;
        const requestType = "payWithMethod"
        const extraData = ""; //pass empty value if your merchant does not have stores

        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&returnUrl=$returnUrl&requestId=$requestId&requestType=$requestType
        const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + returnUrl + "&requestId=" + requestId + "&requestType=" + requestType
        //puts raw signature
        console.log("--------------------RAW SIGNATURE----------------")
        console.log(rawSignature)
        //signature
        const crypto = require('crypto');
        const signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        console.log("--------------------SIGNATURE----------------")
        console.log(signature)

        //json object send to MoMo endpoint
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: returnUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi'
        });


        try {
            const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const paymentUrl = (response as any).data.payUrl;
            return res.status(201).json({
                success: true,
                paymentUrl,
                order,
            });
        } catch (error) {
            console.log(`Prolem with request: ${(error as any).message}`);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo URL thanh toán',
            });
        }
    };
}

export default new PaymentController();