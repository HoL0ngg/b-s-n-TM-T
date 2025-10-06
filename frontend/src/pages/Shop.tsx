import React, { useState, createContext, useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

type Product = { id: string; title: string; price: number; stock: number };
type Order = { id: string; productId: string; qty: number; total: number; status: "pending" | "shipped" | "delivered" };

const sampleProducts: Product[] = [
  { id: "p1", title: "Sneaker X", price: 79.99, stock: 12 },
  { id: "p2", title: "T-Shirt Classic", price: 19.5, stock: 120 },
  { id: "p3", title: "Backpack Pro", price: 49.0, stock: 8 },
];
const sampleOrders: Order[] = [
  { id: "o1", productId: "p1", qty: 2, total: 159.98, status: "pending" },
  { id: "o2", productId: "p3", qty: 1, total: 49.0, status: "shipped" },
];

type ShopState = {
  products: Product[];
  orders: Order[];
  wallet: { balance: number };
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  payout: (amount: number) => boolean;
};

const ShopContext = createContext<ShopState | undefined>(undefined);
function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export default function ShopApp() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [wallet, setWallet] = useState({ balance: 1234.5 });

  const addProduct = (p: Omit<Product, "id">) => {
    const newP: Product = { ...p, id: `p${Date.now().toString(36)}` };
    setProducts((s) => [newP, ...s]);
  };
  const updateProduct = (id: string, patch: Partial<Product>) =>
    setProducts((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeProduct = (id: string) => setProducts((s) => s.filter((x) => x.id !== id));
  const updateOrderStatus = (id: string, status: Order["status"]) =>
    setOrders((s) => s.map((o) => (o.id === id ? { ...o, status } : o)));
  const payout = (amount: number) => {
    if (amount <= 0 || amount > wallet.balance) return false;
    setWallet((w) => ({ balance: w.balance - amount }));
    return true;
  };

  const state: ShopState = {
    products,
    orders,
    wallet,
    addProduct,
    updateProduct,
    removeProduct,
    updateOrderStatus,
    payout,
  };

  return (
    <ShopContext.Provider value={state}>
        <div className="container-fluid bg-light min-vh-100 py-3">
          <div className="row">
            <aside className="col-md-3 col-lg-2 mb-3">
              <Sidebar />
            </aside>
            <main className="col-md-9 col-lg-10">
              <Topbar />
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
        </div>
    </ShopContext.Provider>
  );
}

function Sidebar() {
  const nav = [
    { to: "/", label: "Dashboard" },
    { to: "/orders", label: "Orders" },
    { to: "/products", label: "Products" },
    { to: "/wallet", label: "Wallet" },
    { to: "/settings", label: "Settings" },
  ];
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">My Shop</h5>
        <p className="text-muted small">Shop owner · Pro plan</p>
        <ul className="nav flex-column">
          {nav.map((n) => (
            <li key={n.to} className="nav-item">
              <Link to={n.to} className="nav-link text-dark">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <div className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm mb-3 rounded">
      <div>
        <h4 className="mb-0">Shop Control Panel</h4>
        <small className="text-muted">Manage orders, products, and payouts</small>
      </div>
      <button className="btn btn-primary">Create product</button>
    </div>
  );
}

function DashboardPage() {
  const { products, orders, wallet } = useShop();
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="row g-3">
      <div className="col-md-4">
        <StatCard title="Products" value={products.length} />
      </div>
      <div className="col-md-4">
        <StatCard title="Orders" value={orders.length} />
      </div>
      <div className="col-md-4">
        <StatCard title="Wallet (USD)" value={`$${wallet.balance.toFixed(2)}`} />
      </div>
      <div className="col-md-6">
        <Card title="Quick summary">
          <p>Stock across products: {totalStock}</p>
          <p>Total sales: ${totalSales.toFixed(2)}</p>
        </Card>
      </div>
      <div className="col-md-6">
        <Card title="Recent orders">
          <ul className="list-group">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="list-group-item d-flex justify-content-between">
                <div>
                  <strong>Order {o.id}</strong>
                  <div className="small text-muted">Qty {o.qty}</div>
                </div>
                <div>
                  <div>${o.total.toFixed(2)}</div>
                  <small className="text-muted">{o.status}</small>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="card text-center shadow-sm">
      <div className="card-body">
        <div className="text-muted small">{title}</div>
        <h5 className="fw-bold">{value}</h5>
      </div>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="card shadow-sm">
      {title && <div className="card-header fw-semibold">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}

function OrdersPage() {
  const { orders, products, updateOrderStatus } = useShop();
  const findName = (id: string) => products.find((p) => p.id === id)?.title ?? "Unknown";
  return (
    <div>
      <h4>Orders</h4>
      <table className="table table-hover bg-white shadow-sm rounded">
        <thead className="table-light">
          <tr>
            <th>Order</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{findName(o.productId)}</td>
              <td>{o.qty}</td>
              <td>${o.total.toFixed(2)}</td>
              <td>{o.status}</td>
              <td>
                {o.status !== "shipped" && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => updateOrderStatus(o.id, "shipped")}
                  >
                    Mark shipped
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsPage() {
  const { products, addProduct, updateProduct, removeProduct } = useShop();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Products</h4>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>Add Product</button>
      </div>
      <div className="row g-3">
        {products.map((p) => (
          <div key={p.id} className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5>{p.title}</h5>
                <p className="text-muted small">${p.price.toFixed(2)} | Stock: {p.stock}</p>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { setEditing(p); setShowForm(true); }}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeProduct(p.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && <ProductForm initial={editing} onClose={() => setShowForm(false)} onSave={(vals) => {
        if (editing) updateProduct(editing.id, vals);
        else addProduct(vals as Omit<Product, "id">);
        setShowForm(false);
      }} />}
    </div>
  );
}

function ProductForm({ initial, onClose, onSave }: { initial?: Product | null; onClose: () => void; onSave: (vals: Partial<Product>) => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{initial ? "Edit Product" : "Create Product"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Price</label>
              <input type="number" className="form-control" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Stock</label>
              <input type="number" className="form-control" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave({ title, price, stock })}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletPage() {
  const { wallet, payout } = useShop();
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const onPayout = () => {
    const ok = payout(amount);
    setMsg(ok ? `Payout ${amount} requested` : `Invalid amount or insufficient balance`);
  };
  return (
    <div>
      <h4>Wallet</h4>
      <Card>
        <p>Available balance: <strong>${wallet.balance.toFixed(2)}</strong></p>
        <div className="input-group mb-2">
          <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <button className="btn btn-success" onClick={onPayout}>Request payout</button>
        </div>
        {msg && <div className="alert alert-info mt-2 p-2">{msg}</div>}
      </Card>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h4>Settings</h4>
      <Card>
        <div className="mb-3">
          <label className="form-label">Shop name</label>
          <input className="form-control" defaultValue="My Shop" />
        </div>
        <div className="mb-3">
          <label className="form-label">Business email</label>
          <input className="form-control" defaultValue="seller@example.com" />
        </div>
      </Card>
    </div>
  );
}