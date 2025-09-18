import React from "react";
import Breadcrumbs from "../components/Breadcrumb";

const Information: React.FC = () => {
    return (
        <>
            <Breadcrumbs />
            <h2 className="container">Nhập thông tin</h2>
            <div className="container bg-light w-50">
                <div className="row">
                    <div className="col-6">Họ</div>
                    <div className="col-6">Tên</div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <input type="text" name="" id="" className="text-muted" />
                    </div>
                    <div className="col-6">
                        <input type="text" name="" id="" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Information;