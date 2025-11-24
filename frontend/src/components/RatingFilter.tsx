import React from 'react';

interface RatingFilterProps {
    onFilterChange: (rating: number) => void;
    activeRating?: number | null;
}

export default function RatingFilter({ onFilterChange, activeRating }: RatingFilterProps) {
    const levels = [5, 4, 3, 2, 1];

    return (
        // <div className="card border-0"> {/* Dùng card để bọc, border-0 để bỏ viền nếu muốn giống ảnh */}
        <div className="">
            <div className="list-group list-group-flush">
                {levels.map((level) => (
                    <div
                        key={level}
                        onClick={() => onFilterChange(level)}
                        // Class xử lý hover và active background
                        className={`
                d-flex align-items-center py-2 px-2 rounded cursor-pointer
                ${activeRating === level ? 'bg-light fw-bold' : ''}
              `}
                        style={{ cursor: 'pointer' }} // Bootstrap không có class cursor-pointer mặc định
                        onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
                        onMouseLeave={(e) => {
                            if (activeRating !== level) e.currentTarget.classList.remove('bg-light')
                        }}
                    >
                        {/* Khu vực render sao */}
                        <div className="d-flex me-2">
                            {[1, 2, 3, 4, 5].map((starIndex) => (
                                <i
                                    key={starIndex}
                                    className={`
                      bi fs-6 me-1 
                      ${starIndex <= level ? 'bi-star-fill' : 'bi-star'} 
                      text-warning
                    `}
                                // bi-star-fill: sao đặc, bi-star: sao rỗng
                                // text-warning: màu vàng cam đặc trưng của Bootstrap
                                />
                            ))}
                        </div>

                        {/* Chữ "trở lên" */}
                        {level < 5 && (
                            <span className="small text-secondary">trở lên</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
        // </div>
    );
}