// src/pages/SearchPage.tsx
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProducts, fetchRelatedCategories } from "../api/products";
import { useEffect, useState, useCallback, useRef } from "react";
import type { ProductType } from "../types/ProductType";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState<any[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<any[]>([]);
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  const qParam = searchParams.get("q") || "";
  const noResultsFlag = searchParams.get("noResults") === "1";

  const [query, setQuery] = useState({
    q: qParam,
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    sort: (searchParams.get("sort") as string) || "relevance",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    brand: searchParams.get("brand") ? searchParams.get("brand")!.split(",").map(Number) : [],
    categories: searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [] as number[],
  });

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      q: searchParams.get("q") || "",
      page: Number(searchParams.get("page")) || 1,
      sort: (searchParams.get("sort") as string) || "relevance",
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
      brand: searchParams.get("brand") ? searchParams.get("brand")!.split(",").map(Number) : [],
      categories: searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadProducts = useCallback(async () => {
    if (!query.q || query.q.trim() === "") {
      setProducts([]);
      setTotalPages(1);
      setBrands([]);
      return;
    }
    try {
      setLoading(true);

      // NOTE:
      // We pass the full query object to fetchProducts; ensure your backend / fetchProducts
      // implementation reads `categories` (query.categories) from query string if you want server-side filtering.
      // If fetchProducts ignores categories, you should extend it to append `categories` param to the request.
      const res = await fetchProducts({ ...query, q: query.q }, undefined);
      setProducts(res.products);
      setTotalPages(res.totalPages);
      setBrands(res.brands ?? []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("SearchPage.loadProducts error:", err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadProducts();
    console.log("Haha");
    
  }, [loadProducts]);

  // load related categories for the left filter
  const loadRelatedCategories = useCallback(async (keyword: string) => {
    if (!keyword || keyword.trim() === "") {
      setRelatedCategories([]);
      return;
    }
    try {
      const data = await fetchRelatedCategories(keyword);
      setRelatedCategories(data);
    } catch (err) {
      console.error("loadRelatedCategories error:", err);
      setRelatedCategories([]);
    }
  }, []);

  useEffect(() => {
    loadRelatedCategories(query.q);
  }, [query.q, loadRelatedCategories]);

  const handleSort = (val: string) => {
    // update sort param in URL (reset page)
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    params.set("sort", val);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    params.set("page", String(page));
    setSearchParams(params);
  };

  // Toggle related category checkbox -> update URL param `categories`
  const handleToggleRelatedCategory = (catId: number) => {
    const current = searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [];
    const exists = current.includes(catId);
    const updated = exists ? current.filter((x) => x !== catId) : [...current, catId];

    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    if (updated.length > 0) params.set("categories", updated.join(","));
    else params.delete("categories");
    // reset to page 1 when filter changes
    params.set("page", "1");
    console.log(params);
    
    setSearchParams(params);
    // setQuery will be synced by the useEffect watching searchParams
  };

  // Helper: check if related category is selected (based on URL)
  const isRelatedCategoryChecked = (catId: number) => {
    const current = searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [];
    return current.includes(catId);
  };

  return (
    <div className="container my-3">
      <div className="row">
        {/* Sidebar - Theo danh mục (search) + brands */}
        <div className="col-lg-3 col-md-4 col-12">
          <div className="border-top p-3 m-2">
            <h5>Theo danh mục</h5>

            {relatedCategories.length === 0 ? (
              <div className="text-muted small">Không có danh mục phù hợp</div>
            ) : (
              <div>
                {relatedCategories.map((cat: any) => (
                  <div className="form-check my-1" key={cat.id}>
                    <input
                      className="form-check-input pointer"
                      type="checkbox"
                      value={cat.id}
                      id={`related-cat-${cat.id}`}
                      checked={isRelatedCategoryChecked(cat.id)}
                      onChange={() => handleToggleRelatedCategory(cat.id)}
                    />
                    <label className="form-check-label pointer" htmlFor={`related-cat-${cat.id}`}>
                      <span>{cat.name}</span>
                      <small className="text-muted ms-2">({cat.match_count ?? 0})</small>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-top p-3 m-2">
            <h5>Theo thương hiệu</h5>
            <div>
              {brands.length === 0 ? <div className="text-muted">Không có thương hiệu phù hợp</div> :
                brands.map((b) => (
                  <div className="mb-1" key={b.id}>
                    <input className="pointer" type="checkbox" id={`brand-search-${b.id}`} onChange={() => {
                      const currentBrands = searchParams.get("brand") ? searchParams.get("brand")!.split(",").map(Number) : [];
                      const exists = currentBrands.includes(b.id);
                      const updated = exists ? currentBrands.filter(x => x !== b.id) : [...currentBrands, b.id];
                      const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
                      if (updated.length > 0) params.set("brand", updated.join(",")); else params.delete("brand");
                      params.set("page", "1");
                      setSearchParams(params);
                    }} checked={query.brand.includes(b.id)} />
                    <label className="mx-2 pointer" htmlFor={`brand-search-${b.id}`}>{b.name}</label>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-lg-9 col-md-8 col-12" ref={scrollableContentRef}>
          {loading && (
            <div className="loader-overlay">
              <div className="spinner"></div>
            </div>
          )}
            <div className="search-info-box border-0 rounded p-3 mb-0">
                <div>
                    <span className="me-2">Kết quả tìm kiếm cho từ khoá</span>
                    <span style={{ color: "#ff6600", fontWeight: 700, fontSize: "1.05rem" }}>“{query.q}”</span>
                </div>

                {(noResultsFlag || (!loading && products.length === 0 && query.q.trim() !== "")) && (
                <div className="mt-2 alert alert-warning mb-0" role="alert">
                    Rất tiếc, không tìm thấy sản phẩm phù hợp với lựa chọn của bạn.
                </div>
                )}

                <div className="d-flex align-items-center mt-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="me-3 fw-semibold">Sắp xếp theo:</div>
                      <button className={`btn btn-sm sort-tab ${query.sort === "newest" ? "active" : ""}`} onClick={() => handleSort("newest")}>Mới nhất</button>
                      <button className={`btn btn-sm sort-tab ${query.sort === "best_seller" ? "active" : ""}`} onClick={() => handleSort("best_seller")}>Bán chạy</button>
                      <button className={`btn btn-sm sort-tab ${query.sort === "relevance" ? "active" : ""}`} onClick={() => handleSort("relevance")}>Liên quan</button>
                    </div>

                    <div className="d-flex align-items-center">
                        <select id="priceSortSearch" className="form-select form-select-sm sort-select" style={{ width: 220 }} value={query.sort} onChange={(e) => handleSort(e.target.value)}>
                            <option value="default">Giá: Mặc định</option>
                            <option value="priceDesc">Giá: Cao đến thấp</option>
                            <option value="priceAsc">Giá: Thấp đến cao</option>
                        </select>
                    </div>
                </div>
            </div>

          <div className="row row-cols-1 row-cols-md-4 g-4 pt-3">
            {!loading && products.length > 0 ? (
              products.map((product) => (
                <div className="col d-flex justify-content-center my-2" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              !loading && query.q.trim() !== "" && (
                <div className="w-100">
                  <p className="text-center fs-5">Không có sản phẩm</p>
                </div>
              )
            )}
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="d-flex align-items-center justify-content-center mt-4 gap-2">
              <button disabled={query.page === 1} onClick={() => handlePageChange(query.page - 1)} style={{ background: "none", border: "none" }} className="px-0">
                <FaLessThan />
              </button>

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
                    <button key={`page-${p}`} onClick={() => handlePageChange(p)} className={`${query.page === p ? "pagenum-active fw-bolder fs-5" : "pagenum-nonactive"}`}>
                      {p}
                    </button>
                  )
                );
              })()}

              <button disabled={query.page === totalPages} onClick={() => handlePageChange(query.page + 1)} style={{ background: "none", border: "none" }} className="px-0">
                <FaGreaterThan />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
