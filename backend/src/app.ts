import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
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
import path from "path";
import paymentRouter from "./routes/payment.route";
import ProductsAdminRoute from "./routes/admin/productsAdmin.route";
import ShopsAdminRoute from "./routes/admin/shopsAdmin.route";
const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}))

app.use("/api/chat", chatRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/jwt", authRoutes);
app.use("/api/categories", CategoryRouter);
app.use("/api/products", ProductRouter);
app.use("/api/shops", ShopRouter);
app.use("/api/user", UserRouter);
app.use("/api/cart", CartRouter);
app.use("/api", orderRoutes);
app.use('/api/payments', paymentRouter);
app.use("/api/admin/productsAdmin", ProductsAdminRoute);
app.use('/api/shopinfo', shopInfoRoutes);
app.use("/api/admin/shopsAdmin", ShopsAdminRoute);

app.listen(5000, () => {
    console.log("🚀 Backend chạy tại http://localhost:5000");
});
