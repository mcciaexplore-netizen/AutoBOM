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
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            {/* Connector Line */}
            {index > 0 && (
              <div
                className={`h-1 w-12 sm:w-24 mx-2 rounded-full transition-colors duration-300 ${
                  currentStep >= step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
            
            {/* Step Bubble */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600 shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={20} /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-medium ${
                  isCurrent ? 'text-blue-700' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
