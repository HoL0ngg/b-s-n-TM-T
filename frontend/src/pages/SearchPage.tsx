// src/pages/SearchPage.tsx
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProductsSearch, fetchRelatedCategories } from "../api/products";
import React, { useEffect, useState, useCallback, useRef } from "react";
import type { ProductType } from "../types/ProductType";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";

type QueryState = {
  q: string;
  page: number;
  limit: number;
  sort: "relevance" | "newest" | "best_seller" | "priceAsc" | "priceDesc";
  minPrice: number | null;
  maxPrice: number | null;
  categories: number[]; // CSV of generic ids or category ids (your backend decides)
};

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [relatedCategories, setRelatedCategories] = useState<any[]>([]);
  const scrollableContentRef = useRef<HTMLDivElement | null>(null);

  const qParam = searchParams.get("q") || "";
  const noResultsFlag = searchParams.get("noResults") === "1";

  // initial state from URL
  const [query, setQuery] = useState<QueryState>({
    q: qParam,
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    sort: (searchParams.get("sort") as QueryState["sort"]) || "relevance",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    categories: searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [],
  });

  // sync URL -> query
  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      q: searchParams.get("q") || "",
      page: Number(searchParams.get("page")) || 1,
      sort: (searchParams.get("sort") as QueryState["sort"]) || "relevance",
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
      categories: searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // load products based on query
  const loadProducts = useCallback(async () => {
    if (!query.q || query.q.trim() === "") {
      setProducts([]);
      setTotalPages(1);
      return;
    }

    try {
      setLoading(true);

      // Build fetch payload; fetchProducts should convert arrays to CSV query params
      const fetchQuery: any = {
        q: query.q,
        page: query.page,
        limit: query.limit,
        sort: query.sort, // single sort param per your request
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
      };
      if (query.categories && query.categories.length > 0) fetchQuery.categories = query.categories;
      console.log(`${Date.now()} SEARCHING`);
      console.log(query.categories);
      
      const res = await fetchProductsSearch(fetchQuery);
      let fetched = res.products ?? [];
      const fetchedTotalPages = res.totalPages ?? 1;

      // client-side fallback sorting if backend didn't perform requested sort
      // switch (query.sort) {
      //   case "newest":
      //     fetched = [...fetched].sort((a: any, b: any) => {
      //       const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      //       const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      //       return tb - ta;
      //     });
      //     break;
      //   case "best_seller":
      //     fetched = [...fetched].sort((a: any, b: any) => (b.sold_quantity ?? 0) - (a.sold_quantity ?? 0));
      //     break;
      //   case "priceAsc":
      //     fetched = [...fetched].sort((a: any, b: any) => (a.base_price ?? 0) - (b.base_price ?? 0));
      //     break;
      //   case "priceDesc":
      //     fetched = [...fetched].sort((a: any, b: any) => (b.base_price ?? 0) - (a.base_price ?? 0));
      //     break;
      //   case "relevance":
      //   default:
      //     // keep backend order (assume relevance)
      //     break;
      // }

      setProducts(fetched);
      setTotalPages(fetchedTotalPages);
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

  // load related categories for the left filter
  const loadRelatedCategories = useCallback(async (keyword: string) => {
    if (!keyword || keyword.trim() === "") {
      setRelatedCategories([]);
      return;
    }
    try {
      const data = await fetchRelatedCategories(keyword);
      setRelatedCategories(data ?? []);
    } catch (err) {
      console.error("loadRelatedCategories error:", err);
      setRelatedCategories([]);
    }
  }, []);

  useEffect(() => {
    loadRelatedCategories(query.q);
  }, [query.q, loadRelatedCategories]);

  // helper update URL params
  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    });
    setSearchParams(params);
  };

  // handle sorting (single sort param)
  const handleSort = (val: QueryState["sort"]) => {
    updateURLParams({ sort: val, page: "1" });
  };

  // pagination
  const handlePageChange = (page: number) => {
    updateURLParams({ page: String(page) });
  };

  // toggle related category checkbox -> update URL param `categories` (CSV)
  const handleToggleRelatedCategory = (catId: number) => {
    const cur = searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [];
    const exists = cur.includes(catId);
    const updated = exists ? cur.filter((x) => x !== catId) : [...cur, catId];
    const value = updated.length > 0 ? updated.join(",") : null;
    updateURLParams({ categories: value, page: "1" });
  };

  const isRelatedCategoryChecked = (catId: number) => {
    const cur = searchParams.get("categories") ? searchParams.get("categories")!.split(",").map(Number) : [];
    return cur.includes(catId);
  };

  return (
    <div className="container my-3">
      {/* LAYOUT: SIDEBAR + CONTENT */}
      <div className="row">
        {/* SIDEBAR */}
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
        </div>

        {/* CONTENT */}
        <div className="col-lg-9 col-md-8 col-12" ref={scrollableContentRef}>
          {loading && (
            <div className="loader-overlay">
              <div className="spinner"></div>
            </div>
          )}
          {/* INFO + SORT */}
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
                        <select id="priceSortSearch" className="form-select form-select-sm sort-select" style={{ width: 220 }} value={query.sort} onChange={(e) => handleSort(e.target.value as QueryState["sort"])}>
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
