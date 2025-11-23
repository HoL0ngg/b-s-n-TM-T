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
  }, [loadProducts]);

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
    setQuery((prev) => ({ ...prev, sort: val, page: 1 }));
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    params.set("sort", val);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    params.set("page", String(page));
    setSearchParams(params);
  };

  return (
    <div className="container my-3">
      <div className="row">
        {/* Sidebar - Theo danh mục (search) + brands */}
        <div className="col-lg-3 col-md-4 col-12">
          <div className="border-top p-3 m-2">
            <h5>Theo danh mục</h5>
            <ul className="list-unstyled">
              {relatedCategories.length === 0 ? (
                <li className="text-muted">Không có danh mục phù hợp</li>
              ) : (
                relatedCategories.map((cat: any) => (
                  <li key={cat.id} className="pointer my-1" onClick={() => window.location.href = `/category/${cat.id}`}>
                    {cat.name} <small className="text-muted">({cat.match_count})</small>
                  </li>
                ))
              )}
            </ul>
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

                <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                    <div className="d-flex align-items-center mb-2">
                        <div className="me-3 fw-semibold">Sắp xếp theo:</div>
                        <div className="sort-tabs d-flex align-items-center" role="tablist" aria-label="Sort tabs">
                        <button className={`btn btn-sm sort-tab ${query.sort === "newest" ? "active" : ""}`} onClick={() => handleSort("newest")}>Mới nhất</button>
                        <button className={`btn btn-sm sort-tab ${query.sort === "best_seller" ? "active" : ""}`} onClick={() => handleSort("best_seller")}>Bán chạy</button>
                        <button className={`btn btn-sm sort-tab ${query.sort === "relevance" ? "active" : ""}`} onClick={() => handleSort("relevance")}>Liên quan nhất</button>
                        </div>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                        <label htmlFor="priceSortSearch" className="me-2 mb-0 fw-semibold">Giá</label>
                        <select id="priceSortSearch" className="form-select form-select-sm" style={{ width: 220 }} value={query.sort} onChange={(e) => handleSort(e.target.value)}>
                            <option value="default">Mặc định</option>
                            <option value="priceDesc">Cao đến thấp</option>
                            <option value="priceAsc">Thấp đến cao</option>
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
