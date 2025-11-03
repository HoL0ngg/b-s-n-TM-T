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
CREATE TABLE Brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    status INT DEFAULT 1,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP,
    base_price INT,
    generic_id INT,
    sold_count INT,
    shop_id INT,
    shop_cate_id INT,
    brand_id INT,
    FOREIGN KEY (generic_id) REFERENCES Generic(id),
    FOREIGN KEY (shop_id) REFERENCES Shops(id),
    FOREIGN KEY (shop_cate_id) REFERENCES shop_categories(id),
    FOREIGN KEY (brand_id) REFERENCES Brands(id)
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

CREATE TABLE Promotions (
    id int primary key AUTO_INCREMENT,
    name varchar(255),
    value decimal,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    is_active tinyInt
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
CREATE TABLE UserViewHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10),
    product_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(phone_number),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE VIEW v_products_list AS
SELECT 
    p.id, 
    p.name, 
    p.description, 
    p.base_price, 
    p.shop_id, 
    p.generic_id,
    p.created_at,
    p.updated_at,
    p.sold_count,
    g.name AS category_name,
    
    (SELECT pi.image_url 
     FROM productimages pi 
     WHERE pi.product_id = p.id AND pi.isMain = 1 
     LIMIT 1) AS image_url,
     
    (SELECT IFNULL(AVG(pr.rating), 0) 
     FROM productreviews pr 
     WHERE pr.product_id = p.id) AS avg_rating,
     
    (p.sold_count * 0.6 + IFNULL((SELECT AVG(pr.rating) FROM productreviews pr WHERE pr.product_id = p.id), 0) * 0.4) AS hot_score
    
FROM 
    products p
JOIN 
    generic g ON g.id = p.generic_id;

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
    ),
    (
        7,
        "Đồ điện tử",
        "adudu",
        "/assets/categories/dodientu.png"
    ),
    (
        8,
        "Trang sức",
        "adudu",
        "/assets/categories/trangsuc.png"
    );
INSERT INTO generic
VALUES (1, "Son", 1),
    (2, "Phấn phủ", 1),
    (3, "Kem nền", 1),
    (4, "Quần dài", 2),
    (5, "Quần short", 2),
    (6, "Quẩn thun", 2),
    (7, "Áo sơ mi", 3),
    (8, "Giày đá banh", 4),
    (9, "Tivi", 7),
    (10, "Tủ lạnh", 7),
    (11, "Máy lạnh", 7),
    (12, "Máy giặt", 7),
    (13, "Máy sấy", 7),
    (14, "Gel trị mụn", 1),
    (15, "Tẩy tế bào chết", 1),
    (16, "Sữa rửa mặt", 6),
    (17, "Dầu gội đầu", 6),
    (18, "Vòng tay", 8);
INSERT INTO brands (name) 
VALUES
    ('Maybelline'),
    ('Adidas'),
    ('Aristino'),
    ('Romand'),
    ('3CE'),
    ('Coolmate'),
    ('Casper'),
    ('Murad'),
    ('Simple'),
    ('CLEAR MEN'),
    ('Pond\'s'),
    ('Pandora'),
    ('OFÉLIA'),
    ('L\'Oreal'),
    ('Merzy'),
    ('Cocoon');
INSERT INTO users
    VALUES ("0987654321", "hihi@gmail.com", "123456", "/assets/panda.png"), 
    ("0987654333", "coolmate@gmail.com", "123456", "/assets/bear.png"),
    ("0987654222", "casper@gmail.com", "123456", "/assets/bear.png"),
    ("0987654111", "murad@gmail.com", "123456", "/assets/bear.png"),
    ("0987654000", "unilever@gmail.com", "123456", "/assets/bear.png"),
    ("0987654444", "pandora@gmail.com", "123456", "/assets/bear.png"),
    ("0987654555", "thewhoo@gmail.com", "123456", "/assets/bear.png");


