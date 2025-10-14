import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Category } from "../types/Category";
import "swiper/swiper.css";

import CategoryItem from "./CategoryItem";


type CategorySwiperProps = {
  categories: Category[];
};

const CategorySwiper: React.FC<CategorySwiperProps> = ({ categories }) => {
  return (
    <div className="container mt-3">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={4}
        navigation={{
          prevEl: ".custom-button-prev",
          nextEl: ".custom-button-next",
        }}
        breakpoints={{
          320: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {categories.map((cat) => (
          <SwiperSlide>
            <CategoryItem category={cat} />
          </SwiperSlide>
        ))}
        {/* <div className="swiper-button-prev custom-nav"><i className="fa-solid fa-arrow-left"></i></div>
                <div className="swiper-button-next custom-nav"><i className="fa-solid fa-arrow-right"></i></div> */}
        <div className="custom-button-prev shadow-sm p-1 btn-hover-scale">
          <i className="fa-solid fa-less-than"></i>
        </div>
        <div className="custom-button-next shadow-sm p-1 btn-hover-scale">
          <i className="fa-solid fa-greater-than"></i>
        </div>
      </Swiper>
    </div>
  );
};

export default CategorySwiper;
