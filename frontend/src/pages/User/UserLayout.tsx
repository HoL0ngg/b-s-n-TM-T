import { Outlet, NavLink, useLocation } from "react-router-dom";

export default function UserLayout() {
    const location = useLocation();

    // Kiểm tra nếu đường dẫn bắt đầu bằng /account thì mở submenu
    const isAccountPage = location.pathname.startsWith("/user/account");
    return (
        <div className="container py-4">
            <div className="row">
                {/* Sidebar trái */}
                <aside className="col-md-3 mb-3">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            {/* Avatar user */}
                            <img
                                src="https://via.placeholder.com/80"
                                alt="User Avatar"
                                className="rounded-circle mb-2"
                            />
                            <h6 className="mb-0">Xin chào, User</h6>
                            <small className="text-muted">Tài khoản của tôi</small>
                        </div>
                    </div>

                    <div className="list-group mt-3">
                        {/* Tài khoản của tôi */}
                        <NavLink
                            to="account"
                            className={({ isActive }) =>
                                `list-group-item list-group-item-action ${isActive ? "text-primary" : ""}`
                            }
                        >
                            Tài khoản của tôi
                        </NavLink>

                        {/* Submenu chỉ hiện khi ở /account */}
                        {isAccountPage && (
                            <div className="ms-3">
                                <NavLink
                                    to="account/profile"
                                    className={({ isActive }) =>
                                        `list-group-item list-group-item-action ${isActive ? "text-primary" : ""}`
                                    }
                                >
                                    Hồ sơ
                                </NavLink>
                                <NavLink
                                    to="account/address"
                                    className={({ isActive }) =>
                                        `list-group-item list-group-item-action ${isActive ? "text-primary" : ""}`
                                    }
                                >
                                    Địa chỉ
                                </NavLink>
                            </div>
                        )}

                        {/* Đơn mua */}
                        <NavLink
                            to="purchase"
                            className={({ isActive }) =>
                                `list-group-item list-group-item-action ${isActive ? "text-primary" : ""}`
                            }
                        >
                            Đơn mua
                        </NavLink>
                    </div>
                </aside>

                {/* Nội dung bên phải */}
                <section className="col-md-9">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <Outlet />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
