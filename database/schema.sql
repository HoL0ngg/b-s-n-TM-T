DROP DATABASE basan;

create DATABASE basan;
use basan;
create table users (
    phone_number VARCHAR(10) primary key,
    email varchar(255),
    password varchar(255),
    avatar_url varchar(255) DEFAULT '/assets/panda.png'
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
VALUES ("0987654321", "hihi@gmail.com", "123456", "/assets/panda.png");
INSERT INTO user_profile VALUES ("", "2005-08-25", 1, null, "0987654321");

INSERT INTO shops
VALUES (
        1,
        "Thế giới skin food",
        "/assets/shops/thegioiskinfood.png",
        "Shop chuyên về mỹ phẩm",
        1,
        "2025-08-25",
        "0987654321"
    );

INSERT INTO shop_categories VALUES (1, 1, "Sản phẩm thu đông"), (2, 1, "Sản phẩm mùa hè");

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
        (19, "/assets/products/son5.1.jpg", 8, 0);

INSERT INTO productreviews
VALUES  (1, 4, "Dùng cũn ngon đấy iem", "2025-10-20", "0987654321", 1),
        (2, 3, "Tạm được đấy iem", "2025-10-20", "0987654321", 3),
        (3, 5, "SIUUUUUUUUUU", "2025-10-20", "0987654321", 2),
        (4, 5, "MU 2 - 1 Liver", "2025-10-20", "0987654321", 2),
        (5, 4, "Hơi chật đấy iem", "2025-10-20", "0987654321", 3);

INSERT INTO Address VALUES (1, "TP. Hồ Chí Minh", "Phường Chợ Quán", "An Dương Vương", "273");
INSERT INTO Address VALUES (2, "TP. Hồ Chí Minh", "Phường Chợ Quán", "An Dương Vương", "275");
INSERT INTO Address_User VALUES (1, "0987654321", 1, "L0ngkute", "0937211264"), (2, "0987654321", 0, "0 phải L0ngg", "0937211265");