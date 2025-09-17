import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
    const location = useLocation();
    const paths = location.pathname.split("/").filter((p) => p);

    return (
        <div className="container">
            <nav className="text-sm text-gray-600 my-4">
                <ul className="d-flex gap-2 list-unstyled">
                    <li>
                        <Link to="/" className="text-decoration-none text-reset link-primary-hover">Trang chủ</Link>
                    </li>
                    {paths.map((path, index) => {
                        const route = "/" + paths.slice(0, index + 1).join("/");
                        const isLast = index === paths.length - 1;

                        return (
                            <li key={index} className="flex items-center gap-2">
                                <span>{">"}</span>
                                {isLast ? (
                                    <span className="ms-1 text-primary">{path}</span>
                                ) : (
                                    <Link to={route}>
                                        {path}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Breadcrumbs;
