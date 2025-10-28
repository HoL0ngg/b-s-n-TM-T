import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

// Định nghĩa các bước
const steps = [
    'Giỏ hàng',
    'Thông tin',
    'Thanh toán',
];

interface CheckoutStepperProps {
    // activeStep là index (bắt đầu từ 0)
    // 0 = Cart, 1 = Address, 2 = Payment
    activeStep: number;
}

export default function CheckoutStepper({ activeStep }: CheckoutStepperProps) {
    return (
        <Box sx={{ width: '75%', padding: '24px 0', margin: '24px auto 0px' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel
                            sx={{
                                // Kiểu cho Icon (cái vòng tròn)
                                '& .MuiStepIcon-root': {
                                    // Màu của vòng tròn chưa active
                                    color: '#9e9e9e', // Màu xám

                                    '&.Mui-active': {
                                        color: '#ff7708', // Màu đỏ cho bước hiện tại
                                    },
                                    '&.Mui-completed': {
                                        color: '#ff7708', // Màu xanh cho bước đã qua
                                    },
                                },
                                // Kiểu cho Chữ (label)
                                '& .MuiStepLabel-label': {
                                    '&.Mui-active': {
                                        fontWeight: 'bold', // In đậm chữ của bước hiện tại
                                    },
                                    '&.Mui-completed': {
                                        color: '#ff7708', // Màu xanh cho chữ đã qua
                                    },
                                },
                            }}
                        >{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}