export default function Profile() {
    return (
        <div>
            <h5 className="mb-4">Thông tin cá nhân</h5>
            <form>
                <div className="mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input type="text" className="form-control" placeholder="Nguyễn Văn A" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="email@example.com" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="form-control" placeholder="0123456789" />
                </div>
                <button type="submit" className="btn btn-primary">
                    Cập nhật
                </button>
            </form>
        </div>
    );
}
