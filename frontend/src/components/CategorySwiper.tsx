import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import 'swiper/swiper.css';

import CategoryItem from "./CategoryItem";

type Category = {
    id: string;
    name: string;
    image: string;
}

type CategorySwiperProps = {
    categories: Category[];
}

const CategorySwiper: React.FC<CategorySwiperProps> = ({ categories }) => {
    return(
        // <div className="container">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={4}
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                breakpoints={{
                320: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                }}
            >
                {categories.map((cat,index) => (
                    <SwiperSlide>
                        <CategoryItem category={cat}/>
                    </SwiperSlide>
                ))}
                <div className="swiper-button-prev "><i className="fa-solid fa-arrow-left"></i></div>
                <div className="swiper-button-next"><i className="fa-solid fa-arrow-right"></i></div>
            </Swiper>
        // </div>
    );
}

export default CategorySwiper;