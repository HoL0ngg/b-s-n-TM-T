import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import type { CartItem } from "../../types/CartType";
import { useNavigate } from "react-router-dom";
import { TiDeleteOutline } from "react-icons/ti";
import { BsCartXFill } from "react-icons/bs";
import VariantEditModal from "../../components/VariantEditModal";
import { handleSwalAlert } from "../../utils/helper";

export default function Cart() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, updateQuantity, deleteProductOnCart, deleteShopOnCart } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);

    const allItems: CartItem[] = useMemo(() => {
        return cart.flatMap(shop => shop.items);
    }, [cart]);

    const selectedItemDetails: CartItem[] = useMemo(() => {
        return allItems.filter(item =>
            selectedItems.includes(item.product_variant_id)
        );
    }, [allItems, selectedItems]);

    const handleEditClick = (item: CartItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const updateCartInDatabase = async (productId: number, newQuantity: number) => {
        updateQuantity(productId, newQuantity);
    };

    const handleCheckboxChange = (productid: number) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(productid)
                ? prevSelected.filter(id => id !== productid) // Uncheck
                : [...prevSelected, productid] // Check
        );
    };

    const handleShopCheckboxChange = (items: CartItem[]) => {
        const shopItemIds = items.map(item => item.product_variant_id);

        setSelectedItems(prevSelected => {
            const allSelected = shopItemIds.every(id => prevSelected.includes(id));

            if (allSelected) {
                // Bỏ chọn tất cả item trong shop này
                return prevSelected.filter(id => !shopItemIds.includes(id));
            } else {
                // Chọn tất cả item trong shop này
                // (Dùng Set để tránh thêm trùng lặp)
                return [...new Set([...prevSelected, ...shopItemIds])];
            }
        });
    };

    const handleHihi = (product_id: number) => {
        navigate(`/product/${product_id}`);
    }

    const calculateTotal = () => {
        if (!cart || cart.length === 0) {
            return 0;
        }
        return allItems
            .filter(item => selectedItems.includes(item.product_variant_id))
            .reduce((sum, item) => {
                const price = item.sale_price || item.original_price || 0;
                const quantity = item.quantity || 0;
                return sum + (price * quantity);
            }, 0);
    };

    const handleIncrease = (productId: number, currentQuantity: number) => {
        updateCartInDatabase(productId, currentQuantity + 1);
    };

    const handleDecrease = (productId: number, currentQuantity: number) => {
        updateCartInDatabase(productId, currentQuantity - 1);
    };

    const deleteProductByShopId = (shop_id: number) => {
        deleteShopOnCart(shop_id);
    }

    const handleCheckout = () => {
        setLoading(true);

        const itemsToCheckout = allItems.filter(item =>
            selectedItems.includes(item.product_variant_id)
        );
        const total = calculateTotal(); // (Hàm của bạn)

        if (itemsToCheckout.length === 0) {
            handleSwalAlert("Thông báo báo", "Vui lòng chọn sản phẩm để thanh toán.");
            setLoading(false);
            return;
        }

        sessionStorage.setItem('checkoutItems', JSON.stringify(itemsToCheckout));
        sessionStorage.setItem('checkoutTotal', JSON.stringify(total));

        // 3. Vẫn gửi qua 'state' như cũ để load nhanh
        // navigate('/checkout', {
        //     state: {
        //         checkoutItems: itemsToCheckout,
        //         total: total
        //     }
        // });
        setTimeout(() => {
            navigate("/checkout/address", {
                state: {
                    checkoutItems: itemsToCheckout,
                    total: total
                }
            });
        }, 800);
    }

    const handleDelete = (product_id: number) => {
        deleteProductOnCart(product_id);
    }

    if (!user) return (<div>Đăng nhập đi b ei</div>)
    if (!cart) return (<div>Đang tải b ei</div>)
    console.log(cart);

    return (
        <div className="row">
            <div className="col-8">
                {cart.length == 0 ?
                    (<div className="d-flex justify-content-center mt-4 flex-column align-items-center gap-4">
                        <BsCartXFill className="fs-1 text-primary" />
                        <div className="fs-3 text-primary fw-bolder">Mua hàng đi b ei</div>
                    </div>)
                    :
                    (<div className="container p-4">
                        {cart.map(shop => {
                            const allShopItemsSelected = shop.items.every(item => selectedItems.includes(item.product_variant_id));

                            return (
                                <div key={shop.shop_id} className="mb-4">
                                    <div className="m-2 fs-4 d-flex align-items-center justify-content-between">
                                        <div>
                                            <input
                                                id={`shop${shop.shop_id}`}
                                                type="checkbox"
                                                checked={allShopItemsSelected}
                                                onChange={() => handleShopCheckboxChange(shop.items)}
                                            />
                                            <img className="m-2" src={shop.logo_url} style={{ height: '50px', width: '50px' }} />
                                            <label htmlFor={`shop${shop.shop_id}`} className="user-select-none">{shop.shop_name}</label>
                                        </div>
                                        <div className="pointer delete-all" style={{ fontSize: '0.8rem' }} onClick={() => deleteProductByShopId(shop.shop_id)}>
                                            XÓA TẤT CẢ
                                        </div>
                                    </div>
                                    <div className="container bg-white px-4 rounded border">
                                        {shop.items.map((item, ind) => (
                                            <div key={item.product_variant_id} className={`row mb-4 ${ind > 0 ? 'border-top' : ''} border-primary border-2 pt-4`} >
                                                <div className="col-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.product_variant_id)}
                                                        onChange={() => handleCheckboxChange(item.product_variant_id)}
                                                    />
                                                    <img src={item.product_url} className="rounded ms-2" alt="" style={{ height: '150px', width: '150px' }} />
                                                </div>
                                                <div className="col-7 d-flex flex-column justify-content-between">
                                                    <div>
                                                        <div className="fw-bolder pointer" onClick={() => handleHihi(item.product_id)}>{item.product_name}</div>
                                                        {item.options && item.options?.length > 0 && (<div className="d-flex gap-4">
                                                            <div>
                                                                {
                                                                    item.options?.map((opt) => (
                                                                        <div key={opt.attribute} className="text-muted small">
                                                                            {opt.attribute}: {opt.value}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                            <div className="text-primary fw-semibold pointer" onClick={() => handleEditClick(item)}>
                                                                Thay đổi
                                                            </div>
                                                        </div>)}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-4">
                                                        <div>{item.discount_percentage && item.sale_price ? (<span><span className="text-primary fs-5 fw-semibold">{Number(item.sale_price).toLocaleString('vi-VN')}đ</span><small className="ms-2 text-muted text-decoration-line-through">{item.original_price.toLocaleString('vi-VN')}đ</small></span>) : (<span className="fw-semibold fs-5 text-primary">{item.original_price.toLocaleString('vi-VN')}đ</span>)}</div>
                                                        <div className="d-flex my-1 border rounded-pill">
                                                            <div className="px-2 py-1 pointer" onClick={() => handleDecrease(item.product_variant_id, item.quantity)}><i className="fa-solid fa-minus"></i></div>
                                                            <input type="text" className="text-center text-primary" value={item.quantity} readOnly style={{ outline: "none", width: "50px", border: "none" }} />
                                                            <div className="px-2 py-1 pointer" onClick={() => handleIncrease(item.product_variant_id, item.quantity)}><i className="fa-solid fa-plus"></i></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-2 text-end d-flex flex-column justify-content-between">
                                                    <div className="d-flex justify-content-end">
                                                        <div className="pointer"><TiDeleteOutline className="fs-3 delete-all" onClick={() => handleDelete(item.product_variant_id)} /></div>
                                                    </div>
                                                    <div className="p-2 text-primary fw-bold fs-5">{Number(item.sale_price ? item.sale_price * item.quantity : item.original_price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>)}
            </div>
            <div className="col-4">
                <div className="container p-4 border rounded shadow-sm mt-4" style={{
                    position: 'sticky',
                    top: '40px' // <-- Sửa số này cho phù hợp với chiều cao Navbar
                }}>
                    <div className="fs-4 border-bottom border-2 text-primary fw-semibold">Chi tiết đơn hàng</div>
                    <div className="d-flex flex-column">
                        {selectedItemDetails.map((item, ind) => {
                            return (
                                <div className={`d-flex justify-content-between gap-2 p-2 ${ind > 0 ? 'border-top' : ''}`}>
                                    <div>
                                        <span className="fw-semibold">[x{item.quantity}]</span> {item.product_name}
                                    </div>
                                    <div className="text-primary fw-bold">
                                        {Number(item.sale_price ? item.sale_price * item.quantity : item.original_price * item.quantity).toLocaleString('vi-VN')}₫
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="d-flex justify-content-between m-2 bg-light border rounded p-3 text-primary fw-bold">
                        <div>Tổng cộng ({selectedItems.length} sản phẩm):</div>
                        <div>{calculateTotal().toLocaleString('vi-VN')}₫</div>
                    </div>
                    <div className="btn btn-primary rounded-pill w-100 p-2 mt-2" onClick={handleCheckout}>
                        {loading ? "Đang tải..." : "Thanh toán"}
                    </div>
                </div>
            </div>

            {
                loading && (
                    <div className="loader-overlay">
                        <div className="spinner"></div>
                    </div>
                )
            }
            {
                editingItem && (
                    <VariantEditModal
                        show={isModalOpen}
                        onClose={handleCloseModal}
                        cartItem={editingItem}
                    />
                )
            }
        </div >
    );
}