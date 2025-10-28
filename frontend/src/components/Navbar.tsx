import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const totalItemCount = useMemo(() => {
        // 'cart' là mảng các shop [shop1, shop2, ...]

        // Dùng reduce để "gom" mảng shop lại thành 1 con số
        return cart.reduce((total, shop) => {
            // total: tổng số lượng hiện tại
            // shop: shop hiện tại đang lặp qua

            // Lấy số lượng item CỦA RIÊNG shop này
            const shopItemCount = shop.items.length;

            // Cộng dồn vào tổng
            return total + shopItemCount;

        }, 0); // Bắt đầu đếm từ 0

    }, [cart]); // Phụ thuộc vào 'cart'

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            logout();
            navigate("/");
            setLoading(false);
        }, 1000)
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img src={'/assets/avatar/logo.jpg'} alt="" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                    </Link>

                    <form className="d-flex mx-auto" style={{ maxWidth: "600px", width: "100%", position: "relative", height: '46px' }}>
                        <input
                            className="form-control me-2 shadow"
                            placeholder="Tìm sản phẩm..."
                            aria-label="Search"
                            style={{ borderRadius: '24px' }}
                        />
                        <i className="fa-solid fa-magnifying-glass bg-primary p-2 rounded-circle align-middle" style={{ position: "absolute", right: "14px", top: "50%", translate: "0 -50%", color: 'white' }}></i>

                    </form>
                    <ul className="navbar-nav gap-2">
                        <li>
                            <Link to="/shop" className="nav-link">
                                <i className="fa-solid fa-shop text-primary fs-5"></i>
                            </Link>
                        </li>
                        {user && (<li className="d-flex align-items-center">
                            adu chafo {user.id}
                        </li>)}
                        <li className="position-relative"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}>
                            <Link to="/login" className="nav-link">
                                <i className="fa-regular fa-user text-primary fs-5"></i>
                                {/* <i className="fa-regular fa-user fa-lg text-primary nav-link fs-5" style={{ cursor: "pointer" }}></i> */}
                                {isHovered && user && (
                                    <div
                                        className="position-absolute bg-white shadow rounded"
                                        style={{
                                            top: "100%",
                                            right: 0,
                                            zIndex: 1000,
                                            padding: "10px",
                                            cursor: "pointer",
                                            width: "100px"
                                        }}
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </div>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link to="/register-shop" className="nav-link">
                                <i className="fa-regular fa-heart text-primary fs-5"></i>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cart" className="nav-link">
                                <i className="fa-solid fa-cart-shopping text-primary fs-5 position-relative">
                                    <span className="position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger">{totalItemCount > 0 && <span>{totalItemCount}</span>}</span>
                                </i>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
            {loading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </>
    );
}
