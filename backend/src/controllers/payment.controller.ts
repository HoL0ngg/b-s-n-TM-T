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
            /*
                Tạo mới đơn hàng
                *** Chưa xử lý ***
                const order = await createOrder(req.body)
            */
            const order = {
                id: `ORDER_TESTING_${Date.now()}`,
                user_id: (req as any).user.id,
                amount: (req as any).body.total,
            }
            // Tạo URL      
            const paymentUrl = this.vnpay.buildPaymentUrl({
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

            /*
                Tìm đơn hàng trong cơ sở dữ liệu
                *** Chưa xử lý ***
                const foundOrder = await findOrderById(verify.vnp_TxnRef);
            */

            const foundOrder = {
                orderId: "nah",
                amount: 0,
                status: "pending"
            }
            // Nếu không tìm thấy đơn hàng hoặc mã đơn hàng không khớp
            if (!foundOrder || verify.vnp_TxnRef !== foundOrder.orderId) {
                return res.json(IpnOrderNotFound);
            }

            // Nếu số tiền thanh toán không khớp
            if (verify.vnp_Amount !== foundOrder.amount) {
                return res.json(IpnInvalidAmount);
            }

            // Nếu đơn hàng đã được xác nhận trước đó
            if (foundOrder.status === 'completed') {
                return res.json(InpOrderAlreadyConfirmed);
            }

            /*
                Cập nhật trạng thái đơn hàng
            */
            foundOrder.status = 'completed';
            /*
                Cập nhật đơn hàng lên database
                *** Chưa xử lý ***
                await updateOrder(foundOrder); 
            */

            // Sau đó cập nhật trạng thái trở lại cho VNPay để họ biết đã xác nhận đơn hàng
            return res.json(IpnSuccess);
        } catch (error) {
         console.log(`verify error: ${error}`);
         return res.json(IpnUnknownError);
     }
    }
}

export default new PaymentController();