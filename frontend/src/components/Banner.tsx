import Swiper from "swiper"

// Khi nào rãnh có thể update Banner là swiper để nó tự lướt
export default function Banner() {
    return (
        <div className="container-fluid p-0 position-relative mb-5">
            <img src="https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/slider_1.jpg?1749442635129" alt=""
                style={{ height: '100%', width: '100%' }} />

            <div className="position-absolute start-50 translate-middle bg-white p-4 rounded-4 shadow w-75">
                <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="p-3 rounded"
                            style={{
                                background: 'linear-gradient(135deg, #f38926ff 0%, #f0b677ff 100%)',
                            }}>
                            <i className="fa-solid fa-truck-fast text-white"></i>
                        </div>
                        <div className="d-flex flex-column ms-2">
                            <h6 className="m-0">Giao hàng toàn quốc</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Thanh toán (COD) khi nhận hàng</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="p-3 rounded"
                            style={{
                                background: 'linear-gradient(135deg, #f38926ff 0%, #f0b677ff 100%)',
                            }}>
                            <i className="fa-solid fa-box text-white"></i>
                        </div>
                        <div className="d-flex flex-column ms-2">
                            <h6 className="m-0">Giao hàng toàn quốc</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Thanh toán (COD) khi nhận hàng</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="p-3 rounded"
                            style={{
                                background: 'linear-gradient(135deg, #f38926ff 0%, #f0b677ff 100%)',
                            }}>
                            <i className="fa-solid fa-truck-fast text-white"></i>
                        </div>
                        <div className="d-flex flex-column ms-2">
                            <h6 className="m-0">Giao hàng toàn quốc</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Thanh toán (COD) khi nhận hàng</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="p-3 rounded"
                            style={{
                                background: 'linear-gradient(135deg, #f38926ff 0%, #f0b677ff 100%)',
                            }}>
                            <i className="fa-solid fa-headset text-white"></i>
                        </div>
                        <div className="d-flex flex-column ms-2">
                            <h6 className="m-0">Giao hàng toàn quốc</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Thanh toán (COD) khi nhận hàng</p>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    )
}