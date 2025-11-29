import React from 'react';
import { AppStep } from '../types';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.RATE_LIST, label: 'Rate List' },
    { id: AppStep.PROJECT_INPUT, label: 'Project Details' },
    { id: AppStep.RESULTS, label: 'BOM Result' },
  ];

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center w-full max-w-2xl relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full -z-10" />

        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          // Calculate progress width for the colored line
          let isLineActive = false;
          if (index < steps.length - 1) {
             isLineActive = currentStep > step.id;
          }

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-out z-10 ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-100'
                      : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-100 scale-110 ring-4 ring-blue-50'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-3 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                    isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line (Foreground) */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-5 h-1 bg-blue-600 transition-all duration-700 ease-in-out`}
                  style={{
                    left: `${(100 / (steps.length - 1)) * index + (100 / (steps.length * 2))}%`,
                    width: isLineActive ? `${100 / (steps.length - 1)}%` : '0%',
                    zIndex: 0
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;