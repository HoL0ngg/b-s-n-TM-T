export default function Purchase() {
    return (
        <div>
            <h5 className="mb-4">Đơn hàng của tôi</h5>

            {/* Ví dụ danh sách đơn hàng */}
            <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Đơn hàng #12345</strong> <br />
                        <small className="text-muted">Ngày đặt: 01/10/2025</small>
                    </div>
                    <span className="badge bg-warning text-dark">Đang xử lý</span>
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Đơn hàng #12344</strong> <br />
                        <small className="text-muted">Ngày đặt: 20/09/2025</small>
                    </div>
                    <span className="badge bg-success">Hoàn thành</span>
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Đơn hàng #12343</strong> <br />
                        <small className="text-muted">Ngày đặt: 15/09/2025</small>
                    </div>
                    <span className="badge bg-danger">Đã hủy</span>
                </div>
            </div>
        </div>
    );
}
