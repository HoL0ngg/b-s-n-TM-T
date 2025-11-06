import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import type { CategoryType, SubCategoryType } from "../types/CategoryType";
import type { BrandOfProductType, ProductType } from "../types/ProductType";
import { fetchCategories, fetchSubCategories } from "../api/categories";
import { fetchProducts } from "../api/products";
import { useEffect, useState, useCallback } from "react";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";


const Category = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [brands, setBrands] = useState<BrandOfProductType[]>([])
  const [isUserAction, setIsUserAction] = useState(false);
  const [priceRange, setPriceRange] = useState({ minPrice: "", maxPrice: "" });

  //  Gom toàn bộ điều kiện truy vấn vào 1 state duy nhất
  const [query, setQuery] = useState({
    categoryId: Number(id),
    subCategoryId: 0,
    page: 1,
    limit: 12,
    sort: "default",
    minPrice: null as number | null,
    maxPrice: null as number | null,
    brand: [] as number[],
  });

  //  Hàm fetch duy nhất
  // const loadProducts = useCallback(async () => {
  //   try {
  //     // setLoading(true);
  //     let res;

  //     if (query.subCategoryId !== 0) {
  //       // Có danh mục con
  //       if (query.sort !== "default") {
  //         res = await fetchProductsInPriceOrder(
  //           query.subCategoryId,
  //           query.page,
  //           query.limit,
  //           query.sort
  //         );
  //       } else {
  //         res = await fetchProductsBySubCategory(
  //           query.subCategoryId,
  //           query.page,
  //           query.limit
  //         );
  //       }
  //     } else {
  //       // Không có danh mục con
  //       if (query.sort !== "default") {
  //         res = await fetchProductsInPriceOrder(
  //           query.categoryId,
  //           query.page,
  //           query.limit,
  //           query.sort
  //         );
  //       } else {
  //         res = await fetchProducts(
  //           query.categoryId,
  //           query.page,
  //           query.limit
  //         );
  //       }
  //     }
  //     // console.log(res.products);
  //     setProducts(res.products);
  //     setTotalPages(res.totalPages);
  //     setBrands(res.brands ?? []);
  //   } catch (err) {
  //     console.error("Lỗi khi load sản phẩm:", err);
  //   }
  //   // finally {
  //   //   setTimeout(() => {
  //   //     setLoading(false);

  //   //   }, 300);
  //   // }
  // }, [query]);
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi một hàm API duy nhất, truyền toàn bộ object query
      const res = await fetchProducts(query, Number(id));



      setProducts(res.products);
      setTotalPages(res.totalPages);
      setBrands(res.brands ?? []);

    } catch (err) {
      console.error("Lỗi khi load sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  }, [query]); // Chỉ phụ thuộc vào `query`

  //  Khi query thay đổi → tự load lại sản phẩm
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  //  Khi query thay đổi → update URL
  useEffect(() => {
    const params: any = {
      page: query.page.toString(),
      sort: query.sort,
    };
    if (query.subCategoryId !== 0) {
      params.sub = query.subCategoryId.toString();
    }
    if (query.minPrice !== null) params.minPrice = query.minPrice.toString();
    if (query.maxPrice !== null) params.maxPrice = query.maxPrice.toString();
    if (query.brand && query.brand.length > 0) {
      params.brand = query.brand.join(',');
    }
    if (isUserAction) {
      setSearchParams(params); //PUSH history
      setIsUserAction(false);
    } else {
      setSearchParams(params, { replace: true }); //REPLACE khi auto sync
    }
  }, [query]);


  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const sort = searchParams.get("sort") || "default";
    const sub = Number(searchParams.get("sub")) || 0;
    const min = searchParams.get("minPrice") || "";
    const max = searchParams.get("maxPrice") || "";
    const brand = searchParams.get("brand")?.split(',').map(Number) || [];
    setQuery({
      categoryId: Number(id),
      subCategoryId: sub,
      page,
      limit: 12,
      sort,
      minPrice: min ? Number(min) : null,
      maxPrice: max ? Number(max) : null,
      brand,
    });

    setSelectedSubCategory(sub === 0 ? "all" : String(sub));
    loadSubCategories();
    loadCategories();
  }, [id, searchParams]);
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

  //  Handler chọn danh mục con
  const handleSelectedSubCategory = (subCateId: number, name: string) => {
    setIsUserAction(true)
    setSelectedSubCategory(name);
    setQuery((prev) => ({
      ...prev,
      subCategoryId: subCateId,
      brand: [],
      page: 1,
      sort: "default",
    }));
    handleResetFilter();
  };

  //  Handler sắp xếp
  const handleSort = (val: string) => {
    setIsUserAction(true);
    setQuery((prev) => ({
      ...prev,
      sort: val,
    }));
  };

  //  Handler chuyển trang
  const handlePageChange = (page: number) => {
    setIsUserAction(true);
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };
  const handleApplyBtn = () => {
    const min = priceRange.minPrice ? Number(priceRange.minPrice) : null;
    const max = priceRange.maxPrice ? Number(priceRange.maxPrice) : null;
    if ((min != null && min < 0) || (max != null && max < 0)) {
      alert("Giá phải là số lớn hơn 0 !");
      return;
    }
    if (min != null && max != null && min > max) {
      alert("Khoảng giá bạn vừa nhập không hợp lệ!");
      return;
    }
    setQuery((prev) => ({
      ...prev,
      page: 1,
      minPrice: min,
      maxPrice: max,
    }))
  }
  const filteredNameOfCategory = categories.find(
    (cat) => cat.id === Number(id)
  );
  const handleToggleBrand = (brandId: number) => {
    setIsUserAction(true);

    setQuery((prev) => {
      const exists = prev.brand.includes(brandId);
      const updated = exists
        ? prev.brand.filter((b) => b !== brandId)
        : [...prev.brand, brandId];

      return {
        ...prev,
        brand: updated,
        page: 1,
      };
    });
  };


  const handleResetFilter = () => {
    setIsUserAction(true);

    setQuery((prev) => ({
      ...prev,
      minPrice: null,
      maxPrice: null,
      brand: [],   //  reset brand trong query
      page: 1,
    }));

    const params = new URLSearchParams(searchParams);

    //  Xoá param khoảng giá
    params.delete("minPrice");
    params.delete("maxPrice");

    //  Xoá brand trên URL
    params.delete("brand");

    //  Reset về page 1
    params.set("page", "1");

    setSearchParams(params); // cập nhật URL

    //  Reset input tạm
    setPriceRange({ minPrice: "", maxPrice: "" });
  };

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

            </div>
            <div className="border-top p-3 m-2">
              <button className="btn-apply fw-semibold" onClick={() => handleResetFilter()}>Đặt lại</button>
            </div>

          </div>

          {/* Product list */}
          <div className="col-lg-9 col-md-8 col-12">
            <div className="row row-cols-1 row-cols-md-2 g-4">
              <div className="d-flex justify-content-between w-100">

                <h2 className="mb-4 text-left">
                  {filteredNameOfCategory?.name ?? "Danh mục không tồn tại"}
                </h2>

                <div className="mb-3">
                  <span className="fs-5 text-right me-3">Sắp xếp theo: </span>
                  <select
                    name="sortBy"
                    id="sortBy"
                    className="custom-select"
                    style={{ width: '150px' }}
                    value={query.sort}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="default">Mặc định</option>
                    <option value="priceDesc">Giá giảm dần</option>
                    <option value="priceAsc">Giá tăng dần</option>
                  </select>
                </div>
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
export default Category;