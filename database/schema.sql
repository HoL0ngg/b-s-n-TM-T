DROP DATABASE basan;

create DATABASE basan;
use basan;
create table users (
    phone_number VARCHAR(10) primary key,
    email varchar(255),
    password varchar(255),
    avatar_url varchar(255)
);
CREATE table user_profile(
    username varchar (255),
    dob DATETIME,
    gender tinyInt(1),
    updated_at DATETIME,
    phone_number varchar(10) primary key,
    FOREIGN key (phone_number) REFERENCES users(phone_number)
);
create table Shops(
    id int AUTO_INCREMENT primary key,
    name varchar(255),
    logo_url varchar(255),
    description varchar(255),
    status int,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    owner_id varchar(10),
    FOREIGN KEY (owner_id) REFERENCES Users(phone_number)
);
CREATE table Categories(
    id int AUTO_INCREMENT primary key,
    name varchar(255),
    description varchar(255),
    img_url varchar(255)
);

CREATE table shop_categories(
    id int AUTO_INCREMENT primary key,
    shop_id int,
    name varchar(255),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
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
    sold_count INT,
    shop_id INT,
    shop_cate_id INT,
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (shop_id) REFERENCES Shops(id),
    FOREIGN KEY (shop_cate_id) REFERENCES shop_categories(id)
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

CREATE table Address(
    id int AUTO_INCREMENT primary key,
    city varchar(255),
    ward varchar(255),
    street varchar(255),
    home_number varchar(255)
);

CREATE TABLE Address_User(
    address_id int,
    phone_number varchar(10),
    is_default tinyInt(1),
    user_name varchar(255),
    phone_number_jdo varchar(10),
    FOREIGN key (address_id) REFERENCES Address(id),
    FOREIGN key (phone_number) REFERENCES Users(phone_number)
);
CREATE TABLE `product_detail` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `product_id` int(11) NOT NULL,
  `attribute` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE TABLE Cart(
    user_id VARCHAR(10),
    product_variant_id int,
    quantity int,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN key (user_id) REFERENCES Users(phone_number),
    FOREIGN key (product_variant_id) REFERENCES ProductVariants(id),
    primary key (user_id, product_variant_id)
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
    ),
    (
        5,
        "Laptop",
        "Adudu",
        "/assets/categories/laptop.jpg"
    ),
    (
        6,
        "Sức khỏe",
        "adudu",
        "/assets/categories/suckhoe.png"
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
VALUES ("0987654321", "hihi@gmail.com", "123456", "/assets/panda.png"), ("0987654333", "hehe@gmail.com", "123456", "/assets/bear.png");
INSERT INTO user_profile VALUES ("", "2005-08-25", 1, null, "0987654321"), ("", "2005-08-26", 1, null, "0987654333");

INSERT INTO shops
VALUES (
        1,
        "Thế giới skin food",
        "/assets/shops/thegioiskinfood.png",
        "Shop chuyên về mỹ phẩm",
        1,
        "2025-08-25",
        "0987654321"
    ),(
        2,
        "Coolmate - Official Store",
        "/assets/shops/coolmate.webp",
        "Shop chuyên về quần áo",
        1,
        "2025-08-26",
        "0987654333"
    );

INSERT INTO shop_categories VALUES (1, 1, "Sản phẩm thu đông"), (2, 1, "Sản phẩm mùa hè"), (3, 2, "Sản phẩm mới");

INSERT INTO products
VALUES (
        1,
        "Son Kem Bóng Maybelline Bền Màu, Nhẹ Môi New York Superstay Vinyl Ink 4.2ml",
        "Son Kem Bóng Bền Màu, Nhẹ Môi Maybelline New York Superstay Vinyl Ink 4.2ml là son kem lì đến từ thương hiệu Maybelline chứa công thức đột phá mới với công nghệ “khóa” màu thách thức lem trôi, nhẹ mướt, để lại lớp bóng nhẹ tinh tế, cho đôi môi căng tràn sức sống. Son bóng lên màu chuẩn, nhưng vẫn duy trì độ ẩm và giữ được sự mềm mịn cho môi.",
        1,
        "2025-01-10",
        "2025-10-10",
        228000,
        1,
        100,
        1,
        1
    ), (
        2,
        "Giày Đá Banh Adidas X Crazyfast.1 Messi Xanh Biển Hồng Thể Thao Uni",
        "Giày đá banh, mang vô đá như Messi",
        1,
        "2025-8-10",
        "2025-10-10",
        2128000,
        4,
        20,
        1,
        2
    ), (
        3,
        "Áo Sơ Mi Nam Tay Dài Aristino OwenShop",
        "Áo sơ mi trắng",
        1,
        "2025-02-10",
        "2025-10-10",
        1128000,
        3,
        22,
        1,
        2
    ), (
        4,
        "Quần Tây Nam Owen QS231500 màu đen dáng slim fit vải polyester OwenShop",
        "Quần tây đen",
        1,
        "2025-10-10",
        "2025-10-10",
        280000,
        2,
        50,
        1,
        1
    ), (
        5,
        "[DUSTY ON THE NUDE] Son Dưỡng Dạng Thỏi Có Màu Thuần Chay Romand Glasting Melting Balm 3.5g",
        "Son Dưỡng Thuần Chay Romand Glasting Melting Balm là son thỏi màu có dưỡng đến từ thương hiệu Romand với tinh chất dầu thực vật thuần chay cùng chất son siêu nhẹ môi có độ dưỡng cao, giúp dưỡng ẩm cho đôi môi mềm mại, căng mọng tự nhiên trong thời gian dài.",
        1,
        "2025-01-10",
        "2025-10-10",
        199000,
        1,
        10,
        1,
        1
    ), (
        6,
        "Son Kem Lì Bông Maybelline Bền Màu Superstay Teddy Tint 5ml",
        "Son Kem Lì Bông Bền Màu Maybelline Superstay Teddy Tint là son kem lì nằm trong bộ sưu tập gấu hồng Teddy đáng yêu của thương hiệu Maybelline với công nghệ bồng bềnh Teddy Fluff siêu mềm mịn cho môi. Cùng với bảng màu son ngọt ngào có thể tô mờ hoặc tô đậm trên môi mang đến hiệu ứng mờ lì, căng mịn, cho môi sắc sảo.",
        1,
        "2025-01-10",
        "2025-10-10",
        218000,
        1,
        12,
        1,
        1
    ), (
        7,
        "Son Thỏi 3CE Mịn Lì, Mềm Môi Cashmere Hug Lipstick 3.5g",
        "Son Thỏi Mịn Lì, Mềm Môi 3CE Cashmere Hug Lipstick là son thỏi đến từ thương hiệu 3CE. Chất son matte mịn mờ, lướt nhẹ trên môi, mang lại cảm giác thoải mái, nhẹ môi suốt cả ngày. Màu lên chuẩn ngay từ lần quẹt đầu tiên. Thiết kế vỏ son nhám, có vân sọc cầm chắc tay, độc đáo, sang trọng.",
        1,
        "2025-01-10",
        "2025-10-10",
        369000,
        1,
        2,
        1,
        1
    ), (
        8,
        "Son Thỏi Bóng Căng Mọng, Mềm Môi Romand Sheer Tinted Stick 2g",
        "Son Thỏi Bóng Căng Mọng, Mềm Môi Romand Sheer Tinted Stick là son thỏi đến từ thương hiệu Romand. Chất son trong trẻo, lớp bóng mỏng và độ sáng trong mang đến cho bạn môi căng mịn như miếng thạch. Có độ lên màu ngay từ lần chạm đầu tiên và giữ màu lâu. Thành phần chiết xuất thiên nhiên có độ dưỡng ẩm sâu, mang đến môi căng mịn, mà không gây dính môi.",
        1,
        "2025-01-10",
        "2025-10-10",
        199000,
        1,
        42,
        1,
        1
    ), (
        9,
        "Áo Polo thể thao nam ProMax S1 Logo Coolmate",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        219000,
        3,
        2192,
        2,
        1
    ), (
        10,
        "Áo Sơ Mi Dài Tay Essentials Cotton mềm mại thoáng mát Coolmate",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        271320,
        3,
        395,
        2,
        1
    ), (
        11,
        "Quần dài nam Kaki Excool co giãn đàn hồi Coolmate",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        389000,
        2,
        519,
        2,
        1
    );
INSERT INTO ProductImages
VALUES  (1, "/assets/products/son1.jpg", 1, 1),
        (2, "/assets/products/giay1.webp", 2, 1), 
        (3, "/assets/products/ao1.webp", 3, 1), 
        (4, "/assets/products/quan1.webp", 4, 1),
        (5, "/assets/products/son1.1.jpg", 1, 0),
        (6, "/assets/products/son1.2.jpg", 1, 0),
        (7, "/assets/products/son1.3.jpg", 1, 0),
        (8, "/assets/products/son2.jpg", 5, 1),
        (9, "/assets/products/son2.1.jpg", 5, 0),
        (10, "/assets/products/son3.jpg", 6, 1),
        (11, "/assets/products/son3.1.jpg", 6, 0),
        (12, "/assets/products/son3.2.jpg", 6, 0),
        (13, "/assets/products/son3.3.jpg", 6, 0),
        (14, "/assets/products/son3.4.jpg", 6, 0),
        (15, "/assets/products/son4.jpg", 7, 1),
        (16, "/assets/products/son4.1.jpeg", 7, 0),
        (17, "/assets/products/son4.2.jpeg", 7, 0),
        (18, "/assets/products/son5.jpg", 8, 1),
        (19, "/assets/products/son5.1.jpg", 8, 0),
        (20, "/assets/products/ao polo 1.webp", 9, 1),
        (21, "/assets/products/ao polo1.1.webp", 9, 0),
        (22, "/assets/products/ao polo1.2.webp", 9, 0),
        (23, "/assets/products/ao polo1.3", 9, 0),
        (24, "/assets/products/ao polo1.4.webp", 9, 0),
        (25, "/assets/products/ao somi 1.webp", 10, 1),
        (26, "/assets/products/ao somi1.1.webp", 10, 0),
        (27, "/assets/products/ao somi1.2.webp", 10, 0),
        (28, "/assets/products/ao somi1.3.webp", 10, 0),
        (29, "/assets/products/quan kaki 1.webp", 11, 1),
        (30, "/assets/products/quan kaki1.1.webp", 11, 0),
        (31, "/assets/products/quan kaki1.2.webp", 11, 0),
        (32, "/assets/products/quan kaki1.3.webp", 11, 0),
        (33, "/assets/products/quan kaki1.4.webp", 11, 0),
        (34, "/assets/products/quan kaki1.5.webp", 11, 0),
        (35, "/assets/products/quan kaki1.6.webp", 11, 0);

INSERT INTO productreviews
VALUES  (1, 4, "Dùng cũn ngon đấy iem", "2025-10-20", "0987654321", 1),
        (2, 3, "Tạm được đấy iem", "2025-10-20", "0987654321", 3),
        (3, 5, "SIUUUUUUUUUU", "2025-10-20", "0987654321", 2),
        (4, 5, "MU 2 - 1 Liver", "2025-10-20", "0987654321", 2),
        (5, 4, "Hơi chật đấy iem", "2025-10-20", "0987654321", 3);

INSERT INTO Address VALUES (1, "TP. Hồ Chí Minh", "Phường Chợ Quán", "An Dương Vương", "273");
INSERT INTO Address VALUES (2, "TP. Hồ Chí Minh", "Phường Chợ Quán", "An Dương Vương", "275");
INSERT INTO Address_User VALUES (1, "0987654321", 1, "L0ngkute", "0937211264"), (2, "0987654321", 0, "0 phải L0ngg", "0937211265");
INSERT INTO `product_detail` (`id`, `product_id`, `attribute`, `value`) VALUES
(1, 1, 'Thương hiệu', 'Maybelline'),
(2, 1, 'Dòng sản phẩm', 'SuperStay Matte Ink'),
(3, 1, 'Mã màu', '210'),
(4, 1, 'Tên màu', 'Versatile (Hồng đất)'),
(5, 1, 'Chất son', 'Son kem lì'),
(6, 1, 'Độ bền màu', 'Lên đến 16 giờ'),
(7, 1, 'Dung tích', '5ml'),
(8, 1, 'Xuất xứ', 'Mỹ');
INSERT INTO `productvariants` (`id`, `product_id`, `price`, `stock`, `sku`) VALUES
(1, 1, 228000, 50, 'MBL-DO-4ML'),
(2, 1, 233000, 60, 'MBL-HONG-4ML'),
(3, 1, 223000, 40, 'MBL-CAM-4ML'),
(4, 2, 2128000, 10, 'ADID-XANH-38'),
(5, 2, 2138000, 8, 'ADID-XANH-39'),
(6, 2, 2148000, 6, 'ADID-XANH-40'),
(7, 2, 2148000, 12, 'ADID-HONG-38'),
(8, 2, 2158000, 9, 'ADID-HONG-39'),
(9, 2, 2168000, 7, 'ADID-HONG-40'),
(10, 3, 1128000, 19, 'AST-TRANG-S'),
(11, 3, 1138000, 18, 'AST-TRANG-M'),
(12, 3, 1148000, 15, 'AST-TRANG-L'),
(13, 3, 1133000, 22, 'AST-DEN-S'),
(14, 3, 1143000, 19, 'AST-DEN-M'),
(15, 3, 1153000, 14, 'AST-DEN-L'),
(16, 3, 1138000, 16, 'AST-XANH-S'),
(17, 3, 1148000, 14, 'AST-XANH-M'),
(18, 3, 1158000, 12, 'AST-XANH-L'),
(19, 4, 280000, 2, 'hjhj'),
(20, 5, 199000, 10, 'hjhj'),
(21, 6, 218000, 69, 'hjhj'),
(22, 7, 369000, 2, 'hjhj'),
(23, 8, 199000, 2, 'hjhj'),
(24, 9, 219000, 2, 'hjhj'),
(25, 10, 271320, 2, 'hjhj'),
(26, 11, 389000, 1, 'hjhj');

INSERT INTO `product_attributes` (`id`, `name`) VALUES
(1, 'Màu sắc'),
(2, 'Kích thước'),
(3, 'Dung tích'),
(4, 'Tone da');
INSERT INTO `variantoptionvalues` (`id`, `variant_id`, `attribute_id`, `value`) VALUES
(1, 1, 1, 'Đỏ'),
(2, 1, 3, '4ML'),
(3, 2, 1, 'Hồng'),
(4, 2, 3, '4ML'),
(5, 3, 1, 'Cam'),
(6, 3, 3, '4ML'),
(7, 4, 1, 'XANH'),
(8, 4, 2, '38'),
(9, 5, 1, 'XANH'),
(10, 5, 2, '39'),
(11, 6, 1, 'XANH'),
(12, 6, 2, '40'),
(13, 7, 1, 'HONG'),
(14, 7, 2, '38'),
(15, 8, 1, 'HONG'),
(16, 8, 2, '39'),
(17, 9, 1, 'HONG'),
(18, 9, 2, '40'),
(19, 10, 1, 'TRANG'),
(20, 10, 2, 'S'),
(21, 11, 1, 'TRANG'),
(22, 11, 2, 'M'),
(23, 12, 1, 'TRANG'),
(24, 12, 2, 'L'),
(25, 13, 1, 'DEN'),
(26, 13, 2, 'S'),
(27, 14, 1, 'DEN'),
(28, 14, 2, 'M'),
(29, 15, 1, 'DEN'),
(30, 15, 2, 'L'),
(31, 16, 1, 'XANH'),
(32, 16, 2, 'S'),
(33, 17, 1, 'XANH'),
(34, 17, 2, 'M'),
(35, 18, 1, 'XANH'),
(36, 18, 2, 'L');