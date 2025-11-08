import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path"; // <-- Từ nhánh 'main' (của đồng đội)

// Tất cả các routes
import chatRoutes from "./routes/chat.route";
import mailRoutes from "./routes/mail.route";
import authRoutes from "./routes/auth.route";
import CategoryRouter from "./routes/category.route";
import ProductRouter from "./routes/product.route";
import ShopRouter from "./routes/shop.route";
import UserRouter from "./routes/user.route";
import CartRouter from "./routes/cart.route";
import orderRoutes from "./routes/order.route"; // <-- Từ nhánh 'main'
import shopInfoRoutes from './routes/shop.info.route'; // <-- Từ nhánh của bạn
import shopCategoryRoutes from "./routes/shopCategory.route"; // <-- Từ nhánh của bạn
import paymentRouter from "./routes/payment.route"; // <-- Từ nhánh 'main'

const app = express();
app.use(bodyParser.json());

// Dòng này của đồng đội bạn -> Dùng để phục vụ file (ảnh) upload
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}))

// Các routes cũ
app.use("/api/chat", chatRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/categories", CategoryRouter);
app.use("/api/products", ProductRouter);
app.use("/api/shops", ShopRouter);
app.use("/api/user", UserRouter);
app.use("/api/cart", CartRouter);

// Routes của bạn (qhuykuteo)
app.use('/api/shop_info', shopInfoRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/shop-categories", shopCategoryRoutes);

// Routes của đồng đội (main)
app.use("/api", orderRoutes); // (Lưu ý: route này có thể trùng với các route /api/ khác)
app.use('/api/payments', paymentRouter);

// app.use("/api/jwt", authRoutes); // (Dòng này đã được comment, rất tốt)

app.listen(5000, () => {
    console.log("🚀 Backend chạy tại http://localhost:5000");
});