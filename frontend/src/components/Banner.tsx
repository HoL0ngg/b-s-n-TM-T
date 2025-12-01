import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

export default function Banner() {
    const banners = [
        {
            id: 1,
            image: '/assets/banner/banner3.jpg',
            alt: 'Banner 1'
        },
        {
            id: 2,
            image: '/assets/banner/banner2.jpg',
            alt: 'Banner 2'
        },
        {
            id: 3,
            image: '/assets/banner/banner1.jpg',
            alt: 'Banner 3'
        }
    ];

    return (
        <div className="container-fluid p-0 position-relative mb-5">
            <Swiper
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                }}
                loop={true}
                style={{ width: '100%', height: '500px' }}
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <img
                            src={banner.image}
                            alt={banner.alt}
                            style={{
                                height: '500px',
                                width: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="position-absolute start-50 translate-middle bg-white p-4 rounded-4 shadow w-75" style={{ bottom: '-100px', zIndex: 10 }}>
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
                            <h6 className="m-0">Miễn phí giao hàng</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Theo chính sách</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="p-3 rounded"
                            style={{
                                background: 'linear-gradient(135deg, #f38926ff 0%, #f0b677ff 100%)',
                            }}>
                            <i className="fa-solid fa-rotate text-white"></i>
                        </div>
                        <div className="d-flex flex-column ms-2">
                            <h6 className="m-0">Đổi trả trong 7 ngày</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Kể từ ngày mua hàng</p>
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
                            <h6 className="m-0">Hỗ trợ 24/7</h6>
                            <p className="m-0 text-muted" style={{ fontSize: "0.75rem" }}>Luôn sẵn sàng hỗ trợ bạn</p>
                        </div>
                    </div>

                </div>
            </div>

        </div >
    )
}