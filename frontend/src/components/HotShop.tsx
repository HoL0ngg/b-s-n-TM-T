import ShopSlider from "./ShopSlider";

const HotShop = () => {
    return (
        <div className="mt-5">
            <div className="position-relative">
                <img src="assets/bg-hot-shop.webp" alt="" style={{ height: '400px', width: '100%' }} />
                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <div className="text-center mt-5 fs-1 text-white fw-bold">SHOP NỔI BẬT</div>
                    <ShopSlider />
                </div>
            </div>
        </div>
    );
}

export default HotShop;