INSERT INTO user_profile 
    VALUES ("", "2005-08-25", 1, null, "0987654321"), 
        ("", "2005-08-26", 1, null, "0987654333"),
        ("", "2005-08-26", 1, null, "0987654222"),
        ("", "2005-08-26", 1, null, "0987654111"),
        ("", "2005-08-26", 1, null, "0987654444"),
        ("", "2005-08-26", 1, null, "0987654555"),
        ("", "2005-08-26", 1, null, "0987654000");

INSERT INTO shops
VALUES (
        1,
        "Thế giới skin food",
        "/assets/shops/thegioiskinfood.png",
        "Shop chuyên về mỹ phẩm",
        1,
        "2025-08-25",
        "0987654321"
    )
    ,(
        2,
        "Coolmate - Official Store",
        "/assets/shops/coolmate.webp",
        "Shop chuyên về quần áo",
        1,
        "2025-08-26",
        "0987654333"
    )
    ,(
        3,
        "Casper Official Store",
        "/assets/shops/casper.webp",
        "Shop chuyên về đồ điện tử",
        1,
        "2025-08-26",
        "0987654222"
    )
    ,(
        4,
        "Murad Vietnam Official Store",
        "/assets/shops/murad.webp",
        "Shop chuyên về quần áo",
        1,
        "2025-08-26",
        "0987654111"
    )
    ,(
        5,
        "Unilever Chăm Sóc Sắc Đẹp",
        "/assets/shops/unilever.webp",
        "",
        1,
        "2025-08-26",
        "0987654000"
    )
    ,(
        6,
        "Pandora VN",
        "/assets/shops/pandora.webp",
        "",
        1,
        "2025-08-26",
        "0987654444"
    );

