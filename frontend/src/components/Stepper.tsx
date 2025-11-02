interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="stepper-wrapper">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        let stepClass = '';
        if (stepNumber < currentStep) {
          stepClass = 'completed'; // Đã qua
        } else if (stepNumber === currentStep) {
          stepClass = 'active'; // Đang ở
        }

        return (
          <div key={label} className={`stepper-item ${stepClass}`}>
            <span className="stepper-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;