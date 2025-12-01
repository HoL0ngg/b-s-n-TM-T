import { Link } from 'react-router-dom'; // (Sử dụng Link của React Router)
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

// (Bạn có thể thêm logo MoMo, VNPay... vào đây)
// import MomoLogo from '../assets/images/momo.png'; 
// import VnPayLogo from '../assets/images/vnpay.png';

export default function Footer() {
    return (
        <footer className="bg-light text-muted pt-5 pb-4 border-top mt-5">
            <div className="container">
                <div className="row g-4">

                    {/* --- Cột 1: Hỗ trợ Khách hàng --- */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-dark fw-semibold mb-3">Hỗ trợ Khách hàng</h5>
                        <ul className="list-unstyled footer-links">
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Trung tâm trợ giúp</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Hướng dẫn mua hàng</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Vận chuyển</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Chính sách đổi trả</Link></li>
                        </ul>
                        <h6 className="text-dark fw-semibold mt-4">Hotline</h6>
                        <p className="mb-1"><strong>0937211264</strong> (8h-22h)</p>
                        <p><strong>hihi@gmail.com</strong></p>
                    </div>

                    {/* --- Cột 2: Về MyShop --- */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-dark fw-semibold mb-3">Về BáSàn</h5>
                        <ul className="list-unstyled footer-links">
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Giới thiệu BáSàn</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Tuyển dụng</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Điều khoản dịch vụ</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted fw-semibold' to="">Chính sách bảo mật</Link></li>
                        </ul>
                    </div>

                    {/* --- Cột 3: Thanh toán & Kết nối --- */}
                    <div className="col-lg-2 col-md-6">
                        <h5 className="text-dark fw-semibold mb-3">Thanh toán</h5>
                        {/* <img src="assets/momo.png" alt="MoMo" style={{ height: '30px', marginRight: '10px' }} /> */}
                        <img src="assets/vnpay.svg" alt="VNPay" style={{ height: '30px' }} />

                        <h5 className="text-dark fw-semibold mb-3 mt-4">Kết nối</h5>
                        <div className="d-flex gap-3 fs-4">
                            <a href="https://www.facebook.com/TruongDaihocSaiGon.SGU" className="footer-icon"><FaFacebook /></a>
                            <a href="https://www.instagram.com/daihocsaigon/" className="footer-icon"><FaInstagram /></a>
                            <a href="https://www.tiktok.com/@sinhviendhsg" className="footer-icon"><FaTiktok /></a>
                        </div>
                    </div>

                    {/* --- Cột 4: Đăng ký nhận tin --- */}
                    <div className="col-lg-4 col-md-6">
                        <h5 className="text-dark fw-semibold mb-3">Đăng ký nhận bản tin</h5>
                        <p>Đừng bỏ lỡ các ưu đãi và sản phẩm mới nhất!</p>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email của bạn"
                                />
                                <button className="btn btn-primary" type="submit">
                                    Đăng ký
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                <hr className="my-3" />
                <div className="row">
                    <div className="col text-center">
                        <p className="small">
                            © {new Date().getFullYear()} BáSàn. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}