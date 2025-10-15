import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/swiper.css";

import CategoryItem from "./CategoryItem";

type Category = {
  id: string;
  name: string;
  image: string;
};

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
