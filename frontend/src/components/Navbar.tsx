import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { fetchProductsByKeyWord } from "../api/products";
import debounce from "lodash.debounce";
import type { ProductType } from "../types/ProductType";

// FIX: Sửa URL API cho đúng với backend route
const checkShopExists = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`http://localhost:5000/api/shop_info/user/${userId}`);
        if (response.ok) {
            const data = await response.json();
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
    const [keyword, setKeyWord] = useState<string>("");
    const [products, setProducts] = useState<ProductType[]>([]);
    console.log(user);


    const totalItemCount = useMemo(() => {
        return cart.reduce((total, shop) => {
            const shopItemCount = shop.items.length;
            return total + shopItemCount;
        }, 0);
    }, [cart]);

    //  Kiểm tra user có shop không
    useEffect(() => {
        const checkUserShop = async () => {
            if (user && user.id) {
                setCheckingShop(true);
                try {
                    const shopExists = await checkShopExists(user.id.toString());
                    setHasShop(shopExists);
                    console.log("Shop exists:", shopExists);
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

    //  Hàm fetch và debounce tìm kiếm
    const fetchProducts = async (val: string) => {
        try {
            const res = await fetchProductsByKeyWord(val);
            setProducts(res);
        } catch (error) {
            console.log(error);
        }
    };

    const debouncedSearch = useMemo(
        () => debounce((value: string) => fetchProducts(value), 300),
        []
    );

    useEffect(() => {
        if (keyword.trim() !== "") {
            debouncedSearch(keyword);
        } else {
            setProducts([]);
        }
    }, [keyword, debouncedSearch]);

    const handleNavigateInfo = () => navigate("/user/account/profile");
    const handleNavigateOrder = () => navigate("/login");

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img
                            src={"/assets/avatar/logo.jpg"}
                            alt=""
                            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
                        />
                    </Link>

                    {/* 🔍 Thanh tìm kiếm */}
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="d-flex mx-auto"
                        style={{
                            maxWidth: "600px",
                            width: "100%",
                            position: "relative",
                            height: "46px",
                        }}
                    >
                        <input
                            className="form-control shadow"
                            placeholder="Tìm sản phẩm..."
                            aria-label="Search"
                            value={keyword}
                            onChange={(e) => setKeyWord(e.target.value)}
                        />
                        <i
                            className="fa-solid fa-magnifying-glass bg-primary p-2 rounded-circle align-middle"
                            style={{
                                position: "absolute",
                                right: "14px",
                                top: "50%",
                                translate: "0 -50%",
                                color: "white",
                            }}
                        ></i>

                        {/* Dropdown kết quả tìm kiếm */}
                        {products.length > 0 && (
                            <div className="search-dropdown bg-white w-100 position-absolute top-100 start-0 shadow">
                                <ul className="search-list m-0 p-2">
                                    {products.map((pro) => (
                                        <li
                                            key={pro.id}
                                            className="search-item d-flex align-items-center gap-2 p-1"
                                            onClick={() => {
                                                navigate(`/product/${pro.id}`);
                                                setKeyWord("");
                                            }}
                                        >
                                            {pro.image_url && (
                                                <img
                                                    src={pro.image_url}
                                                    alt=""
                                                    className="search-thumb"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            )}
                                            <div className="search-info">
                                                <div className="search-name">{pro.name}</div>
                                                <div className="search-price">{pro.base_price.toLocaleString()}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </form>

                    {/* 🧭 Menu bên phải */}
                    <ul className="navbar-nav gap-2 align-items-center">
                        {/* Kênh người bán */}
                        {user && (
                            <li className="d-flex align-items-center">
                                <button
                                    onClick={handleShopNavigation}
                                    className="nav-link btn btn-link p-0 border-0 d-flex align-items-center"
                                    style={{ textDecoration: "none" }}
                                    title={
                                        hasShop
                                            ? "Kênh Người Bán"
                                            : "Đăng ký trở thành Người bán"
                                    }
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

                        {/* Avatar / User */}
                        <li
                            className="position-relative d-flex align-items-center"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <Link
                                to={user ? "/user/account" : "/login"}
                                className="nav-link d-flex align-items-center"
                            >
                                {!user ? (
                                    <i className="fa-regular fa-user text-primary fs-5"></i>
                                ) : (
                                    <img
                                        src={user.avatar_url}
                                        alt=""
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </Link>

                            {/* Dropdown người dùng */}
                            {isHovered && user && (
                                <div
                                    className="position-absolute bg-white shadow rounded"
                                    style={{
                                        top: "100%",
                                        right: "0%",
                                        zIndex: 1000,
                                        padding: "10px",
                                        cursor: "pointer",
                                        minWidth: "160px",
                                    }}
                                >
                                    <div
                                        className="nav-info p-2 rounded"
                                        onClick={handleNavigateInfo}
                                    >
                                        Thông tin cá nhân
                                    </div>
                                    <div
                                        className="nav-info p-2 rounded"
                                        onClick={handleNavigateOrder}
                                    >
                                        Đơn mua
                                    </div>
                                    <div
                                        className="nav-info p-2 rounded"
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </div>
                                </div>
                            )}
                        </li>

                        {/* Giỏ hàng */}
                        <li className="d-flex align-items-center">
                            <Link
                                to="/cart"
                                className="nav-link d-flex align-items-center position-relative"
                            >
                                <i className="fa-solid fa-cart-shopping text-primary fs-5"></i>
                                {totalItemCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger">
                                        {totalItemCount}
                                    </span>
                                )}
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
