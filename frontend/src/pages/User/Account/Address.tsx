import { useEffect, useState } from "react";
import AddressModal from "../../../components/AddressModel";
import type { AddressType } from "../../../types/UserType";
import { changeDefaultAddress, fetchAddressByUserId } from "../../../api/user";
import { MdOutlineAddHomeWork } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";

export default function Address() {
    const { user } = useAuth();
    const [isShow, setIsShow] = useState(false);
    const [addresses, setAddress] = useState<AddressType[]>([]);
    const loadAddress = async () => {
        if (user)
            try {
                const data = await fetchAddressByUserId(user.id.toString());
                console.log(data);

                setAddress(data);
            } catch (error) {
                console.log(error);
            }
    }
    useEffect(() => {
        loadAddress();
    }, [user]);
    const handleSaveSuccess = () => {
        setIsShow(false);     // Đóng modal
        loadAddress(); // Tải lại danh sách (để reload)
    };

    const handleDefault = async (id: number) => {
        try {
            await changeDefaultAddress(id);
        } catch (err) {
            console.log(err);
        }
        loadAddress();
    }
    if (!user) return (<div>Đang tải b ei</div>);
    return (
        <div>
            <AddressModal isShow={isShow} onClose={() => setIsShow(false)} onSaveSuccess={handleSaveSuccess} />
            <div className="d-flex justify-content-between text-center border-bottom border-2">
                <h5 className="mt-2 ms-2">Địa chỉ của tôi</h5>
                <div className="btn btn-primary mb-3" onClick={() => setIsShow(true)}>+ Thêm địa chỉ mới</div>
            </div>
            <p className="m-2 fs-2">Địa chỉ</p>
            {/* <div className="mb-4 ms-2">

                <div className="d-flex justify-content-between mt-1">
                    <div>
                        <div className="ms-2">xxx An Dương Vương</div>
                        <div className="ms-2 text-muted">phường Chợ Quán, TP. Hồ Chí Minh</div>
                    </div>
                    <div>
                        <div className="border p-2 fs-6 cursor-pointer" style={{ cursor: "pointer" }}>Thiệt lập mặc định</div>
                    </div>
                </div>
            </div> */}
            {addresses.length > 0 ? addresses.map((address) => (
                <div className="mb-4 ms-2 pt-3 border-top border-2" key={address.id}>
                    <div className="d-flex justify-content-between">
                        <div>
                            <span className="border-end pe-2 border-2 fs-5 ms-2">{address.user_name}</span>
                            <span className="ms-2 text-muted fs-5 ms-2">{address.phone_number_jdo}</span>
                        </div>
                        <div>
                            <a href="#" className="text-decoration-none p-2">Cập nhật</a>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                        <div>
                            <div className="ms-4">{address.home_number} {address.street}</div>
                            <div className="ms-4 text-muted">{address.ward}, {address.city}</div>
                        </div>
                        <div>
                            {!address.is_default ? (<div className="border p-2 fs-6 cursor-pointer" onClick={() => handleDefault(address.id)} style={{ cursor: "pointer" }}>Thiệt lập mặc định</div>) : (<div className="text-primary fw-bolder">Mặc định r b ei</div>)}
                        </div>
                    </div>
                </div>
            )) :
                (<div className="text-center text-primary fs-4"><div>Chưa có địa chỉ b ei</div><div><MdOutlineAddHomeWork className="fs-1" /></div></div>)}

        </div>
    );
}
