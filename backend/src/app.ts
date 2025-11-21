import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path"; // <-- Từ nhánh 'main' (của đồng đội)

// Tất cả các routes (Gộp từ cả 2 nhánh)
import chatRoutes from "./routes/chat.route";
import mailRoutes from "./routes/mail.route";
import authRoutes from "./routes/auth.route";
import CategoryRouter from "./routes/category.route";
import ProductRouter from "./routes/product.route";
import ShopRouter from "./routes/shop.route";
import UserRouter from "./routes/user.route";
import CartRouter from "./routes/cart.route";
import orderRoutes from "./routes/order.route";
import shopInfoRoutes from './routes/shop.info.route';
import shopCategoryRoutes from "./routes/shopCategory.route"; // <-- Từ nhánh của bạn
import paymentRouter from "./routes/payment.route";
import ProductsAdminRoute from "./routes/admin/productsAdmin.route"; // <-- Từ nhánh 'main'
import ShopsAdminRoute from "./routes/admin/shopsAdmin.route"; // <-- Từ nhánh 'main'
import UsersAdminRoute from "./routes/admin/usersAdmin.route";
import OrdersAdminRoute from "./routes/admin/ordersAdmin.route";
import AdminRouter from "./routes/admin.route";
import UploadRouter from "./routes/upload.route";
import shippingRouter from "./routes/shipping.route";

const app = express();
app.use(bodyParser.json());
app.use(express.json()); // <-- Từ nhánh 'main'

// Dòng này của đồng đội bạn -> Dùng để phục vụ file (ảnh) upload
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}))

// Các routes cũ (chung)
app.use("/api/chat", chatRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/categories", CategoryRouter);
app.use("/api/products", ProductRouter);
app.use("/api/shops", ShopRouter);
app.use("/api/user", UserRouter);
app.use("/api/cart", CartRouter);

app.use("/api/auth", authRoutes);
app.use("/api/shop-categories", shopCategoryRoutes);

// Routes của đồng đội (main)
app.use('/api/payments', paymentRouter);
app.use("/api/admin/productsAdmin", ProductsAdminRoute);
app.use('/api/shopinfo', shopInfoRoutes); // (Không có dấu gạch dưới)
app.use("/api/admin", AdminRouter);
app.use("/api", orderRoutes);
app.use("/api/admin/shopsAdmin", ShopsAdminRoute);
app.use("/api/admin/usersAdmin", UsersAdminRoute);
app.use("/api/admin/ordersAdmin", OrdersAdminRoute);

app.use("/api/upload", UploadRouter);

app.use("/api/shipping", shippingRouter);

app.listen(5000, () => {
    console.log("🚀 Backend chạy tại http://localhost:5000");
});