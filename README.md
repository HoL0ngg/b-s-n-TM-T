# 🛒 E-Commerce Website

Dự án thương mại điện tử cơ bản với **React + Vite + TypeScript** cho Frontend, **Node.js (Express)** cho Backend và **MySQL** cho cơ sở dữ liệu.  

---

## 🚀 Công nghệ sử dụng

### Frontend
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/) (kết nối API)
- [React Router](https://reactrouter.com/) (điều hướng)
- [Bootstrap 5](https://getbootstrap.com/) (UI framework)

### Backend
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [JWT](https://jwt.io/) (xác thực)
- [bcrypt](https://www.npmjs.com/package/bcrypt) (mã hóa mật khẩu)
- [dotenv](https://www.npmjs.com/package/dotenv) (quản lý biến môi trường)

### Database
- [MySQL](https://www.mysql.com/)

---

## 📂 Cấu trúc thư mục

```bash
ecommerce/
│── backend/                # Backend với Node.js + Express
│   ├── src/
│   │   ├── config/          # Cấu hình DB, JWT...
│   │   ├── controllers/     # Xử lý logic API
│   │   ├── middleware/      # Middleware (auth, logger...)
│   │   ├── models/          # Model kết nối MySQL
│   │   ├── routes/          # Định nghĩa API
│   │   ├── utils/           # Hàm tiện ích
│   │   └── app.ts           # File khởi chạy Express
│   ├── package.json
│   └── tsconfig.json
│
│── frontend/               # Frontend với React + Vite + TS
│   ├── src/
│   │   ├── assets/          # Ảnh, icon, font
│   │   ├── components/      # Các component tái sử dụng
│   │   ├── pages/           # Trang chính (Home, Cart, Login...)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Gọi API qua axios
│   │   ├── context/         # React Context (auth, cart...)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
│── database/               # File SQL khởi tạo CSDL
│   ├── schema.sql
│   └── seed.sql
│
└── README.md