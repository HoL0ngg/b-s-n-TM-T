export default function Bank() {
    return (
        <>
            <div className="border-bottom p-2 pb-3">
                <h5 className="m-0">Thông tin thẻ / ngân hàng</h5>
                <small className="text-muted">Quản lý thông tin tài khoản thẻ và tài khoản ngân hàng</small>
            </div>
            <div id="credit-container" className="container">
                <div className="d-flex justify-content-between mt-4 pb-2 border-bottom">
                    <div className="fs-4">
                        Thẻ tín dụng của bạn
                    </div>
                    <div className="btn btn-primary">+ Thêm thẻ tín dụng</div>
                </div>
                <div className="">

                </div>
            </div>
            <div id="bank-container" className="container">
                <div className="d-flex justify-content-between mt-4 pb-2 border-bottom">
                    <div className="fs-4">
                        Thẻ tín dụng của bạn
                    </div>
                    <div className="btn btn-primary">+ Thêm tài khoản ngân hàng</div>
                </div>
            </div>
        </ >
    );
}
