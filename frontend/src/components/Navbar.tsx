import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { fetchProductsByKeyWord } from "../api/products";
import { fetchShopByOwnerId } from "../api/shop";
import debounce from "lodash.debounce";
import type { ProductType } from "../types/ProductType";

// FIX: Sửa URL API cho đúng với backend route
const checkShopExists = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shop_info/user/${userId}`);
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
    const [showDropdown, setShowDropdown] = useState(false);
    const [suppressDropdown, setSuppressDropdown] = useState(false);

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
            try {
                // Gọi API kiểm tra shop
                const shop = await fetchShopByOwnerId(user.id);
                const shopExists = shop !== null;
                setHasShop(shopExists);

                if (shopExists) {
                    navigate("/seller");
                } else {
                    navigate("/register-shop");
                }
            } catch (error) {
                console.error("Error checking shop:", error);
                navigate("/register-shop");
            } finally {
                setCheckingShop(false);
            }
        } else {
            navigate("/login");
        }
    };

    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const hideTimeout = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const debounceTimerRef = useRef<any>(null);

    const HISTORY_KEY = "search_history_v1";
    const MAX_HISTORY = 5;
    const SUGGEST_LIMIT = 7; // backend trả tối đa 7 gợi ý (bạn set trước đó)

    // Load history từ localStorage
    const loadHistory = useCallback(() => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) {
        setSearchHistory([]);
        return;
        }
        const arr = JSON.parse(raw) as string[];
        setSearchHistory(Array.isArray(arr) ? arr.slice(0, MAX_HISTORY) : []);
    } catch {
        setSearchHistory([]);
    }
    }, []);

    // Lưu 1 keyword vào history (dedupe, newest first)
    const saveToHistory = useCallback((kw: string) => {
    const v = (kw || "").trim();
    if (!v) return;
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        const filtered = (arr || []).filter(s => s.toLowerCase() !== v.toLowerCase());
        filtered.unshift(v);
        const sliced = filtered.slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(sliced));
        setSearchHistory(sliced);
    } catch {
        // ignore
    }
    }, []);

    const handleNavigateToSearch = (kw?: string) => {
        const q = (kw ?? keyword ?? "").trim();
        if (!q) return;
        // lưu lịch sử (submit hoặc click "Xem thêm" đều nên lưu)
        saveToHistory(q);
        // Điều hướng tới SearchPage với query param 'q'
        setSuppressDropdown(true);
        setShowDropdown(false);
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowDropdown(false);
        handleNavigateToSearch();
    };

    //  Hàm fetch và debounce tìm kiếm
    const fetchProducts = async (val: string) => {
        try {
            const res = await fetchProductsByKeyWord(val);
            setProducts(res ?? []);
        } catch (error) {
            console.log(error);
            setProducts([]);
        }
    };

    const debouncedSearch = useMemo(
        () => debounce((value: string) => fetchProducts(value), 300),
        []
    );

    useEffect(() => {
        if (suppressDropdown) return; // khóa dropdown 1 lần sau khi navigate
        // nếu input rỗng -> clear suggestions & không show dropdown
        if (!keyword || keyword.trim() === "") {
            setProducts([]);
            if (searchHistory.length > 0) {
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }
            return;
        }

        // nếu có keyword -> debounce tìm suggestions
        debouncedSearch(keyword);

        // Show dropdown only if backend returns suggestions (we will set showDropdown in effect below when products updated)
        // Don't force open here.

        return () => {
            // cancel pending debounce on cleanup
            debouncedSearch.cancel();
        };
        // watch searchHistory too so initial focus can show history
    }, [keyword, debouncedSearch, searchHistory]);

    // watch products: if products exist -> show dropdown, else hide (per requirement)
    useEffect(() => {
        if (keyword && keyword.trim() !== "") {
            if (products.length > 0) setShowDropdown(true);
            else setShowDropdown(false); // if no suggestions, don't show dropdown
        }
    }, [products, keyword]);

    // focus / blur handlers for input (đảm bảo hide after small delay to allow onMouseDown)
    const handleInputFocus = () => {
        if (!keyword || keyword.trim() === "") {
            loadHistory();
            if (searchHistory.length > 0) setShowDropdown(true);
            else setShowDropdown(false);
        } else {
            // if typed, suggestions effect will open dropdown when products available
            if (products.length > 0) setShowDropdown(true);
        }
    };

    const handleInputBlur = () => {
        if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
        hideTimeout.current = window.setTimeout(() => {
            setShowDropdown(false);
            hideTimeout.current = null;
        }, 120);
    };

    // cleanup when component unmount
    useEffect(() => {
    return () => {
        if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
        debouncedSearch.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleNavigateInfo = () => navigate("/user/account/profile");
    const handleNavigateOrder = () => navigate("/user/purchase");

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img
                            src={"/assets/avatar/logo.png"}
                            alt=""
                            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
                        />
                    </Link>

                    {/* 🔍 Thanh tìm kiếm */}
                    <form
                        onSubmit={handleSubmit}
                        className="d-flex mx-auto"
                        style={{
                            maxWidth: "600px",
                            width: "100%",
                            position: "relative",
                            height: "46px",
                        }}
                    >
                        <input
                            ref={inputRef}
                            className="form-control shadow"
                            placeholder="Tìm sản phẩm..."
                            aria-label="Search"
                            value={keyword}
                            onChange={(e) => {
                                setSuppressDropdown(false); // cho phép dropdown hoạt động lại khi user gõ chữ mới
                                setKeyWord(e.target.value);
                                 // không ép showDropdown ở đây; effect/focus decides visibility
                                }}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                        />

                        {/* Biến icon thành nút submit để click cũng tìm */}
                        <button
                            type="submit"
                            aria-label="Tìm"
                            className="btn p-2 rounded-circle"
                            style={{
                                position: "absolute",
                                right: "14px",
                                top: "50%",
                                translate: "0 -50%",
                                color: "white",
                                background: "transparent",
                                border: "none",
                            }}
                        >
                            <i className="fa-solid fa-magnifying-glass bg-primary p-2 rounded-circle" style={{ color: "white" }} />
                        </button>

                        {/* Dropdown kết quả tìm kiếm */}
                        {showDropdown && (
                            <div className="search-dropdown bg-white w-100 position-absolute top-100 start-0 shadow" style={{ zIndex: 999 }}>
                                <ul className="search-list m-0 p-2" role="list">
                                {/* Nếu rỗng -> show history (chỉ khi có history) */}
                                {(!keyword || keyword.trim() === "") ? (
                                <>
                                    {searchHistory.length === 0 ? null : (
                                    searchHistory.map((h) => (
                                        <li
                                        key={h}
                                        className="search-item d-flex align-items-center gap-2 p-1 pointer"
                                        onMouseDown={(ev) => {
                                            ev.preventDefault();
                                            // click history: set keyword, navigate to search
                                            setKeyWord(h);
                                            saveToHistory(h);
                                            setShowDropdown(false);
                                            navigate(`/search?q=${encodeURIComponent(h)}`);
                                        }}
                                        >
                                        <div className="search-info">
                                            <div className="search-name">{h}</div>
                                        </div>
                                        </li>
                                    ))
                                    )}
                                </>
                                ) : (
                                // Có keyword -> show suggestions nếu có; nếu ko có suggestions -> per yêu cầu không hiển thị anything
                                <>
                                    {/* only render suggestions if exist (we already ensured showDropdown true only when products.length>0) */}
                                    {products.map((pro) => (
                                        <li
                                            key={pro.id}
                                            className="search-item d-flex align-items-center gap-2 p-1"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                // navigate product
                                                setSuppressDropdown(true);
                                                navigate(`/product/${pro.id}`);
                                                setKeyWord("");
                                                setShowDropdown(false);
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    navigate(`/product/${pro.id}`);
                                                }
                                            }}
                                        >
                                            {pro.image_url && (
                                                <img
                                                    src={
                                                        pro.image_url.startsWith('http') || pro.image_url.startsWith('data:')
                                                            ? pro.image_url
                                                            : pro.image_url.startsWith('/uploads')
                                                                ? `${import.meta.env.VITE_API_URL}${pro.image_url}`
                                                                : pro.image_url
                                                    }
                                                    alt={pro.name ?? "thumb"}
                                                    className="search-thumb"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                    }}
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/40?text=X';
                                                    }}
                                            />
                                            )}
                                            <div className="search-info">
                                                <div className="search-name">{pro.name}</div>
                                                <div className="search-price">{(pro.base_price ?? 0).toLocaleString()}</div>
                                            </div>
                                        </li>
                                    ))}

                                    {/* Xem thêm: chỉ hiện nếu có khả năng còn nhiều kết quả (backend trả đầy đủ limit) */}
                                    {products.length >= SUGGEST_LIMIT && (
                                    <li
                                        className="search-item search-more d-flex flex-column gap-1 p-2 mt-1 border-top"
                                        onMouseDown={(ev) => {
                                        ev.preventDefault();
                                        handleNavigateToSearch();
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleNavigateToSearch(); }}
                                        style={{ cursor: "pointer", background: "#fff", fontWeight: 600 }}
                                    >
                                        <div>Xem thêm kết quả cho “{keyword.trim()}”</div>
                                    </li>
                                    )}
                                </>
                                )}
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
