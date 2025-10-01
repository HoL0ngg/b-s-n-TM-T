import { Outlet } from "react-router-dom";

export default function AccountLayout() {
    return (
        <div className="container py-4">
            <div className="row">
                {/* Nội dung chính */}
                <section className="col-md-9">
                    <Outlet />
                </section>
                <section className="col-md-3 border-start">
                    <div className="container">
                        <div className="text-center">
                            <img
                                src="https://via.placeholder.com/80"
                                alt="User Avatar"
                                className="rounded-circle mb-2"
                            />
                            <div className="mb-0 btn btn-primary">Chọn ảnh</div>
                            <br />
                            <small className="text-muted">Dung lượng file tối đa 1MB</small>
                            <br />
                            <small className="text-muted">Định dạng: .JPEG, .PNG</small>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
