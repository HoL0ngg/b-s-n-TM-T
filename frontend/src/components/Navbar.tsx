import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <img src={'/assets/logo.jpg'} alt="" style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
                </Link>

                <form className="d-flex mx-auto" style={{ maxWidth: "600px", width: "100%", position: "relative" }}>
                    <input
                        className="form-control me-2"
                        placeholder="Tìm sản phẩm..."
                        aria-label="Search"
                        style={{ borderRadius: '20px' }}
                    />
                    <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", right: "20px", top: "50%", translate: "0 -50%" }}></i>

                </form>
                <ul className="navbar-nav gap-2">
                    <li>
                        <Link to="/login" className="nav-link">
                            <i className="fa-regular fa-user"></i>
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">
                            <i className="fa-regular fa-heart"></i>
                        </Link>
                    </li>
                    <li>
                        <Link to="/cart" className="nav-link">
                            <i className="fa-solid fa-cart-shopping"></i>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
