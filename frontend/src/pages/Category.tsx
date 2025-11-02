import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import type { CategoryType, SubCategoryType } from "../types/CategoryType";
import type { BrandOfProductType, ProductType } from "../types/ProductType";
import { fetchCategories, fetchSubCategories } from "../api/categories";
import { fetchProducts, fetchProductsBySubCategory, fetchProductsInPriceOrder } from "../api/products";
import { useEffect, useState, useCallback } from "react";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";


const Category = () => {
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [brands, setBrands] = useState<BrandOfProductType[]>([])

  //  Gom toàn bộ điều kiện truy vấn vào 1 state duy nhất
  const [query, setQuery] = useState({
    categoryId: Number(id),
    subCategoryId: 0,
    page: 1,
    limit: 12,
    sort: "default",
  });

  //  Hàm fetch duy nhất
  const loadProducts = useCallback(async () => {
    try {
      // setLoading(true);
      let res;

      if (query.subCategoryId !== 0) {
        // Có danh mục con
        if (query.sort !== "default") {
          res = await fetchProductsInPriceOrder(
            query.subCategoryId,
            query.page,
            query.limit,
            query.sort
          );
        } else {
          res = await fetchProductsBySubCategory(
            query.subCategoryId,
            query.page,
            query.limit
          );
        }
      } else {
        // Không có danh mục con
        if (query.sort !== "default") {
          res = await fetchProductsInPriceOrder(
            query.categoryId,
            query.page,
            query.limit,
            query.sort
          );
        } else {
          res = await fetchProducts(
            query.categoryId,
            query.page,
            query.limit
          );
        }
      }
      // console.log(res.products);
      setProducts(res.products);
      setTotalPages(res.totalPages);
      setBrands(res.brands ?? []);
    } catch (err) {
      console.error("Lỗi khi load sản phẩm:", err);
    }
    // finally {
    //   setTimeout(() => {
    //     setLoading(false);

    //   }, 300);
    // }
  }, [query]);

  //  Khi query thay đổi → tự load lại sản phẩm
  useEffect(() => {
    loadProducts();
  }, [query]);

  //  Khi id danh mục cha thay đổi
  useEffect(() => {
    setQuery({
      categoryId: Number(id),
      subCategoryId: 0,
      page: 1,
      limit: 12,
      sort: "default",
    });
    setSelectedSubCategory("all");
    loadSubCategories();
    loadCategories();
  }, [id]);

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
    setSelectedSubCategory(name);
    setQuery((prev) => ({
      ...prev,
      subCategoryId: subCateId,
      page: 1,
    }));
  };

  //  Handler sắp xếp
  const handleSort = (val: string) => {
    setQuery((prev) => ({
      ...prev,
      sort: val,
      page: 1,
    }));
  };

  //  Handler chuyển trang
  const handlePageChange = (page: number) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  const filteredNameOfCategory = categories.find(
    (cat) => cat.id === Number(id)
  );

  const handleResetFilter = () => {
  }
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
                    className={`pointer my-1 subCategoryText ${subCat.name === selectedSubCategory ? "active fw-bold fs-5" : ""
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
              />
              <input
                type="text"
                className="form-control form-control-sm mt-2"
                placeholder="Đến"
              />
              <button className="btn-apply my-2 fw-semibold">Áp dụng</button>
            </div>
            <div className="border-top p-3 m-2">
              <h5>Thương hiệu</h5>
              <div>
                {brands.map((b) => (
                  <div className="mb-1" key={b.id}>
                    <input className="pointer" type="checkbox" id={`brand-${b.id}`} />
                    <label className="mx-2 pointer" htmlFor={`brand-${b.id}`}>{b.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-top p-3 m-2">
              <button onClick={() => handleResetFilter()}>Đặt lại</button>
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