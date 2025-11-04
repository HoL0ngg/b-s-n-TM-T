import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

// FIX: Sửa URL API cho đúng với backend route
const checkShopExists = async (userId: string): Promise<boolean> => {
    try {
        // Đổi từ /api/shopinfo sang /api/shop_info
        const response = await fetch(`http://localhost:5000/api/shop_info/user/${userId}`);
        if (response.ok) {
            const data = await response.json();
            // Kiểm tra data có tồn tại và có id không
            return data !== null && data.id !== undefined;
        }
        return false;
    } catch (error) {
        console.error("Error checking shop:", error);
        return false;
    }
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [hasShop, setHasShop] = useState(false);
    const [checkingShop, setCheckingShop] = useState(false);

    const totalItemCount = useMemo(() => {
        return cart.reduce((total, shop) => {
            const shopItemCount = shop.items.length;
            return total + shopItemCount;
        }, 0); 
    }, [cart]);

    // Kiểm tra xem user đã có shop chưa
    useEffect(() => {
        const checkUserShop = async () => {
            if (user && user.id) {
                setCheckingShop(true);
                try {
                    const shopExists = await checkShopExists(user.id.toString());
                    setHasShop(shopExists);
                    console.log("Shop exists:", shopExists); // Debug log
                } catch (error) {
                    console.error("Error in checkUserShop:", error);
                    setHasShop(false);
                } finally {
                    setCheckingShop(false);
                }
            } else {
                setHasShop(false);
            }
        };

        checkUserShop();
    }, [user]);

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            logout();
            navigate("/");
            setLoading(false);
        }, 1000);
    };

    const handleShopNavigation = async () => {
        // Re-check shop status trước khi navigate
        if (user && user.id) {
            setCheckingShop(true);
            const shopExists = await checkShopExists(user.id.toString());
            setHasShop(shopExists);
            setCheckingShop(false);
            
            if (shopExists) {
                navigate("/seller");
            } else {
                navigate("/register-shop");
            }
        } else {
            navigate("/login");
        }
    };

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

                    <ul className="navbar-nav gap-2 align-items-center">
                        <li className="d-flex align-items-center">
                            <Link to="/shop" className="nav-link d-flex align-items-center" title="Xem Shop">
                                <i className="fa-solid fa-shop text-primary fs-5"></i>
                            </Link>
                        </li>

                        {/* Icon Quản lý Shop / Đăng ký Shop */}
                        {user && (
                            <li className="d-flex align-items-center">
                                <button 
                                    onClick={handleShopNavigation}
                                    className="nav-link btn btn-link p-0 border-0 d-flex align-items-center"
                                    style={{ textDecoration: 'none' }}
                                    title={hasShop ? "Kênh Người Bán" : "Đăng ký trở thành Người bán"}
                                    disabled={checkingShop}
                                >
                                    {checkingShop ? (
                                        <i className="fa-solid fa-spinner fa-spin text-primary fs-5"></i>
                                    ) : (
                                        <i className="fa-solid fa-store text-primary fs-5"></i>
                                    )}
                                </button>
                            </li>
                        )}

                        {user && (
                            <li className="d-flex align-items-center">
                                <small className="text-muted" style={{ whiteSpace: 'nowrap' }}>ID: {user.id}</small>
                            </li>
                        )}

                        <li className="position-relative d-flex align-items-center"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}>
                            <Link to={user ? "/user/account" : "/login"} className="nav-link d-flex align-items-center">
                                <i className="fa-regular fa-user text-primary fs-5"></i>
                                {isHovered && user && (
                                    <div
                                        className="position-absolute bg-white shadow rounded"
                                        style={{
                                            top: "100%",
                                            right: 0,
                                            zIndex: 1000,
                                            padding: "10px",
                                            cursor: "pointer",
                                            minWidth: "120px",
                                        }}
                                        onClick={handleLogout}
                                    >
                                        <i className="fa-solid fa-right-from-bracket me-2"></i>
                                        Đăng xuất
                                    </div>
                                )}
                            </Link>
                        </li>

                        <li className="d-flex align-items-center">
                            <Link to="/cart" className="nav-link d-flex align-items-center">
                                <i className="fa-solid fa-cart-shopping text-primary fs-5 position-relative">
                                    {totalItemCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger">
                                            {totalItemCount}
                                        </span>
                                    )}
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