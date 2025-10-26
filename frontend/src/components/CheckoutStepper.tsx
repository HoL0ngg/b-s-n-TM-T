import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

// Định nghĩa các bước
const steps = [
    'Cart',
    'Address',
    'Payment',
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
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}