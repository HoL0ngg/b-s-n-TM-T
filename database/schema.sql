create DATABASE basan;
use basan;
create table users (
    phone_number VARCHAR(10) primary key,
    email varchar(255),
    password varchar(255)
);
create table Shops(
    id int AUTO_INCREMENT primary key,
    name varchar(255),
    logo_url varchar(255),
    description varchar(255),
    status int,
    owner_id varchar(10),
    FOREIGN KEY (owner_id) REFERENCES Users(phone_number)
);
CREATE table Categories(
    id int AUTO_INCREMENT primary key,
    name varchar(255),
    description varchar(255),
    img_url varchar(255)
);
CREATE table Generic(
    id int AUTO_INCREMENT primary key,
    name varchar(255),
    category_id int,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    status INT DEFAULT 1,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP,
    base_price INT,
    category_id INT,
    shop_id INT,
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (shop_id) REFERENCES Shops(id)
);
CREATE TABLE ProductImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    product_id INT NOT NULL,
    isMain BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
CREATE TABLE ProductVariants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    sku VARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
CREATE TABLE Product_Attributes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE VariantOptionValues(
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    attribute_id INT NOT NULL,
    value VARCHAR(255),
    FOREIGN KEY (variant_id) REFERENCES ProductVariants(id),
    FOREIGN KEY (attribute_id) REFERENCES Product_Attributes(id)
);
CREATE TABLE ProductReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rating INT CHECK (
        rating BETWEEN 1 AND 5
    ),
    comment VARCHAR(1000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id varchar(10) NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(phone_number),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
INSERT INTO categories
VALUES (
        1,
        "Mỹ phẩm",
        "Danh mục Mỹ phẩm bao gồm các sản phẩm chăm sóc da, trang điểm và làm đẹp dành cho mọi lứa tuổi. Tất cả sản phẩm đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng, an toàn cho người dùng và giúp bạn tỏa sáng tự nhiên mỗi ngày.",
        "/assets/categories/my pham.jpg"
    ),
    (
        2,
        "Quần",
        "Danh mục Quần mang đến nhiều kiểu dáng hiện đại và thoải mái như quần jeans, quần tây, quần kaki, legging và jogger. Chất liệu đa dạng, form dáng chuẩn, phù hợp cho cả đi làm, đi học và dạo phố, giúp bạn tự tin thể hiện phong cách riêng.",
        "/assets/categories/quan.jpg"
    ),
    (
        3,
        "Áo",
        "Danh mục Áo gồm nhiều lựa chọn thời trang như áo thun, áo sơ mi, áo khoác, áo len và áo polo. Các sản phẩm được thiết kế tinh tế, chất liệu thoáng mát, dễ phối đồ và phù hợp cho mọi hoàn cảnh — từ công sở đến đi chơi.",
        "/assets/categories/ao.jpg"
    ),
    (
        4,
        "Giày",
        "Danh mục Giày cung cấp các mẫu giày thời trang, năng động và thoải mái như giày thể thao, giày da, giày cao gót và dép sandal. Với thiết kế hiện đại, bền đẹp và êm ái, sản phẩm giúp bạn di chuyển tự tin và hoàn thiện phong cách thời trang cá nhân.",
        "/assets/categories/giay.webp"
    );
INSERT INTO generic
VALUES (1, "son", 1),
    (2, "Phấn phủ", 1),
    (3, "kem nền", 1),
    (4, "Quần dài", 2),
    (5, "Quần short", 2),
    (6, "Quẩn thun", 2),
    (7, "Áo sơ mi", 3),
    (8, "Giày đá banh", 4);
INSERT INTO users
VALUES ("0987654321", "hihi@gmail.com", "123456");
INSERT INTO shops
VALUES (
        1,
        "Shop Test",
        "/assets/logo.jpg",
        "Shop này để test data",
        1,
        "0987654321"
    );
INSERT INTO products
VALUES (
        1,
        "Son Kem Bóng Maybelline Bền Màu, Nhẹ Môi New York Superstay Vinyl Ink 4.2ml",
        "Son Kem Bóng Bền Màu, Nhẹ Môi Maybelline New York Superstay Vinyl Ink 4.2ml là son kem lì đến từ thương hiệu Maybelline chứa công thức đột phá mới với công nghệ “khóa” màu thách thức lem trôi, nhẹ mướt, để lại lớp bóng nhẹ tinh tế, cho đôi môi căng tràn sức sống. Son bóng lên màu chuẩn, nhưng vẫn duy trì độ ẩm và giữ được sự mềm mịn cho môi.",
        1,
        "2025-10-10",
        "2025-10-10",
        228000,
        1,
        1
    );
INSERT INTO products
VALUES (
        2,
        "Giày Đá Banh Adidas X Crazyfast.1 Messi Xanh Biển Hồng Thể Thao Uni",
        "Giày đá banh, mang vô đá như Messi",
        1,
        "2025-10-10",
        "2025-10-10",
        2128000,
        4,
        1
    );
INSERT INTO products
VALUES (
        3,
        "Áo Sơ Mi Nam Tay Dài Aristino OwenShop",
        "Áo sơ mi trắng",
        1,
        "2025-10-10",
        "2025-10-10",
        1128000,
        3,
        1
    );
INSERT INTO products
VALUES (
        4,
        "Quần Tây Nam Owen QS231500 màu đen dáng slim fit vải polyester OwenShop",
        "Quần tây đen",
        1,
        "2025-10-10",
        "2025-10-10",
        280000,
        2,
        1
    );
INSERT INTO ProductImages
VALUES (1, "/assets/products/son1.jpg", 1, 1);
INSERT INTO ProductImages
VALUES (2, "/assets/products/giay1.webp", 2, 1);
INSERT INTO ProductImages
VALUES (3, "/assets/products/ao1.webp", 3, 1);
INSERT INTO ProductImages
VALUES (4, "/assets/products/quan1.webp", 4, 1);
INSERT INTO ProductImages
VALUES (5, "/assets/products/son1.1.jpg", 1, 0);
INSERT INTO ProductImages
VALUES (6, "/assets/products/son1.2.jpg", 1, 0);
INSERT INTO ProductImages
VALUES (7, "/assets/products/son1.3.jpg", 1, 0);