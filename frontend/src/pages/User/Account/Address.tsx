import { useState } from "react";
import AddressModal from "../../../components/AddressModel";

export default function Address() {
    const [isShow, setIsShow] = useState(false);

    return (
        <div>
            <AddressModal isShow={isShow} onClose={() => setIsShow(false)} />
            <div className="d-flex justify-content-between text-center border-bottom border-2">
                <h5 className="mt-2 ms-2">Địa chỉ của tôi</h5>
                <div className="btn btn-primary mb-3" onClick={() => setIsShow(true)}>+ Thêm địa chỉ mới</div>
            </div>
            <p className="m-2 fs-2">Địa chỉ</p>
            <div className="mb-4 ms-2">
                <div className="d-flex justify-content-between">
                    <div>
                        <span className="border-end pe-2 border-2">Longkute</span>
                        <span className="ms-2 text-muted">(+84)937211264</span>
                    </div>
                    <div>
                        <a href="#" className="text-decoration-none p-2">Cập nhật</a>
                    </div>
                </div>
                <div className="d-flex justify-content-between mt-1">
                    <div>
                        <div className="ms-2">xxx An Dương Vương</div>
                        <div className="ms-2 text-muted">phường Chợ Quán, TP. Hồ Chí Minh</div>
                    </div>
                    <div>
                        <div className="border p-2 fs-6 cursor-pointer" style={{ cursor: "pointer" }}>Thiệt lập mặc định</div>
                    </div>
                </div>
            </div>
            <div className="mb-4 ms-2 pt-3 border-top border-2">
                <div className="d-flex justify-content-between">
                    <div>
                        <span className="border-end pe-2 border-2">Longkute</span>
                        <span className="ms-2 text-muted">(+84)937211264</span>
                    </div>
                    <div>
                        <a href="#" className="text-decoration-none p-2">Cập nhật</a>
                    </div>
                </div>
                <div className="d-flex justify-content-between mt-1">
                    <div>
                        <div className="ms-2">xxx An Dương Vương</div>
                        <div className="ms-2 text-muted">phường Chợ Quán, TP. Hồ Chí Minh</div>
                    </div>
                    <div>
                        <div className="border p-2 fs-6 cursor-pointer" style={{ cursor: "pointer" }}>Thiệt lập mặc định</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
