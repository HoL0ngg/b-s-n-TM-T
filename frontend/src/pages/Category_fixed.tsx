import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import type { CategoryType, SubCategoryType } from "../types/CategoryType";
import type { BrandOfProductType, ProductType } from "../types/ProductType";
import { fetchCategories, fetchSubCategories } from "../api/categories";
import { fetchProducts } from "../api/products";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";
import Swal from "sweetalert2";
import RatingFilter from "../components/RatingFilter";
const Category_fixed = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const scrollableContentRef = useRef<HTMLDivElement>(null);
    // --- 1. STATE DỮ LIỆU HIỂN THỊ ---
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategoryType[]>([]);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [brands, setBrands] = useState<BrandOfProductType[]>([]);

    // UI State
    const [loading, setLoading] = useState<boolean>(false);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
    const [priceRange, setPriceRange] = useState({ minPrice: "", maxPrice: "" });
    const [isUserAction, setIsUserAction] = useState(false); // Cờ đánh dấu hành động người dùng để push history

    // --- 2. STATE QUẢN LÝ QUERY (State đơn lẻ) ---
    // Khởi tạo giá trị ban đầu từ URL để tránh render thừa
    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [sort, setSort] = useState(() => searchParams.get("sort") || "default");
    const [subCategoryId, setSubCategoryId] = useState(() => Number(searchParams.get("sub")) || 0);
    const [minPrice, setMinPrice] = useState<number | null>(() => searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null);
    const [maxPrice, setMaxPrice] = useState<number | null>(() => searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null);
    const [brand, setBrand] = useState<number[]>(() => searchParams.get("brand")?.split(',').map(Number) || []);
    const [rating, setRating] = useState<number | null>(() => searchParams.get("rating") ? Number(searchParams.get("rating")) : null);

    //query state
    const query = useMemo(() => ({
        categoryId: Number(id),
        subCategoryId,
        page,
        limit: 12,
        sort,
        minPrice,
        maxPrice,
        brand,
        rating
    }), [id, subCategoryId, page, sort, minPrice, maxPrice, brand, rating]);

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSubCategories = async () => {
        try {
            const res = await fetchSubCategories(Number(id));
            setSubCategories(res);
        } catch (err) {
            console.error(err);
        }
    };
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchProducts(query, Number(id));
            setProducts(res.products);
            setTotalPages(res.totalPages);
            setBrands(res.brands ?? []);
            scrollToTop();
        } catch (err) {
            console.error("Lỗi khi load sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    }, [query, id]);

    // --- 5. EFFECTS ---

    // Effect A: Load data ban đầu (Category, SubCategory) khi ID thay đổi
    useEffect(() => {
        loadCategories();
        loadSubCategories();
    }, [id]);

    // Effect B: Gọi API load sản phẩm khi Query Object thay đổi
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Effect C: Sync STATE -> URL (Khi các state đơn lẻ thay đổi)
    useEffect(() => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("sort", sort);

        if (subCategoryId !== 0) params.set("sub", String(subCategoryId));
        if (minPrice !== null) params.set("minPrice", String(minPrice));
        if (maxPrice !== null) params.set("maxPrice", String(maxPrice));
        if (brand.length > 0) params.set("brand", brand.join(','));
        if (rating !== null) params.set("rating", String(rating));

        // So sánh để tránh update trùng lặp
        const currentStr = searchParams.toString();
        const newStr = params.toString();

        if (currentStr !== newStr) {
            if (isUserAction) {
                setSearchParams(params); // Push history (người dùng click)
                setIsUserAction(false);
            } else {
                setSearchParams(params, { replace: true }); // Replace (init hoặc sync tự động)
            }
        }

        // Sync UI subcategory text
        // const currentSubName = subCategories.find(s => s.id === subCategoryId)?.name || "all";
        if (subCategoryId === 0) setSelectedSubCategory("all");
        // Lưu ý: Logic lấy tên subCategory ở đây có thể cần điều chỉnh tùy data

    }, [page, sort, subCategoryId, minPrice, maxPrice, brand, rating]);

    // Effect D: Sync URL -> STATE (Xử lý Back/Forward browser)
    useEffect(() => {
        const pPage = Number(searchParams.get("page")) || 1;
        const pSort = searchParams.get("sort") || "default";
        const pSub = Number(searchParams.get("sub")) || 0;
        const pMin = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
        const pMax = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
        const pBrand = searchParams.get("brand")?.split(',').filter(Boolean).map(Number) || [];
        const pRating = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;

        // Chỉ set state nếu giá trị thực sự khác (Deep check đơn giản)
        if (pPage !== page) setPage(pPage);
        if (pSort !== sort) setSort(pSort);
        if (pSub !== subCategoryId) {
            setSubCategoryId(pSub);
            setSelectedSubCategory(pSub === 0 ? "all" : String(pSub)); // Cần logic mapping tên đúng
        }
        if (pMin !== minPrice) setMinPrice(pMin);
        if (pMax !== maxPrice) setMaxPrice(pMax);
        if (JSON.stringify(pBrand.sort()) !== JSON.stringify(brand.sort())) setBrand(pBrand);
        if (pRating !== rating) setRating(pRating);

        // Sync input range UI
        if (pMin || pMax) {
            setPriceRange({
                minPrice: pMin?.toString() || "",
                maxPrice: pMax?.toString() || ""
            });
        }
    }, [searchParams]);


    // --- 6. HANDLERS (SỬA LẠI ĐỂ DÙNG STATE ĐƠN LẺ) ---

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectedSubCategory = (subCateId: number, name: string) => {
        setIsUserAction(true);
        setSelectedSubCategory(name);

        // Cập nhật từng state
        setSubCategoryId(subCateId);
        setPage(1);           // Reset page
        setBrand([]);         // Reset brand
        setSort("default");   // Reset sort

        // Reset Filter giá/rating nếu cần (tùy logic nghiệp vụ)
        handleResetFilter(false); // false để không reset lại subCate vừa chọn
    };

    const handleSort = (val: string) => {
        setIsUserAction(true);
        setSort(val);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setIsUserAction(true);
        setPage(newPage);
        scrollToTop();
    };

    const handleToggleBrand = (brandId: number) => {
        setIsUserAction(true);
        setBrand(prev => {
            const exists = prev.includes(brandId);
            const updated = exists ? prev.filter(b => b !== brandId) : [...prev, brandId];
            return updated;
        });
        setPage(1);
    };

    const handleRatingFilterChange = (newRating: number) => {
        setIsUserAction(true);
        setRating(newRating);
        setPage(1);
    };

    const handleApplyBtn = () => {
        const min = priceRange.minPrice ? Number(priceRange.minPrice) : null;
        const max = priceRange.maxPrice ? Number(priceRange.maxPrice) : null;

        // Validate
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        if ((min !== null && min < 0) || (max !== null && max < 0)) {
            Toast.fire({ icon: "warning", title: "Giá phải là số lớn hơn 0!" });
            return;
        }
        if (min !== null && max !== null && min > max) {
            Toast.fire({ icon: "warning", title: "Khoảng giá không hợp lệ!" });
            return;
        }

        setIsUserAction(true);
        setMinPrice(min);
        setMaxPrice(max);
        setPage(1);
    };

    const handleResetFilter = (resetSubCat = true) => {
        setIsUserAction(true);

        setMinPrice(null);
        setMaxPrice(null);
        setBrand([]);
        setRating(null);
        setPage(1);

        if (resetSubCat) {
            setSubCategoryId(0);
            setSelectedSubCategory("all");
            // Reset params trên URL ngay lập tức cho sạch (Effect sẽ chạy đè lại nhưng bước này giúp UI phản hồi nhanh)
            setSearchParams({ page: "1", sort: sort }, { replace: true });
        }

        // Reset UI input
        setPriceRange({ minPrice: "", maxPrice: "" });
    };
    //ahahahah

    const filteredNameOfCategory = categories.find(
        (cat) => cat.id === Number(id)
    );
    return (
        <div className="container">
            <CategorySwiper categories={categories} />

            <div className="container my-3">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-lg-3 col-md-4 col-12">
                        <div className="border-top p-3 m-2">
                            <h5>Danh mục sản phẩm</h5>
                            <ul className="list-unstyled">
                                <li
                                    onClick={() => handleSelectedSubCategory(0, "all")}
                                    className={`pointer subCategoryText ${selectedSubCategory === "all" ? "active fw-bold fs-5" : ""
                                        }`}
                                >
                                    Tất cả
                                </li>
                                {subCategories.map((subCat) => (
                                    <li
                                        key={subCat.id}
                                        className={`pointer my-1 subCategoryText ${subCat.id === query.subCategoryId ? "active fw-bold fs-5" : ""
                                            }`}
                                        onClick={() =>
                                            handleSelectedSubCategory(subCat.id, subCat.name)
                                        }
                                    >
                                        {subCat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-top p-3 m-2">
                            <h5>Khoảng giá</h5>
                            <input
                                type="text"
                                className="form-control form-control-sm mt-2"
                                placeholder="Từ"
                                value={priceRange.minPrice}
                                onChange={(e) => setPriceRange((prev) => (
                                    { ...prev, minPrice: e.target.value }
                                ))}
                            />
                            <input
                                type="text"
                                className="form-control form-control-sm mt-2"
                                placeholder="Đến"
                                value={priceRange.maxPrice}
                                onChange={(e) => setPriceRange((prev) => (
                                    { ...prev, maxPrice: e.target.value }
                                ))}
                            />
                            <button className="btn-apply my-2 fw-semibold" onClick={() => handleApplyBtn()}>Áp dụng</button>
                        </div>
                        <div className="border-top p-3 m-2">
                            <h5>Thương hiệu</h5>
                            <div>
                                {brands.map((b) => (
                                    <div className="mb-1" key={b.id}>
                                        <input
                                            className="pointer"
                                            type="checkbox" id={`brand-${b.id}`}
                                            onChange={() => handleToggleBrand(b.id)}
                                            checked={query.brand.includes(b.id)}
                                        />
                                        <label className="mx-2 pointer" htmlFor={`brand-${b.id}`}>{b.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-top p-3 m-2">
                            <h5>Đánh giá</h5>
                            <div>
                                <RatingFilter onFilterChange={handleRatingFilterChange} activeRating={rating} />
                            </div>
                        </div>
                        <div className="border-top p-3 m-2">
                            <button className="btn-apply fw-semibold" onClick={() => handleResetFilter()}>Đặt lại</button>
                        </div>

                    </div>

                    {/* Product list */}
                    <div className="col-lg-9 col-md-8 col-12" ref={scrollableContentRef}>
                        <div className="mb-3">
                            <h2 className="mb-2">{filteredNameOfCategory?.name ?? "Danh mục không tồn tại"}</h2>
                            <div className="d-flex align-items-center flex-wrap mb-2 gap-2">
                                {/* Tabs sort */}
                                <div className="d-flex align-items-center gap-2">
                                    <div className="me-2 fw-semibold">Sắp xếp theo:</div>

                                    <button
                                        className={`btn btn-sm sort-tab ${query.sort === "newest" ? "active" : ""}`}
                                        onClick={() => handleSort("newest")}
                                    >
                                        Mới nhất
                                    </button>

                                    <button
                                        className={`btn btn-sm sort-tab ${query.sort === "best_seller" ? "active" : ""}`}
                                        onClick={() => handleSort("best_seller")}
                                    >
                                        Bán chạy
                                    </button>
                                </div>

                                <select
                                    className="form-select form-select-sm sort-select pointer"
                                    value={
                                        query.sort === "priceAsc" ||
                                            query.sort === "priceDesc"
                                            ? query.sort
                                            : "default"
                                    }
                                    onChange={(e) => handleSort(e.target.value)}
                                    style={{ width: 220 }}
                                >
                                    <option value="default">Giá: Mặc định</option>
                                    <option value="priceDesc">Giá: Cao đến thấp</option>
                                    <option value="priceAsc">Giá: Thấp đến cao</option>
                                </select>
                            </div>
                        </div>

                        {/* Loader */}
                        {loading && (
                            <div className="loader-overlay">
                                <div className="spinner"></div>
                            </div>
                        )}

                        {/* Products */}
                        <div className="row row-cols-1 row-cols-md-4">
                            {!loading && products.length > 0 ? (
                                products.map((product) => (
                                    <div className="col d-flex justify-content-center my-2" key={product.id}>
                                        <ProductCard product={product} />
                                    </div>
                                ))
                            ) : (
                                !loading && (
                                    <div className="w-100">
                                        <p className="text-center fs-5">Không có sản phẩm</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Pagination */}
                        {products.length > 0 && (
                            <div className="d-flex align-items-center justify-content-center mt-4 gap-2">
                                {/* Prev */}
                                <button
                                    disabled={query.page === 1}
                                    onClick={() => handlePageChange(query.page - 1)}
                                    style={{ background: "none", border: "none" }}
                                    className="px-0"
                                >
                                    <FaLessThan />
                                </button>

                                {/* Smart Pages */}
                                {(() => {
                                    const pages: (number | "dots")[] = [];
                                    const { page } = query;

                                    if (totalPages <= 3) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else if (page <= 3) {
                                        pages.push(1, 2, 3, "dots", totalPages);
                                    } else if (page >= totalPages - 2) {
                                        pages.push(1, "dots", totalPages - 2, totalPages - 1, totalPages);
                                    } else {
                                        pages.push(1, "dots", page - 1, page, page + 1, "dots", totalPages);
                                    }

                                    return pages.map((p, index) =>
                                        p === "dots" ? (
                                            <span key={`dots-${index}`} className="px-1">...</span>
                                        ) : (
                                            <button
                                                key={`page-${p}`}
                                                onClick={() => handlePageChange(p)}
                                                className={`${query.page === p
                                                    ? "pagenum-active fw-bolder fs-5"
                                                    : "pagenum-nonactive"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    );
                                })()}

                                {/* Next */}
                                <button
                                    disabled={query.page === totalPages}
                                    onClick={() => handlePageChange(query.page + 1)}
                                    style={{ background: "none", border: "none" }}
                                    className="px-0"
                                >
                                    <FaGreaterThan />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Category_fixed;