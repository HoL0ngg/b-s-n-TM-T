export default function Address() {
    return (
        <div>
            <h5 className="mb-4">Địa chỉ giao hàng</h5>

            <div className="mb-3">
                <label className="form-label">Tên người nhận</label>
                <input type="text" className="form-control" placeholder="Nguyễn Văn B" />
            </div>
            <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input type="text" className="form-control" placeholder="0987654321" />
            </div>
            <div className="mb-3">
                <label className="form-label">Địa chỉ chi tiết</label>
                <textarea className="form-control" rows={3} placeholder="123 Đường ABC, Quận 1, TP.HCM"></textarea>
            </div>

            <button className="btn btn-success">Lưu địa chỉ</button>
        </div>
    );
}