INSERT INTO shop_categories 
    VALUES (1, 1, "Sản phẩm mới")
    ,(2, 2, "Sản phẩm mùa hè")
    ,(3, 3, "Sản phẩm mới")
    ,(4, 4, "Sản phẩm mới")
    ,(5, 5, "Sản phẩm mới")
    ,(6, 6, "Sản phẩm mới");

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
        8,
        20,
        1,
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
        7,
        22,
        1,
        1,
        3
    ), (
        4,
        "Quần Tây Nam Owen QS231500 màu đen dáng slim fit vải polyester OwenShop",
        "Quần tây đen",
        1,
        "2025-10-10",
        "2025-10-10",
        280000,
        4,
        50,
        1,
        1,
        3
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
        1,
        4
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
        1,
        5
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
        1,
        4
    ), (
        9,
        "Áo Polo thể thao nam ProMax S1 Logo Coolmate",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        219000,
        7,
        2192,
        2,
        1,
        6
    ), (
        10,
        "Áo Sơ Mi Dài Tay Essentials Cotton mềm mại thoáng mát Coolmate",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        271320,
        7,
        395,
        2,
        1,
        6
    )
    , (
        11,
        "Quần dài nam Kaki Excool co giãn đàn hồi Coolmate",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        389000,
        4,
        519,
        2,
        1,
        6
    )
    , (
        12,
        "[Công lắp 0Đ HCM/ HN] Smart Tivi Casper Ultra HD 4K 50inch / 55 inch - D50UGC620 / D50UGC620 - Chính hãng",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        8495000,
        9,
        372,
        3,
        1,
        7
    )
    , (
        13,
        "[Công lắp 0Đ HCM/ HN] Google Tivi Casper 43 inch - Full HD - 43FGK610 - Chính hãng - Bảo hành 2 năm",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        4390000,
        9,
        409,
        3,
        1,
        7
    )
    , (
        14,
        "Tủ lạnh 4 cánh Casper Inverter 430L RM-430PB - Ngăn đông mềm - Chính hãng - Bảo hành 2 năm",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        11115000,
        10,
        2412,
        3,
        1,
        7
    )
    , (
        15,
        "Máy lạnh/ Điều hòa Casper Inverter ProAir 1 chiều 1HP GC-09IB36 - Bảo hành 3 năm",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        5995000,
        11,
        3813,
        3,
        1,
        7
    )
    , (
        16,
        "Máy giặt cửa trên Casper 7.5KG EcoWash WT-75NG1 - Bảo hành 2 năm - Chính hãng",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        3690000,
        12,
        9239,
        3,
        1,
        7
    )
    , (
        17,
        "Máy giặt sấy Casper Prime Wash & Dry Giặt 11.5KG, Sấy 8KG - WF-P115VGT11 - Bảo hành 2 năm",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        8695000,
        12,
        519,
        3,
        1,
        7
    )
    , (
        18,
        "Máy sấy thông hơi Casper 7.2KG TD-72VWD - Chính hãng - Bảo hành 2 năm",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        5290000,
        13,
        823,
        3,
        1,
        7
    )
    , (
        19,
        "Gel chấm mụn Murad Rapid Relief Acne Treatment 15ml",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        776000,
        14,
        219,
        4,
        1,
        8
    )
    , (
        20,
        "Tẩy tế bào da chết dịu nhẹ Murad AHA/BHA Exfoliating Cleanser 148ml",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        118800,
        15,
        229,
        4,
        1,
        8
    )
    , (
        21,
        "Tinh chất hỗ trợ làm mờ vết nám Murad Rapid Dark Spot Correcting Serum 30ml",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        2371650,
        2,
        982,
        4,
        1,
        8
    )
    , (
        22,
        "[MỚI] Sữa Rửa Mặt Simple 240ml Purify+ Giảm Mụn Sau 7 Ngày, Repair+ Phục Hồi Da, Hydrate+ Giúp Da Trông Căng Mướt",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        222000,
        16,
        23123,
        5,
        1,
        9
    )
    , (
        23,
        "Dầu Gội Đầu CLEAR MEN Perfume Đánh Bay Gàu Ngứa Và Lưu Hương Nước Hoa Đẳng Cấp 600G/840G",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        184000,
        17,
        519,
        5,
        1,
        10
    )
    , (
        24,
        "Sữa rửa mặt sáng da sạch sâu Pond's Bright Miracle Niasorcinol 100G",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        78000,
        16,
        519,
        5,
        1,
        11
    )
    , (
        25,
        "Vòng Tay Pandora Moments Bạc Dây Rắn Khóa Trái Tim 590719",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        2366000,
        18,
        519,
        6,
        1,
        12
    )
    , (
        26,
        "Charm Pandora Mạ Vàng 14K Mặt Trời Ôm Mặt Trăng",
        "",
        1,
        "2025-01-10",
        "2025-10-10",
        2790000,
        18,
        519,
        6,
        1,
        12
    ),
    (
        27,
        "[SUGARPLUM BY OFÉLIA] Son Tint Lì Thuần Chay Siêu Nhẹ Môi OFÉLIA Sugarplum MistyNow Blurring Tint 3.8g",
        "",
        1,
        "2025-10-07",
        "2025-10-17",
        169000,
        1,
        2,
        1,
        1,
        13
    ),(
        28,
        "Son Kem Lì L'Oreal Nhẹ Môi, Lâu Trôi Infallible Matte Resistance",
        "",
        1,
        "2025-10-07",
        "2025-10-17",
        289000,
        1,
        2,
        1,
        1,
        14
    ),(
        29,
        "Son Kem Lì, Mịn Mượt Nhẹ Môi L’Oreal Paris Chiffon Signature Matte Liquid Lipstick",
        "",
        1,
        "2025-10-07",
        "2025-10-17",
        259000,
        1,
        2,
        1,
        1,
        14
    ),(
        30,
        "Son Kem Lì Merzy Bền Màu, Lâu Trôi Puffer Velvet Tint 3.7g",
        "",
        1,
        "2025-10-07",
        "2025-10-17",
        209000,
        1,
        7,
        1,
        1,
        15
    ),(
        31,
        "Son Dưỡng Môi Cocoon Chiết Xuất Dầu Dừa Bến Tre Ben Tre Coconut Lip Balm",
        "",
        1,
        "2025-10-07",
        "2025-10-17",
        54000,
        1,
        10,
        1,
        1,
        16
    ),(
        32,
        "Son Kem Merzy Siêu Lì, Lâu Trôi, Lên Màu Chuẩn Academia Mellow Tint 4g",
        "",
        1,
        "2025-10-07",
        "2025-10-17",
        144000,
        1,
        17,
        1,
        1,
        15
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
        (35, "/assets/products/quan kaki1.6.webp", 11, 0),
        (36, "/assets/products/tivi1.1.webp", 12, 1),
        (37, "/assets/products/tivi1.2.webp", 12, 0),
        (38, "/assets/products/tivi1.3.webp", 12, 0),
        (39, "/assets/products/tivi1.4.webp", 12, 0),
        (40, "/assets/products/tivi2.1.webp", 13, 1),
        (41, "/assets/products/tivi2.2.webp", 13, 0),
        (42, "/assets/products/tivi2.3.webp", 13, 0),
        (43, "/assets/products/tivi2.4.webp", 13, 0),
        (44, "/assets/products/tulanh1.1.webp", 14, 1),
        (45, "/assets/products/tulanh1.2.webp", 14, 0),
        (46, "/assets/products/tulanh1.3.webp", 14, 0),
        (47, "/assets/products/tulanh1.4.webp", 14, 0),
        (48, "/assets/products/tulanh1.5.webp", 14, 0),
        (49, "/assets/products/tulanh1.6.webp", 14, 0),
        (50, "/assets/products/maylanh1.1.webp", 15, 1),
        (51, "/assets/products/maylanh1.2.webp", 15, 0),
        (52, "/assets/products/maylanh1.3.webp", 15, 0),
        (53, "/assets/products/maylanh1.4.webp", 15, 0),
        (54, "/assets/products/maylanh1.5.webp", 15, 0),
        (55, "/assets/products/maygiat1.1.webp", 16, 1),
        (56, "/assets/products/maygiat1.2.webp", 16, 0),
        (57, "/assets/products/maygiat1.3.webp", 16, 0),
        (58, "/assets/products/maygiat1.4.webp", 16, 0),
        (59, "/assets/products/maygiat1.5.webp", 16, 0),
        (60, "/assets/products/maygiat2.1.webp", 17, 1),
        (61, "/assets/products/maygiat2.2.webp", 17, 0),
        (62, "/assets/products/maygiat2.3.webp", 17, 0),
        (63, "/assets/products/maygiat2.4.webp", 17, 0),
        (64, "/assets/products/maygiat2.5.webp", 17, 0),
        (65, "/assets/products/maysay1.1.webp", 18, 1),
        (66, "/assets/products/maysay1.2.webp", 18, 0),
        (67, "/assets/products/maysay1.3.webp", 18, 0),
        (68, "/assets/products/maysay1.4.webp", 18, 0),
        (69, "/assets/products/maysay1.5.webp", 18, 0),
        (70, "/assets/products/gelchammun1.1.webp", 19, 1),
        (71, "/assets/products/gelchammun1.2.webp", 19, 0),
        (72, "/assets/products/gelchammun1.3.webp", 19, 0),
        (73, "/assets/products/gelchammun1.4.webp", 19, 0),
        (74, "/assets/products/gelchammun1.5.webp", 19, 0),
        (75, "/assets/products/gelchammun1.6.webp", 19, 0),
        (76, "/assets/products/taytebaochet1.1.webp", 20, 1),
        (77, "/assets/products/taytebaochet1.2.webp", 20, 0),
        (78, "/assets/products/taytebaochet1.3.webp", 20, 0),
        (79, "/assets/products/taytebaochet1.4.webp", 20, 0),
        (80, "/assets/products/tinhchat1.1.webp", 21, 1),
        (81, "/assets/products/tinhchat1.2.webp", 21, 0),
        (82, "/assets/products/tinhchat1.3.webp", 21, 0),
        (83, "/assets/products/tinhchat1.4.webp", 21, 0),
        (84, "/assets/products/tinhchat1.5.webp", 21, 0),
        (85, "/assets/products/suaruamat1.1.webp", 22, 1),
        (86, "/assets/products/suaruamat1.2.webp", 22, 0),
        (87, "/assets/products/suaruamat1.3.webp", 22, 0),
        (88, "/assets/products/suaruamat1.4.webp", 22, 0),
        (89, "/assets/products/suaruamat1.5.webp", 22, 0),
        (90, "/assets/products/suaruamat1.6.webp", 22, 0),
        (91, "/assets/products/daugoidau1.1.webp", 23, 1),
        (92, "/assets/products/daugoidau1.2.webp", 23, 0),
        (93, "/assets/products/daugoidau1.3.webp", 23, 0),
        (94, "/assets/products/daugoidau1.4.webp", 23, 0),
        (95, "/assets/products/daugoidau1.5.webp", 23, 0),
        (96, "/assets/products/suaruamat2.1.webp", 24, 1),
        (97, "/assets/products/suaruamat2.2.webp", 24, 0),
        (98, "/assets/products/suaruamat2.3.webp", 24, 0),
        (99, "/assets/products/suaruamat2.4.webp", 24, 0),
        (100, "/assets/products/suaruamat2.5.webp", 24, 0),
        (101, "/assets/products/vongtay1.1.webp", 25, 1),
        (102, "/assets/products/vongtay1.2.webp", 25, 0),
        (103, "/assets/products/vongtay1.3.webp", 25, 0),
        (104, "/assets/products/charm1.1.webp", 26, 1),
        (105, "/assets/products/charm1.2.webp", 26, 0),
        (106, "/assets/products/charm1.3.webp", 26, 0),
        (107, "/assets/products/charm1.4.webp", 26, 0),
        (108, "/assets/products/son6.jpg", 27, 1),
        (109, "/assets/products/son6.1.jpg", 27, 0),
        (110, "/assets/products/son6.2.jpg", 27, 0),
        (111, "/assets/products/son6.3.jpg", 27, 0),
        (112, "/assets/products/son7.jpg", 28, 1),
        (113, "/assets/products/son7.1.jpg", 28, 0),
        (114, "/assets/products/son7.2.jpg", 28, 0),
        (115, "/assets/products/son7.3.jpg", 28, 0),
        (116, "/assets/products/son7.4.jpg", 28, 0),
        (117, "/assets/products/son8.jpg", 29, 1),
        (118, "/assets/products/son8.1.jpg", 29, 0),
        (119, "/assets/products/son8.2.jpg", 29, 0),
        (120, "/assets/products/son9.jpg", 30, 1),
        (121, "/assets/products/son9.1.jpg", 30, 0),
        (122, "/assets/products/son9.2.jpg", 30, 0),
        (123, "/assets/products/son10.jpeg", 31, 1),
        (124, "/assets/products/son10.1.jpg", 31, 0), 
        (125, "/assets/products/son11.jpg", 32, 1), 
        (126, "/assets/products/son11.1.jpg", 32, 0), 
        (127, "/assets/products/son11.2.jpg", 32, 0), 
        (128, "/assets/products/son11.3.jpg", 32, 0), 
        (129, "/assets/products/son11.4.jpg", 32, 0);
        
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
(26, 11, 389000, 1, 'hjhj'),
(27, 12, 8495000, 1, 'hjhj'),
(28, 13, 4390000, 1, 'hjhj'),
(29, 14, 11115000, 1, 'hjhj'),
(30, 15, 5995000, 1, 'hjhj'),
(31, 16, 3690000, 1, 'hjhj'),
(32, 17, 8695000, 1, 'hjhj'),
(33, 18, 5290000, 1, 'hjhj'),
(34, 19, 776000, 1, 'hjhj'),
(35, 20, 118800, 1, 'hjhj'),
(36, 21, 2371650, 1, 'hjhj'),
(37, 22, 222000, 1, 'hjhj'),
(38, 23, 184000, 1, 'hjhj'),
(39, 24, 78000, 1, 'hjhj'),
(40, 25, 2366000, 1, 'hjhj'),
(41, 26, 2790000, 1, 'hjhj');

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