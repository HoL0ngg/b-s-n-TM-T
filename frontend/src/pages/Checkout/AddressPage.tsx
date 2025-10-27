import { GrRadialSelected } from "react-icons/gr";
import { MdOutlineNavigateNext } from "react-icons/md";
import { FaCcMastercard } from "react-icons/fa";

export const AddressPage = () => {

    return (
        <div className="container p-4">
            <div className="row gx-5">
                <div className="col-7">
                    <div className="">
                        <div className="mb-2 fs-4 ms-2">Chọn địa chỉ giao hàng</div>
                        <div className="bg-light border rounded p-2">
                            <div className="d-flex align-items-center gap-3 p-2">
                                <div>
                                    <GrRadialSelected className="text-primary ms-4" />
                                </div>
                                <div>
                                    <div className="fw-bolder">L0ngkute (0937211264)</div>
                                    <div className="text-muted">273 An Dương Vương phường Chợ Quán TP. Hồ Chí Minh</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 border-top p-2">
                                <div>
                                    <MdOutlineNavigateNext className="text-primary ms-4" />
                                </div>
                                <div>
                                    Chọn địa chỉ khác đê
                                </div>
                            </div>
                        </div>
                        <div className="ms-2 fs-4 mt-4 mb-2">Chọn phương thức thanh toán</div>
                        <div className="bg-light border rounded p-2">
                            <div className="d-flex align-items-center gap-3 p-2">
                                <div>
                                    <FaCcMastercard className="text-primary ms-4 fs-3" />
                                </div>
                                <div>
                                    <div className="fw-bolder">L0ngkute (0937211264)</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 border-top p-2">
                                <div>
                                    <img src="/assets/momo.png" alt="" style={{ height: '30px', width: '30px' }} className="ms-4" />
                                </div>
                                <div>
                                    Chọn mono đê
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 border-top p-2">
                                <div>
                                    <img src="/assets/vnpay.svg" alt="" style={{ height: '30px', width: '30px' }} className="ms-4" />
                                </div>
                                <div>
                                    Chọn vnpay đê
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-5">
                    <div className="fs-4 ms-2 mb-2">Chi tiết đơn hàng</div>
                    <div className="bg-light p-2 rounded border">
                        hihi
                    </div>

                    <div className="fs-4 ms-2 mb-2 mt-4">Chi tiết hóa đơn</div>
                    <div className="bg-light p-2 rounded border">
                        hehe
                    </div>
                </div>
            </div>
        </div>
    );
}