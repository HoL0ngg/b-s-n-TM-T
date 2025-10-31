import { useState } from "react";
import { motion } from "framer-motion";

export default function HomeProduct() {
    const menuList = ["Dành cho bạn", "Hàng mới về", "Hàng hót"];
    const [selectedList, setSelectedList] = useState(0);

    const handleChangeMenu = (id: number) => {
        if (id == selectedList) return;

        setSelectedList(id);
    }
    return (
        <div>
            <div className="fs-1 text-center text-primary mt-5 fw-bolder">
                GỢI Ý HÔM NAY
            </div>
            <div className="d-flex justify-content-center gap-4">
                {menuList.map((item, ind) => (
                    <div className={ind == selectedList ? "text-primary fs-5 pointer user-select-none position-relative p-3 category-component" : "text-muted fs-5 pointer user-select-none position-relative p-3 category-component"} onClick={() => handleChangeMenu(ind)}>
                        {item}
                        {selectedList === ind && (
                            <motion.div
                                className="position-absolute bottom-0 start-0 end-0"
                                style={{ height: '2px', backgroundColor: '#ff7708' }}
                                layoutId="underline"
                                transition={{ type: 'spring', stiffness: 380, damping: 10 }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div>

            </div>
        </div>
    )
}