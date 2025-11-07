drop database basan;
CREATE database basan;
use basan;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 05, 2025 lúc 05:59 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `basan`
--
CREATE DATABASE IF NOT EXISTS `basan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `basan`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `address`
--

DROP TABLE IF EXISTS `address`;
CREATE TABLE IF NOT EXISTS `address` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city` varchar(255) DEFAULT NULL,
  `ward` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `home_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `address`
--

INSERT INTO `address` (`id`, `city`, `ward`, `street`, `home_number`) VALUES
(1, 'TP. Hồ Chí Minh', 'Phường Chợ Quán', 'An Dương Vương', '273'),
(2, 'TP. Hồ Chí Minh', 'Phường Chợ Quán', 'An Dương Vương', '275');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `address_user`
--

DROP TABLE IF EXISTS `address_user`;
CREATE TABLE IF NOT EXISTS `address_user` (
  `address_id` int(11) DEFAULT NULL,
  `phone_number` varchar(10) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `phone_number_jdo` varchar(10) DEFAULT NULL,
  KEY `address_id` (`address_id`),
  KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `address_user`
--

INSERT INTO `address_user` (`address_id`, `phone_number`, `is_default`, `user_name`, `phone_number_jdo`) VALUES
(1, '0987654321', 1, 'L0ngkute', '0937211264'),
(2, '0987654321', 0, '0 phải L0ngg', '0937211265');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brands`
--

