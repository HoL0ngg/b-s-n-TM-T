import React from 'react';

// 1. Định nghĩa kiểu dữ liệu cho các props
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagenum: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {

    // // Di chuyển hàm vào trong component (hoặc để ngoài cũng được)
    // const scrollToTop = () => {
    //     window.scrollTo({
    //         top: 0,
    //         behavior: "smooth", // cuộn mượt
    //     });
    // };

    // 2. Tách logic render số trang ra một hàm riêng cho sạch sẽ
    const renderPageNumbers = () => {
        const pages: (number | 'dots')[] = [];
        const page = currentPage; // Sử dụng currentPage được truyền vào

        // Logic này giữ nguyên từ code gốc của bạn
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (page <= 3) {
            pages.push(1, 2, 3, 'dots', totalPages);
        } else if (page >= totalPages - 2) {
            pages.push(1, 'dots', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, 'dots', page - 1, page, page + 1, 'dots', totalPages);
        }

        // Render mảng 'pages' ra thành các thẻ <li>
        return pages.map((p, index) =>
            p === 'dots' ? (
                <li key={`dots-${index}`} className="page-item disabled">
                    <span className="page-link">...</span>
                </li>
            ) : (
                <li
                    key={`page-${p}`}
                    className={`page-item ${currentPage === p ? 'active' : ''}`}
                >
                    <button
                        className="page-link"
                        // 3. Gọi hàm onPageChange từ props thay vì handlePageChange
                        onClick={() => { onPageChange(p); }}
                    >
                        {p}
                    </button>
                </li>
            )
        );
    };

    // 4. Chỉ render component nếu có nhiều hơn 1 trang
    if (totalPages <= 1) {
        return null; // Không hiển thị gì cả nếu chỉ có 1 trang
    }

    return (
        <nav aria-label="Page navigation" className="mt-3">
            <ul className="pagination justify-content-end mb-0">
                {/* Nút Trang trước */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        // 3. Gọi hàm onPageChange từ props
                        onClick={() => { onPageChange(currentPage - 1) }}
                        disabled={currentPage === 1} // Thêm disabled để chặn click
                    >
                        Trước
                    </button>
                </li>

                {/* Hiển thị số trang */}
                {renderPageNumbers()}

                {/* Nút Trang sau */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        // 3. Gọi hàm onPageChange từ props
                        // SỬA LỖI: Thêm scrollToTop() vào đây
                        onClick={() => {
                            onPageChange(currentPage + 1);                            // <--- Thêm dòng này
                        }}
                        disabled={currentPage === totalPages} // Thêm disabled
                    >
                        Sau
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagenum;