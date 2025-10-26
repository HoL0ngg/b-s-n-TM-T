import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CheckoutStepper from '../../components/CheckoutStepper';

// Hàm helper để map URL với step index
const getActiveStep = (pathname: string): number => {
    if (pathname === '/cart') {
        return 0; // Bước 1 (index 0)
    }
    if (pathname === '/checkout/address') {
        return 1; // Bước 2 (index 1)
    }
    if (pathname === '/checkout/payment') {
        return 2; // Bước 3 (index 2)
    }
    return 0; // Mặc định
};

const CheckoutLayout: React.FC = () => {
    const location = useLocation(); // Lấy thông tin URL hiện tại
    const activeStep = getActiveStep(location.pathname);

    return (
        <div className='container'>
            {/* 1. Render Stepper */}
            <CheckoutStepper activeStep={activeStep} />

            {/* 2. Render nội dung của route con (CartPage, AddressPage...) */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default CheckoutLayout;