DROP TABLE IF EXISTS `brands`;
CREATE TABLE IF NOT EXISTS `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `brands`
--

INSERT INTO `brands` (`id`, `name`) VALUES
(1, 'Maybelline'),
(2, 'Adidas'),
(3, 'Aristino'),
(4, 'Romand'),
(5, '3CE'),
(6, 'Coolmate'),
(7, 'Casper'),
(8, 'Murad'),
(9, 'Simple'),
(10, 'CLEAR MEN'),
(11, 'Pond\'s'),
(12, 'Pandora'),
(13, 'OFÉLIA'),
(14, 'L\'Oreal'),
(15, 'Merzy'),
(16, 'Cocoon');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `user_id` varchar(10) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `added_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`product_variant_id`),
  KEY `product_variant_id` (`product_variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `img_url`) VALUES
(1, 'Mỹ phẩm', 'Danh mục Mỹ phẩm bao gồm các sản phẩm chăm sóc da, trang điểm và làm đẹp dành cho mọi lứa tuổi. Tất cả sản phẩm đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng, an toàn cho người dùng và giúp bạn tỏa sáng tự nhiên mỗi ngày.', '/assets/categories/my pham.jpg'),
(2, 'Quần', 'Danh mục Quần mang đến nhiều kiểu dáng hiện đại và thoải mái như quần jeans, quần tây, quần kaki, legging và jogger. Chất liệu đa dạng, form dáng chuẩn, phù hợp cho cả đi làm, đi học và dạo phố, giúp bạn tự tin thể hiện phong cách riêng.', '/assets/categories/quan.jpg'),
(3, 'Áo', 'Danh mục Áo gồm nhiều lựa chọn thời trang như áo thun, áo sơ mi, áo khoác, áo len và áo polo. Các sản phẩm được thiết kế tinh tế, chất liệu thoáng mát, dễ phối đồ và phù hợp cho mọi hoàn cảnh — từ công sở đến đi chơi.', '/assets/categories/ao.jpg'),
(4, 'Giày', 'Danh mục Giày cung cấp các mẫu giày thời trang, năng động và thoải mái như giày thể thao, giày da, giày cao gót và dép sandal. Với thiết kế hiện đại, bền đẹp và êm ái, sản phẩm giúp bạn di chuyển tự tin và hoàn thiện phong cách thời trang cá nhân.', '/assets/categories/giay.webp'),
(5, 'Laptop', 'Adudu', '/assets/categories/laptop.jpg'),
(6, 'Sức khỏe', 'adudu', '/assets/categories/suckhoe.png'),
(7, 'Đồ điện tử', 'adudu', '/assets/categories/dodientu.png'),
(8, 'Trang sức', 'adudu', '/assets/categories/trangsuc.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `generic`
--

DROP TABLE IF EXISTS `generic`;
CREATE TABLE IF NOT EXISTS `generic` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `generic`
--

INSERT INTO `generic` (`id`, `name`, `category_id`) VALUES
(1, 'Son', 1),
(2, 'Phấn phủ', 1),
(3, 'Kem nền', 1),
(4, 'Quần dài', 2),
(5, 'Quần short', 2),
(6, 'Quẩn thun', 2),
(7, 'Áo sơ mi', 3),
(8, 'Giày đá banh', 4),
(9, 'Tivi', 7),
(10, 'Tủ lạnh', 7),
(11, 'Máy lạnh', 7),
(12, 'Máy giặt', 7),
(13, 'Máy sấy', 7),
(14, 'Gel trị mụn', 1),
(15, 'Tẩy tế bào chết', 1),
(16, 'Sữa rửa mặt', 6),
(17, 'Dầu gội đầu', 6),
(18, 'Vòng tay', 8);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(10) NOT NULL,
  `address_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_fee` decimal(10,2) DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) DEFAULT 'Unpaid',
  `order_date` datetime NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `address_id`, `total_amount`, `shipping_fee`, `status`, `payment_method`, `payment_status`, `order_date`, `notes`) VALUES
(1, '0987654333', 1, 736000.00, 0.00, 'Shipped', 'COD', 'Unpaid', '2025-11-05 20:16:05', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `variant_id`, `product_name`, `quantity`, `price_at_purchase`, `subtotal`) VALUES
(1, 1, 1, 1, 'Son Kem Bóng Maybelline', 2, 228000.00, 456000.00),
(2, 1, 4, 19, 'Quần Tây Nam Owen', 1, 280000.00, 280000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productimages`
--

DROP TABLE IF EXISTS `productimages`;
CREATE TABLE IF NOT EXISTS `productimages` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL,
  `product_id` int(11) NOT NULL,
  `isMain` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `productimages`
--

INSERT INTO `productimages` (`image_id`, `image_url`, `product_id`, `is_main`) VALUES
(1, '/assets/products/son1.jpg', 1, 1),
(2, '/assets/products/giay1.webp', 2, 1),
(3, '/assets/products/ao1.webp', 3, 1),
(4, '/assets/products/quan1.webp', 4, 1),
(5, '/assets/products/son1.1.jpg', 1, 0),
(6, '/assets/products/son1.2.jpg', 1, 0),
(7, '/assets/products/son1.3.jpg', 1, 0),
(8, '/assets/products/son2.jpg', 5, 1),
(9, '/assets/products/son2.1.jpg', 5, 0),
(10, '/assets/products/son3.jpg', 6, 1),
(11, '/assets/products/son3.1.jpg', 6, 0),
(12, '/assets/products/son3.2.jpg', 6, 0),
(13, '/assets/products/son3.3.jpg', 6, 0),
(14, '/assets/products/son3.4.jpg', 6, 0),
(15, '/assets/products/son4.jpg', 7, 1),
(16, '/assets/products/son4.1.jpeg', 7, 0),
(17, '/assets/products/son4.2.jpeg', 7, 0),
(18, '/assets/products/son5.jpg', 8, 1),
(19, '/assets/products/son5.1.jpg', 8, 0),
(20, '/assets/products/ao polo 1.webp', 9, 1),
(21, '/assets/products/ao polo1.1.webp', 9, 0),
(22, '/assets/products/ao polo1.2.webp', 9, 0),
(23, '/assets/products/ao polo1.3', 9, 0),
(24, '/assets/products/ao polo1.4.webp', 9, 0),
(25, '/assets/products/ao somi 1.webp', 10, 1),
(26, '/assets/products/ao somi1.1.webp', 10, 0),
(27, '/assets/products/ao somi1.2.webp', 10, 0),
(28, '/assets/products/ao somi1.3.webp', 10, 0),
(29, '/assets/products/quan kaki 1.webp', 11, 1),
(30, '/assets/products/quan kaki1.1.webp', 11, 0),
(31, '/assets/products/quan kaki1.2.webp', 11, 0),
(32, '/assets/products/quan kaki1.3.webp', 11, 0),
(33, '/assets/products/quan kaki1.4.webp', 11, 0),
(34, '/assets/products/quan kaki1.5.webp', 11, 0),
(35, '/assets/products/quan kaki1.6.webp', 11, 0),
(36, '/assets/products/tivi1.1.webp', 12, 1),
(37, '/assets/products/tivi1.2.webp', 12, 0),
(38, '/assets/products/tivi1.3.webp', 12, 0),
(39, '/assets/products/tivi1.4.webp', 12, 0),
(40, '/assets/products/tivi2.1.webp', 13, 1),
(41, '/assets/products/tivi2.2.webp', 13, 0),
(42, '/assets/products/tivi2.3.webp', 13, 0),
(43, '/assets/products/tivi2.4.webp', 13, 0),
(44, '/assets/products/tulanh1.1.webp', 14, 1),
(45, '/assets/products/tulanh1.2.webp', 14, 0),
(46, '/assets/products/tulanh1.3.webp', 14, 0),
(47, '/assets/products/tulanh1.4.webp', 14, 0),
(48, '/assets/products/tulanh1.5.webp', 14, 0),
(49, '/assets/products/tulanh1.6.webp', 14, 0),
(50, '/assets/products/maylanh1.1.webp', 15, 1),
(51, '/assets/products/maylanh1.2.webp', 15, 0),
(52, '/assets/products/maylanh1.3.webp', 15, 0),
(53, '/assets/products/maylanh1.4.webp', 15, 0),
(54, '/assets/products/maylanh1.5.webp', 15, 0),
(55, '/assets/products/maygiat1.1.webp', 16, 1),
(56, '/assets/products/maygiat1.2.webp', 16, 0),
(57, '/assets/products/maygiat1.3.webp', 16, 0),
(58, '/assets/products/maygiat1.4.webp', 16, 0),
(59, '/assets/products/maygiat1.5.webp', 16, 0),
(60, '/assets/products/maygiat2.1.webp', 17, 1),
(61, '/assets/products/maygiat2.2.webp', 17, 0),
(62, '/assets/products/maygiat2.3.webp', 17, 0),
(63, '/assets/products/maygiat2.4.webp', 17, 0),
(64, '/assets/products/maygiat2.5.webp', 17, 0),
(65, '/assets/products/maysay1.1.webp', 18, 1),
(66, '/assets/products/maysay1.2.webp', 18, 0),
(67, '/assets/products/maysay1.3.webp', 18, 0),
(68, '/assets/products/maysay1.4.webp', 18, 0),
(69, '/assets/products/maysay1.5.webp', 18, 0),
(70, '/assets/products/gelchammun1.1.webp', 19, 1),
(71, '/assets/products/gelchammun1.2.webp', 19, 0),
(72, '/assets/products/gelchammun1.3.webp', 19, 0),
(73, '/assets/products/gelchammun1.4.webp', 19, 0),
(74, '/assets/products/gelchammun1.5.webp', 19, 0),
(75, '/assets/products/gelchammun1.6.webp', 19, 0),
(76, '/assets/products/taytebaochet1.1.webp', 20, 1),
(77, '/assets/products/taytebaochet1.2.webp', 20, 0),
(78, '/assets/products/taytebaochet1.3.webp', 20, 0),
(79, '/assets/products/taytebaochet1.4.webp', 20, 0),
(80, '/assets/products/tinhchat1.1.webp', 21, 1),
(81, '/assets/products/tinhchat1.2.webp', 21, 0),
(82, '/assets/products/tinhchat1.3.webp', 21, 0),
(83, '/assets/products/tinhchat1.4.webp', 21, 0),
(84, '/assets/products/tinhchat1.5.webp', 21, 0),
(85, '/assets/products/suaruamat1.1.webp', 22, 1),
(86, '/assets/products/suaruamat1.2.webp', 22, 0),
(87, '/assets/products/suaruamat1.3.webp', 22, 0),
(88, '/assets/products/suaruamat1.4.webp', 22, 0),
(89, '/assets/products/suaruamat1.5.webp', 22, 0),
(90, '/assets/products/suaruamat1.6.webp', 22, 0),
(91, '/assets/products/daugoidau1.1.webp', 23, 1),
(92, '/assets/products/daugoidau1.2.webp', 23, 0),
(93, '/assets/products/daugoidau1.3.webp', 23, 0),
(94, '/assets/products/daugoidau1.4.webp', 23, 0),
(95, '/assets/products/daugoidau1.5.webp', 23, 0),
(96, '/assets/products/suaruamat2.1.webp', 24, 1),
(97, '/assets/products/suaruamat2.2.webp', 24, 0),
(98, '/assets/products/suaruamat2.3.webp', 24, 0),
(99, '/assets/products/suaruamat2.4.webp', 24, 0),
(100, '/assets/products/suaruamat2.5.webp', 24, 0),
(101, '/assets/products/vongtay1.1.webp', 25, 1),
(102, '/assets/products/vongtay1.2.webp', 25, 0),
(103, '/assets/products/vongtay1.3.webp', 25, 0),
(104, '/assets/products/charm1.1.webp', 26, 1),
(105, '/assets/products/charm1.2.webp', 26, 0),
(106, '/assets/products/charm1.3.webp', 26, 0),
(107, '/assets/products/charm1.4.webp', 26, 0),
(108, '/assets/products/son6.jpg', 27, 1),
(109, '/assets/products/son6.1.jpg', 27, 0),
(110, '/assets/products/son6.2.jpg', 27, 0),
(111, '/assets/products/son6.3.jpg', 27, 0),
(112, '/assets/products/son7.jpg', 28, 1),
(113, '/assets/products/son7.1.jpg', 28, 0),
(114, '/assets/products/son7.2.jpg', 28, 0),
(115, '/assets/products/son7.3.jpg', 28, 0),
(116, '/assets/products/son7.4.jpg', 28, 0),
(117, '/assets/products/son8.jpg', 29, 1),
(118, '/assets/products/son8.1.jpg', 29, 0),
(119, '/assets/products/son8.2.jpg', 29, 0),
(120, '/assets/products/son9.jpg', 30, 1),
(121, '/assets/products/son9.1.jpg', 30, 0),
(122, '/assets/products/son9.2.jpg', 30, 0),
(123, '/assets/products/son10.jpeg', 31, 1),
(124, '/assets/products/son10.1.jpg', 31, 0),
(125, '/assets/products/son11.jpg', 32, 1),
(126, '/assets/products/son11.1.jpg', 32, 0),
(127, '/assets/products/son11.2.jpg', 32, 0),
(128, '/assets/products/son11.3.jpg', 32, 0),
(129, '/assets/products/son11.4.jpg', 32, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productreviews`
--

DROP TABLE IF EXISTS `productreviews`;
CREATE TABLE IF NOT EXISTS `productreviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `user_id` varchar(10) NOT NULL,
  `product_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `productreviews`
--

INSERT INTO `productreviews` (`id`, `rating`, `comment`, `created_at`, `user_id`, `product_id`) VALUES
(1, 4, 'Dùng cũn ngon đấy iem', '2025-10-20 00:00:00', '0987654321', 1),
(2, 3, 'Tạm được đấy iem', '2025-10-20 00:00:00', '0987654321', 3),
(3, 5, 'SIUUUUUUUUUU', '2025-10-20 00:00:00', '0987654321', 2),
(4, 5, 'MU 2 - 1 Liver', '2025-10-20 00:00:00', '0987654321', 2),
(5, 4, 'Hơi chật đấy iem', '2025-10-20 00:00:00', '0987654321', 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_at` date DEFAULT current_timestamp(),
  `updated_at` date DEFAULT current_timestamp(),
  `base_price` int(11) DEFAULT NULL,
  `generic_id` int(11) DEFAULT NULL,
  `sold_count` int(11) DEFAULT NULL,
  `shop_id` int(11) DEFAULT NULL,
  `shop_cate_id` int(11) DEFAULT NULL,
  `brand_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `generic_id` (`generic_id`),
  KEY `shop_id` (`shop_id`),
  KEY `shop_cate_id` (`shop_cate_id`),
  KEY `brand_id` (`brand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`, `base_price`, `generic_id`, `sold_count`, `shop_id`, `shop_cate_id`, `brand_id`) VALUES
(1, 'Son Kem Bóng Maybelline Bền Màu, Nhẹ Môi New York Superstay Vinyl Ink 4.2ml', 'Son Kem Bóng Bền Màu, Nhẹ Môi Maybelline New York Superstay Vinyl Ink 4.2ml là son kem lì đến từ thương hiệu Maybelline chứa công thức đột phá mới với công nghệ “khóa” màu thách thức lem trôi, nhẹ mướt, để lại lớp bóng nhẹ tinh tế, cho đôi môi căng tràn sức sống. Son bóng lên màu chuẩn, nhưng vẫn duy trì độ ẩm và giữ được sự mềm mịn cho môi.', 1, '2025-01-10', '2025-10-10', 228000, 1, 100, 1, 1, 1),
(2, 'Giày Đá Banh Adidas X Crazyfast.1 Messi Xanh Biển Hồng Thể Thao Uni', 'Giày đá banh, mang vô đá như Messi', 1, '2025-08-10', '2025-10-10', 2128000, 8, 20, 1, 1, 2),
(3, 'Áo Sơ Mi Nam Tay Dài Aristino OwenShop', 'Áo sơ mi trắng', 1, '2025-02-10', '2025-10-10', 1128000, 7, 22, 1, 1, 3),
(4, 'Quần Tây Nam Owen QS231500 màu đen dáng slim fit vải polyester OwenShop', 'Quần tây đen', 1, '2025-10-10', '2025-10-10', 280000, 4, 50, 1, 1, 3),
(5, '[DUSTY ON THE NUDE] Son Dưỡng Dạng Thỏi Có Màu Thuần Chay Romand Glasting Melting Balm 3.5g', 'Son Dưỡng Thuần Chay Romand Glasting Melting Balm là son thỏi màu có dưỡng đến từ thương hiệu Romand với tinh chất dầu thực vật thuần chay cùng chất son siêu nhẹ môi có độ dưỡng cao, giúp dưỡng ẩm cho đôi môi mềm mại, căng mọng tự nhiên trong thời gian dài.', 1, '2025-01-10', '2025-10-10', 199000, 1, 10, 1, 1, 4),
(6, 'Son Kem Lì Bông Maybelline Bền Màu Superstay Teddy Tint 5ml', 'Son Kem Lì Bông Bền Màu Maybelline Superstay Teddy Tint là son kem lì nằm trong bộ sưu tập gấu hồng Teddy đáng yêu của thương hiệu Maybelline với công nghệ bồng bềnh Teddy Fluff siêu mềm mịn cho môi. Cùng với bảng màu son ngọt ngào có thể tô mờ hoặc tô đậm trên môi mang đến hiệu ứng mờ lì, căng mịn, cho môi sắc sảo.', 1, '2025-01-10', '2025-10-10', 218000, 1, 12, 1, 1, 1),
(7, 'Son Thỏi 3CE Mịn Lì, Mềm Môi Cashmere Hug Lipstick 3.5g', 'Son Thỏi Mịn Lì, Mềm Môi 3CE Cashmere Hug Lipstick là son thỏi đến từ thương hiệu 3CE. Chất son matte mịn mờ, lướt nhẹ trên môi, mang lại cảm giác thoải mái, nhẹ môi suốt cả ngày. Màu lên chuẩn ngay từ lần quẹt đầu tiên. Thiết kế vỏ son nhám, có vân sọc cầm chắc tay, độc đáo, sang trọng.', 1, '2025-01-10', '2025-10-10', 369000, 1, 2, 1, 1, 5),
(8, 'Son Thỏi Bóng Căng Mọng, Mềm Môi Romand Sheer Tinted Stick 2g', 'Son Thỏi Bóng Căng Mọng, Mềm Môi Romand Sheer Tinted Stick là son thỏi đến từ thương hiệu Romand. Chất son trong trẻo, lớp bóng mỏng và độ sáng trong mang đến cho bạn môi căng mịn như miếng thạch. Có độ lên màu ngay từ lần chạm đầu tiên và giữ màu lâu. Thành phần chiết xuất thiên nhiên có độ dưỡng ẩm sâu, mang đến môi căng mịn, mà không gây dính môi.', 1, '2025-01-10', '2025-10-10', 199000, 1, 42, 1, 1, 4),
(9, 'Áo Polo thể thao nam ProMax S1 Logo Coolmate', '', 1, '2025-01-10', '2025-10-10', 219000, 7, 2192, 2, 1, 6),
(10, 'Áo Sơ Mi Dài Tay Essentials Cotton mềm mại thoáng mát Coolmate', '', 1, '2025-01-10', '2025-10-10', 271320, 7, 395, 2, 1, 6),
(11, 'Quần dài nam Kaki Excool co giãn đàn hồi Coolmate', '', 1, '2025-01-10', '2025-10-10', 389000, 4, 519, 2, 1, 6),
(12, '[Công lắp 0Đ HCM/ HN] Smart Tivi Casper Ultra HD 4K 50inch / 55 inch - D50UGC620 / D50UGC620 - Chính hãng', '', 1, '2025-01-10', '2025-10-10', 8495000, 9, 372, 3, 1, 7),
(13, '[Công lắp 0Đ HCM/ HN] Google Tivi Casper 43 inch - Full HD - 43FGK610 - Chính hãng - Bảo hành 2 năm', '', 1, '2025-01-10', '2025-10-10', 4390000, 9, 409, 3, 1, 7),
(14, 'Tủ lạnh 4 cánh Casper Inverter 430L RM-430PB - Ngăn đông mềm - Chính hãng - Bảo hành 2 năm', '', 1, '2025-01-10', '2025-10-10', 11115000, 10, 2412, 3, 1, 7),
(15, 'Máy lạnh/ Điều hòa Casper Inverter ProAir 1 chiều 1HP GC-09IB36 - Bảo hành 3 năm', '', 1, '2025-01-10', '2025-10-10', 5995000, 11, 3813, 3, 1, 7),
(16, 'Máy giặt cửa trên Casper 7.5KG EcoWash WT-75NG1 - Bảo hành 2 năm - Chính hãng', '', 1, '2025-01-10', '2025-10-10', 3690000, 12, 9239, 3, 1, 7),
(17, 'Máy giặt sấy Casper Prime Wash & Dry Giặt 11.5KG, Sấy 8KG - WF-P115VGT11 - Bảo hành 2 năm', '', 1, '2025-01-10', '2025-10-10', 8695000, 12, 519, 3, 1, 7),
(18, 'Máy sấy thông hơi Casper 7.2KG TD-72VWD - Chính hãng - Bảo hành 2 năm', '', 1, '2025-01-10', '2025-10-10', 5290000, 13, 823, 3, 1, 7),
(19, 'Gel chấm mụn Murad Rapid Relief Acne Treatment 15ml', '', 1, '2025-01-10', '2025-10-10', 776000, 14, 219, 4, 1, 8),
(20, 'Tẩy tế bào da chết dịu nhẹ Murad AHA/BHA Exfoliating Cleanser 148ml', '', 1, '2025-01-10', '2025-10-10', 118800, 15, 229, 4, 1, 8),
(21, 'Tinh chất hỗ trợ làm mờ vết nám Murad Rapid Dark Spot Correcting Serum 30ml', '', 1, '2025-01-10', '2025-10-10', 2371650, 2, 982, 4, 1, 8),
(22, '[MỚI] Sữa Rửa Mặt Simple 240ml Purify+ Giảm Mụn Sau 7 Ngày, Repair+ Phục Hồi Da, Hydrate+ Giúp Da Trông Căng Mướt', '', 1, '2025-01-10', '2025-10-10', 222000, 16, 23123, 5, 1, 9),
(23, 'Dầu Gội Đầu CLEAR MEN Perfume Đánh Bay Gàu Ngứa Và Lưu Hương Nước Hoa Đẳng Cấp 600G/840G', '', 1, '2025-01-10', '2025-10-10', 184000, 17, 519, 5, 1, 10),
(24, 'Sữa rửa mặt sáng da sạch sâu Pond\'s Bright Miracle Niasorcinol 100G', '', 1, '2025-01-10', '2025-10-10', 78000, 16, 519, 5, 1, 11),
(25, 'Vòng Tay Pandora Moments Bạc Dây Rắn Khóa Trái Tim 590719', '', 1, '2025-01-10', '2025-10-10', 2366000, 18, 519, 6, 1, 12),
(26, 'Charm Pandora Mạ Vàng 14K Mặt Trời Ôm Mặt Trăng', '', 1, '2025-01-10', '2025-10-10', 2790000, 18, 519, 6, 1, 12),
(27, '[SUGARPLUM BY OFÉLIA] Son Tint Lì Thuần Chay Siêu Nhẹ Môi OFÉLIA Sugarplum MistyNow Blurring Tint 3.8g', '', 1, '2025-10-07', '2025-10-17', 169000, 1, 2, 1, 1, 13),
(28, 'Son Kem Lì L\'Oreal Nhẹ Môi, Lâu Trôi Infallible Matte Resistance', '', 1, '2025-10-07', '2025-10-17', 289000, 1, 2, 1, 1, 14),
(29, 'Son Kem Lì, Mịn Mượt Nhẹ Môi L’Oreal Paris Chiffon Signature Matte Liquid Lipstick', '', 1, '2025-10-07', '2025-10-17', 259000, 1, 2, 1, 1, 14),
(30, 'Son Kem Lì Merzy Bền Màu, Lâu Trôi Puffer Velvet Tint 3.7g', '', 1, '2025-10-07', '2025-10-17', 209000, 1, 7, 1, 1, 15),
(31, 'Son Dưỡng Môi Cocoon Chiết Xuất Dầu Dừa Bến Tre Ben Tre Coconut Lip Balm', '', 1, '2025-10-07', '2025-10-17', 54000, 1, 10, 1, 1, 16),
(32, 'Son Kem Merzy Siêu Lì, Lâu Trôi, Lên Màu Chuẩn Academia Mellow Tint 4g', '', 1, '2025-10-07', '2025-10-17', 144000, 1, 17, 1, 1, 15);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productvariants`
--

DROP TABLE IF EXISTS `productvariants`;
CREATE TABLE IF NOT EXISTS `productvariants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
  `image_url` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `productvariants`
--

INSERT INTO `productvariants` (`id`, `product_id`, `price`, `stock`, `sku`, `image_url`) VALUES
(1, 1, 228000, 50, 'MBL-DO-4ML', "/assets/products/son1.3.jpg"),
(2, 1, 233000, 60, 'MBL-HONG-4ML', ""),
(3, 1, 223000, 40, 'MBL-CAM-4ML', ""),
(4, 2, 2128000, 10, 'ADID-XANH-38', ""),
(5, 2, 2138000, 8, 'ADID-XANH-39', ""),
(6, 2, 2148000, 6, 'ADID-XANH-40', ""),
(7, 2, 2148000, 12, 'ADID-HONG-38', ""),
(8, 2, 2158000, 9, 'ADID-HONG-39', ""),
(9, 2, 2168000, 7, 'ADID-HONG-40', ""),
(10, 3, 1128000, 19, 'AST-TRANG-S', ""),
(11, 3, 1138000, 18, 'AST-TRANG-M', ""),
(12, 3, 1148000, 15, 'AST-TRANG-L', ""),
(13, 3, 1133000, 22, 'AST-DEN-S', ""),
(14, 3, 1143000, 19, 'AST-DEN-M', ""),
(15, 3, 1153000, 14, 'AST-DEN-L', ""),
(16, 3, 1138000, 16, 'AST-XANH-S', ""),
(17, 3, 1148000, 14, 'AST-XANH-M', ""),
(18, 3, 1158000, 12, 'AST-XANH-L', ""),
(19, 4, 280000, 2, 'hjhj', ""),
(20, 5, 199000, 10, 'hjhj', ""),
(21, 6, 218000, 69, 'hjhj', ""),
(22, 7, 369000, 2, 'hjhj', ""),
(23, 8, 199000, 2, 'hjhj', ""),
(24, 9, 219000, 2, 'hjhj', ""),
(25, 10, 271320, 2, 'hjhj', ""),
(26, 11, 389000, 1, 'hjhj', ""),
(27, 12, 8495000, 1, 'hjhj', ""),
(28, 13, 4390000, 1, 'hjhj', ""),
(29, 14, 11115000, 1, 'hjhj', ""),
(30, 15, 5995000, 1, 'hjhj', ""),
(31, 16, 3690000, 1, 'hjhj', ""),
(32, 17, 8695000, 1, 'hjhj', ""),
(33, 18, 5290000, 1, 'hjhj', ""),
(34, 19, 776000, 1, 'hjhj', ""),
(35, 20, 118800, 1, 'hjhj', ""),
(36, 21, 2371650, 1, 'hjhj', ""),
(37, 22, 222000, 1, 'hjhj', ""),
(38, 23, 184000, 1, 'hjhj', ""),
(39, 24, 78000, 1, 'hjhj', ""),
(40, 25, 2366000, 1, 'hjhj', ""),
(41, 26, 2790000, 1, 'hjhj', "");

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE IF NOT EXISTS `product_attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_attributes`
--

INSERT INTO `product_attributes` (`id`, `name`) VALUES
(1, 'Màu sắc'),
(2, 'Kích thước'),
(3, 'Dung tích'),
(4, 'Tone da');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_detail`
--

DROP TABLE IF EXISTS `product_detail`;
CREATE TABLE IF NOT EXISTS `product_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `attribute` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_detail`
--

INSERT INTO `product_detail` (`id`, `product_id`, `attribute`, `value`) VALUES
(1, 1, 'Thương hiệu', 'Maybelline'),
(2, 1, 'Dòng sản phẩm', 'SuperStay Matte Ink'),
(3, 1, 'Mã màu', '210'),
(4, 1, 'Tên màu', 'Versatile (Hồng đất)'),
(5, 1, 'Chất son', 'Son kem lì'),
(6, 1, 'Độ bền màu', 'Lên đến 16 giờ'),
(7, 1, 'Dung tích', '5ml'),
(8, 1, 'Xuất xứ', 'Mỹ');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

DROP TABLE IF EXISTS `promotions`;
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `value` decimal(10,0) DEFAULT NULL,
  `start_date` datetime DEFAULT current_timestamp(),
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shops`
--

DROP TABLE IF EXISTS `shops`;
CREATE TABLE IF NOT EXISTS `shops` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` date DEFAULT current_timestamp(),
  `owner_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shops`
--

INSERT INTO `shops` (`id`, `name`, `logo_url`, `description`, `status`, `created_at`, `owner_id`) VALUES
(1, 'Thế giới skin food', '/assets/shops/thegioiskinfood.png', 'Shop chuyên về mỹ phẩm', 1, '2025-08-25', '0772152991'),
(2, 'Coolmate - Official Store', '/assets/shops/coolmate.webp', 'Shop chuyên về quần áo', 1, '2025-08-26', '0987654333'),
(3, 'Casper Official Store', '/assets/shops/casper.webp', 'Shop chuyên về đồ điện tử', 1, '2025-08-26', '0987654222'),
(4, 'Murad Vietnam Official Store', '/assets/shops/murad.webp', 'Shop chuyên về quần áo', 1, '2025-08-26', '0987654111'),
(5, 'Unilever Chăm Sóc Sắc Đẹp', '/assets/shops/unilever.webp', '', 1, '2025-08-26', '0987654000'),
(6, 'Pandora VN', '/assets/shops/pandora.webp', '', 1, '2025-08-26', '0987654444');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `start_date` datetime DEFAULT current_timestamp(),
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `shop_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO promotions values (1, "Giảm giá black friday", "2025-05-11", "2025-11-11", 1, 1);

CREATE TABLE `promotion_items` (
  promotion_id int,
  product_variant_id int,
  discount_value int
);

INSERT INTO promotion_items values (1, 1, 20), (1, 2, 10), (1, 3, 50), (1, 20, 12), (1, 21, 10), (1, 22, 20), (1, 23, 22);
-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shop_categories`
--

DROP TABLE IF EXISTS `shop_categories`;
CREATE TABLE IF NOT EXISTS `shop_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shop_categories`
--

INSERT INTO `shop_categories` (`id`, `shop_id`, `name`) VALUES
(1, 1, 'Sản phẩm mới'),
(2, 2, 'Sản phẩm mùa hè'),
(3, 3, 'Sản phẩm mới'),
(4, 4, 'Sản phẩm mới'),
(5, 5, 'Sản phẩm mới'),
(6, 6, 'Sản phẩm mới');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `phone_number` varchar(10) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`phone_number`, `email`, `password`, `avatar_url`, `role`) VALUES
('0772152991', 'dtnchau.sgu@gmail.com', '$2b$10$HsTp5uLFodwI8/ZeSHdabOuT1m8Fi3ozmvuNCQUiyKNxEJTy2wcr2', '/assets/avatar/lion.png', 'user'),
('0987654000', 'unilever@gmail.com', '123456', '/assets/bear.png', 'user'),
('0987654111', 'murad@gmail.com', '123456', '/assets/bear.png', 'user'),
('0987654222', 'casper@gmail.com', '123456', '/assets/bear.png', 'user'),
('0987654321', 'hihi@gmail.com', '123456', '/assets/panda.png', 'user'),
('0987654333', 'coolmate@gmail.com', '123456', '/assets/bear.png', 'user'),
('0987654444', 'pandora@gmail.com', '123456', '/assets/bear.png', 'user'),
('0987654555', 'thewhoo@gmail.com', '123456', '/assets/bear.png', 'user');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `userviewhistory`
--

DROP TABLE IF EXISTS `userviewhistory`;
CREATE TABLE IF NOT EXISTS `userviewhistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(10) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `userviewhistory`
--

INSERT INTO `userviewhistory` (`id`, `user_id`, `product_id`, `viewed_at`) VALUES
(1, '0772152991', 24, '2025-11-04 09:52:31'),
(2, '0772152991', 24, '2025-11-04 09:52:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
CREATE TABLE IF NOT EXISTS `user_profile` (
  `username` varchar(255) DEFAULT NULL,
  `dob` datetime DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `phone_number` varchar(10) NOT NULL,
  PRIMARY KEY (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_profile`
--

INSERT INTO `user_profile` (`username`, `dob`, `gender`, `updated_at`, `phone_number`) VALUES
('', '0000-00-00 00:00:00', 10, '0000-00-00 00:00:00', '0772152991'),
('', '2005-08-26 00:00:00', 1, NULL, '0987654000'),
('', '2005-08-26 00:00:00', 1, NULL, '0987654111'),
('', '2005-08-26 00:00:00', 1, NULL, '0987654222'),
('', '2005-08-25 00:00:00', 1, NULL, '0987654321'),
('', '2005-08-26 00:00:00', 1, NULL, '0987654333'),
('', '2005-08-26 00:00:00', 1, NULL, '0987654444'),
('', '2005-08-26 00:00:00', 1, NULL, '0987654555');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `variantoptionvalues`
--

DROP TABLE IF EXISTS `variantoptionvalues`;
CREATE TABLE IF NOT EXISTS `variantoptionvalues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `variant_id` (`variant_id`),
  KEY `attribute_id` (`attribute_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `variantoptionvalues`
--

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

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_products_list`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `v_products_list`;
CREATE TABLE IF NOT EXISTS `v_products_list` (
`id` int(11)
,`name` varchar(255)
,`description` varchar(1000)
,`base_price` int(11)
,`shop_id` int(11)
,`generic_id` int(11)
,`created_at` date
,`updated_at` date
,`sold_count` int(11)
,`category_name` varchar(255)
,`image_url` varchar(500)
,`avg_rating` decimal(14,4)
,`hot_score` decimal(17,5)
);

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_products_list`
--

DROP VIEW IF EXISTS `v_products_list`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_products_list`  AS SELECT `p`.`id` AS `id`, `p`.`name` AS `name`, `p`.`description` AS `description`, `p`.`base_price` AS `base_price`, `p`.`shop_id` AS `shop_id`, `p`.`generic_id` AS `generic_id`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at`, `p`.`sold_count` AS `sold_count`, `g`.`name` AS `category_name`, (select `pi`.`image_url` from `productimages` `pi` where `pi`.`product_id` = `p`.`id` and `pi`.`isMain` = 1 limit 1) AS `image_url`, (select ifnull(avg(`pr`.`rating`),0) from `productreviews` `pr` where `pr`.`product_id` = `p`.`id`) AS `avg_rating`, `p`.`sold_count`* 0.6 + ifnull((select avg(`pr`.`rating`) from `productreviews` `pr` where `pr`.`product_id` = `p`.`id`),0) * 0.4 AS `hot_score` FROM (`products` `p` join `generic` `g` on(`g`.`id` = `p`.`generic_id`)) ;

--
CREATE VIEW v_products_list AS
SELECT 
    -- 1. Thông tin cơ bản từ bảng 'products'
    p.id, 
    p.name, 
    p.description, 
    p.shop_id, 
    p.generic_id, -- (ID danh mục con)
    p.created_at,
    p.updated_at,
    p.sold_count,
    
    -- 2. Tên danh mục (từ bảng 'generic')
    g.name AS category_name,
    
    -- 3. Giá gốc (từ 'products.base_price', mà bạn đã đồng bộ)
    p.base_price,
    
    -- 4. Ảnh chính (isMain = 1)
    (SELECT pi.image_url 
     FROM productimages pi 
     WHERE pi.product_id = p.id AND pi.is_main = 1 
     LIMIT 1) AS image_url,
     
    -- 5. Đánh giá trung bình (tính từ 'productreviews')
    (SELECT IFNULL(AVG(pr.rating), 0) 
     FROM productreviews pr 
     WHERE pr.product_id = p.id) AS avg_rating,
     
    -- 6. Điểm "Hot" (tính theo công thức của bạn)
    (
        p.sold_count * 0.6 + 
        (SELECT IFNULL(AVG(pr.rating), 0) FROM productreviews pr WHERE pr.product_id = p.id) * 0.4
    ) AS hot_score,

    -- 7. Giá Sale (tính giá thấp nhất CÓ KHUYẾN MÃI)
    (
        SELECT ROUND(MIN(pv.price * (1 - (pi.discount_value / 100))))
        FROM productvariants pv
        JOIN promotion_items pi ON pv.id = pi.product_variant_id
        JOIN promotions promo ON pi.promotion_id = promo.id
        WHERE 
            pv.product_id = p.id
            AND promo.is_active = 1
            AND NOW() BETWEEN promo.start_date AND promo.end_date
    ) AS sale_price,
    
    -- 8. % Giảm giá (lấy % cao nhất đang được áp dụng)
    (
        SELECT MAX(pi.discount_value) 
        FROM productvariants pv
        JOIN promotion_items pi ON pv.id = pi.product_variant_id
        JOIN promotions promo ON pi.promotion_id = promo.id
        WHERE 
            pv.product_id = p.id
            AND promo.is_active = 1
            AND NOW() BETWEEN promo.start_date AND promo.end_date
    ) AS discount_percentage
    
FROM 
    products p
-- JOIN bảng danh mục
JOIN 
    generic g ON g.id = p.generic_id;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `address_user`
--
ALTER TABLE `address_user`
  ADD KEY `address_id` (`address_id`),
  ADD KEY `phone_number` (`phone_number`);

--
-- Chỉ mục cho bảng `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`user_id`,`product_variant_id`),
  ADD KEY `product_variant_id` (`product_variant_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `generic`
--
ALTER TABLE `generic`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `productimages`
--
ALTER TABLE `productimages`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `productreviews`
--
ALTER TABLE `productreviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `generic_id` (`generic_id`),
  ADD KEY `shop_id` (`shop_id`),
  ADD KEY `shop_cate_id` (`shop_cate_id`),
  ADD KEY `brand_id` (`brand_id`);

--
-- Chỉ mục cho bảng `productvariants`
--
ALTER TABLE `productvariants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_detail`
--
ALTER TABLE `product_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shops`(`shop_id`);

ALTER TABLE `promotion_items`
  ADD KEY `fk_promotion`(`promotion_id`),
  ADD KEY `FK_productvariants`(`product_variant_id`),
  ADD PRIMARY KEY (`promotion_id`, `product_variant_id`);

--
-- Chỉ mục cho bảng `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Chỉ mục cho bảng `shop_categories`
--
ALTER TABLE `shop_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shop_id` (`shop_id`);

--
-- Chỉ mục cho bảng `shop_info`
--
ALTER TABLE `shop_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_user` (`user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`phone_number`);

--
-- Chỉ mục cho bảng `userviewhistory`
--
ALTER TABLE `userviewhistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`phone_number`);

--
-- Chỉ mục cho bảng `variantoptionvalues`
--
ALTER TABLE `variantoptionvalues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `attribute_id` (`attribute_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `address`
--
ALTER TABLE `address`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `generic`
--
ALTER TABLE `generic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `productimages`
--
ALTER TABLE `productimages`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT cho bảng `productreviews`
--
ALTER TABLE `productreviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `productvariants`
--
ALTER TABLE `productvariants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT cho bảng `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `product_detail`
--
ALTER TABLE `product_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `shops`
--
ALTER TABLE `shops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `shop_categories`
--
ALTER TABLE `shop_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `shop_info`
--
ALTER TABLE `shop_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `userviewhistory`
--
ALTER TABLE `userviewhistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `variantoptionvalues`
--
ALTER TABLE `variantoptionvalues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `address_user`
--
ALTER TABLE `address_user`
  ADD CONSTRAINT `address_user_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  ADD CONSTRAINT `address_user_ibfk_2` FOREIGN KEY (`phone_number`) REFERENCES `users` (`phone_number`);

--
-- Các ràng buộc cho bảng `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`phone_number`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `productvariants` (`id`);

--
-- Các ràng buộc cho bảng `generic`
--
ALTER TABLE `generic`
  ADD CONSTRAINT `generic_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`phone_number`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `productvariants` (`id`);

--
-- Các ràng buộc cho bảng `productimages`
--
ALTER TABLE `productimages`
  ADD CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `productreviews`
--
ALTER TABLE `productreviews`
  ADD CONSTRAINT `productreviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`phone_number`),
  ADD CONSTRAINT `productreviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`generic_id`) REFERENCES `generic` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`),
  ADD CONSTRAINT `products_ibfk_3` FOREIGN KEY (`shop_cate_id`) REFERENCES `shop_categories` (`id`),
  ADD CONSTRAINT `products_ibfk_4` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`);

--
-- Các ràng buộc cho bảng `productvariants`
--
ALTER TABLE `productvariants`
  ADD CONSTRAINT `productvariants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `product_detail`
--
ALTER TABLE `product_detail`
  ADD CONSTRAINT `product_detail_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `shops`
--
ALTER TABLE `shops`
  ADD CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`phone_number`);

--
-- Các ràng buộc cho bảng `shop_categories`
--
ALTER TABLE `shop_categories`
  ADD CONSTRAINT `shop_categories_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`);

--
-- Các ràng buộc cho bảng `userviewhistory`
--
ALTER TABLE `userviewhistory`
  ADD CONSTRAINT `userviewhistory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`phone_number`),
  ADD CONSTRAINT `userviewhistory_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `user_profile`
--
ALTER TABLE `user_profile`
  ADD CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`phone_number`) REFERENCES `users` (`phone_number`);

--
-- Các ràng buộc cho bảng `variantoptionvalues`
--
ALTER TABLE `variantoptionvalues`
  ADD CONSTRAINT `variantoptionvalues_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `productvariants` (`id`),
  ADD CONSTRAINT `variantoptionvalues_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
