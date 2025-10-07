import { useState } from "react";
import CreditCardModel from "../../../components/CreditCardModel";

export default function Bank() {
    const [isShow, setIsShow] = useState(false);
    return (
        <>
            <CreditCardModel isShow={isShow} onClose={() => setIsShow(false)} />
            <div className="border-bottom p-2 pb-3">
                <h5 className="m-0">Thông tin thẻ / ngân hàng</h5>
                <small className="text-muted">Quản lý thông tin tài khoản thẻ và tài khoản ngân hàng</small>
            </div>
            <div id="credit-container" className="container">
                <div className="d-flex justify-content-between mt-4 pb-2 border-bottom">
                    <div className="fs-4">
                        Thẻ tín dụng của bạn
                    </div>
                    <div className="btn btn-primary" onClick={() => setIsShow(true)}>+ Thêm thẻ tín dụng</div>
                </div>
                <div className="text-center" style={{ height: "160px" }}>
                    {/* <i className="fa-regular fa-circle-xmark text-primary fs-2 mt-4"></i>
                    <p className="text-muted fs-5">Bạn chưa có thẻ tín dụng</p> */}
                    <div className="d-flex gap-2">
                        <div className="card p-2 m-2">
                            <div className="card-center">Chưa có ý tưởng làm cái này lắm</div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="bank-container" className="container">
                <div className="d-flex justify-content-between mt-4 pb-2 border-bottom">
                    <div className="fs-4">
                        Tài khoản ngân hàng của bạn
                    </div>
                    <div className="btn btn-primary">+ Thêm tài khoản ngân hàng</div>
                </div>
                <div className="text-center" style={{ height: "160px" }}>
                    <i className="fa-regular fa-circle-xmark text-primary fs-2 mt-4"></i>
                    <p className="text-muted fs-5">Bạn chưa có tài khoản ngân hàng</p>
                </div>
            </div>
        </ >
    );
}
