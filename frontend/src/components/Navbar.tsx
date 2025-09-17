import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <img src={'/assets/logo.jpg'} alt="" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                </Link>

                <form className="d-flex mx-auto" style={{ maxWidth: "600px", width: "100%", position: "relative", height: '46px' }}>
                    <input
                        className="form-control me-2 shadow"
                        placeholder="Tìm sản phẩm..."
                        aria-label="Search"
                        style={{ borderRadius: '24px' }}
                    />
                    <i className="fa-solid fa-magnifying-glass bg-primary p-2 rounded-circle" style={{ position: "absolute", right: "14px", top: "50%", translate: "0 -50%", color: 'white' }}></i>

                </form>
                <ul className="navbar-nav gap-2">
                    <li>
                        <Link to="/login" className="nav-link">
                            <i className="fa-regular fa-user text-primary fs-5"></i>
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">
                            <i className="fa-regular fa-heart text-primary fs-5"></i>
                        </Link>
                    </li>
                    <li>
                        <Link to="/cart" className="nav-link">
                            <i className="fa-solid fa-cart-shopping text-primary fs-5"></i>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
