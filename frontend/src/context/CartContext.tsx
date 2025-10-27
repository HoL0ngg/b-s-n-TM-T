import {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
    getCartByUserId,
    addToCart,
    updateProductQuantity,
    // clearCartApi, // (Giả sử bạn có hàm này)
} from '../api/cart';
import type { CartItem, CartType } from '../types/CartType';
import Swal from 'sweetalert2';

// Kiểu cho giá trị mà Context sẽ cung cấp
interface ICartContext {
    cart: CartType[];
    loadCart: () => Promise<void>;
    AddToCart: (productId: number, quantity: number) => Promise<void>;
    updateQuantity: (productId: number, newQuantity: number) => void;
    clearCart: () => void;
    isCartLoading: boolean; // Thêm state loading cho giỏ hàng
}

const CartContext = createContext<ICartContext | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth(); // Lấy user từ AuthContext
    const [cart, setCart] = useState<CartType[]>([]);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const debounceTimers = useRef<{ [key: string]: number }>({});

    const handleSuccess = () => {
        Swal.fire({
            title: "Thành công!",
            text: "Thêm sản phẩm vào giỏ hàng thành công 🎉",
            icon: "success",
            // confirmButtonText: "OK"
        });
    };

    const handleKeuDangNhap = () => {
        Swal.fire({
            title: "Thông báo!",
            text: "Đăng nhập đi b ei",
            icon: "info",
            confirmButtonText: "OK"
        });
    };

    const loadCart = async () => {
        if (!user) return;
        setIsCartLoading(true);

        try {
            const flatItems: CartItem[] = await getCartByUserId();
            console.log(flatItems);

            //DÙNG REDUCE ĐỂ GOM NHÓM DỮ LIỆU LẠI
            const groupedData = flatItems.reduce((acc, item) => {
                const shopId = item.shop_id;

                // Nếu shop chưa có trong 'acc', tạo nhóm mới
                if (!acc[shopId]) {
                    acc[shopId] = {
                        shop_id: shopId,
                        shop_name: item.shop_name,
                        logo_url: item.logo_url, // Lấy logo từ item
                        items: [],
                    };
                }

                // Thêm item vào đúng nhóm shop
                acc[shopId].items.push(item);
                return acc;

            }, {} as { [key: number]: CartType }); // Bắt đầu với object rỗng

            // 4. Chuyển object đã nhóm thành mảng và GỌI SETCART
            // Giờ 'data' là 'CartType[]', nó khớp với kiểu của 'setCart'
            setCart(Object.values(groupedData));

        } catch (error) {
            console.error('Lỗi khi tải giỏ hàng:', error);
            setCart([]);
        } finally {
            setIsCartLoading(false);
        }
    };

    /**
     * Tự động tải giỏ hàng khi user thay đổi (đăng nhập)
     */
    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            // Nếu user đăng xuất, xóa giỏ hàng
            setCart([]);
        }
    }, [user]);

    /**
     * Thêm sản phẩm vào giỏ (gọi API, sau đó tải lại)
     */
    const AddToCart = async (productId: number, quantity: number) => {
        if (!user) {
            handleKeuDangNhap();
            return;
        }

        try {
            // 1. Gọi API (dùng UPSERT - INSERT ON DUPLICATE)
            await addToCart(productId, quantity);
            handleSuccess();
            // 2. Tải lại toàn bộ giỏ hàng để đồng bộ
            // (Cách này đảm bảo UI luôn đúng 100% với CSDL)
            await loadCart();
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ:', error);
            // alert('Thêm sản phẩm thất bại');
        }
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        const finalQuantity = Math.max(newQuantity, 1);

        setCart((currentCart) => {
            return currentCart.map((shop) => ({
                ...shop,
                items: shop.items.map((item) =>
                    item.product_id === productId
                        ? { ...item, quantity: finalQuantity }
                        : item
                ),
            }));
        });

        // 2. Debounce API
        if (debounceTimers.current[productId]) {
            clearTimeout(debounceTimers.current[productId]);
        }

        debounceTimers.current[productId] = setTimeout(() => {
            console.log(`Debounce: Gọi API cho product ${productId}`);
            // Gọi API (PATCH) trong nền
            updateProductQuantity(productId, finalQuantity)
                .then(() => {
                    console.log(`API Update thành công cho ${productId}`);
                })
                .catch((err) => {
                    // Nếu API lỗi, tải lại giỏ hàng từ CSDL để "rollback"
                    console.error('Lỗi cập nhật API:', err);
                    alert('Cập nhật thất bại, đang đồng bộ lại...');
                    loadCart();
                });
        }, 1500); // Đợi 1.5 giây
    };

    /**
     * Xóa toàn bộ giỏ hàng (ví dụ: sau khi thanh toán)
     */
    const clearCart = () => {
        setCart([]);
        // Bạn cũng nên gọi API để xóa giỏ hàng trong CSDL
        // if (user) {
        //   clearCartApi(user.id).catch(err => console.error("Lỗi xóa CSDL giỏ hàng:", err));
        // }
    };

    // Giá trị cung cấp cho các component con
    const value = {
        cart,
        loadCart,
        AddToCart,
        updateQuantity,
        clearCart,
        isCartLoading,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// --- 6. TẠO HOOK TÙY CHỈNH ---
/**
 * Hook tùy chỉnh để sử dụng CartContext
 */
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error('useCart phải được sử dụng bên trong CartProvider');
    }
    return context;
};