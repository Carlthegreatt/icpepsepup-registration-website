import { cn } from '@/utils';

interface RegistrationStepperProps {
  currentStep: number;
  totalSteps: number;
}

export function RegistrationStepper({ currentStep, totalSteps }: RegistrationStepperProps) {
  return (
    <div className="flex items-center w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto relative cursor-default">
      {/* Steps Container */}
      <div className="relative flex justify-between w-full px-2 sm:px-0">
        {/* Background Line */}
        <div className="absolute top-1/2 left-[8px] sm:left-[12px] md:left-[16px] right-[8px] sm:right-[12px] md:right-[16px] h-0.5 sm:h-1 bg-[rgba(255,255,255,0.12)] rounded-full -translate-y-1/2" />
        
        {/* Active Line Progress - Mobile */}
        <div 
          className="absolute top-1/2 left-[8px] h-0.5 bg-gradient-to-r from-[#5da5a5] to-[#5dd8d8] rounded-full -translate-y-1/2 transition-all duration-500 ease-out sm:hidden"
          style={{ 
            width: currentStep === 0 
              ? '0%' 
              : `calc((100% - 16px - 8px) * ${currentStep / (totalSteps - 1)})`
          }}
        />
        
        {/* Active Line Progress - Small screens */}
        <div 
          className="hidden sm:block md:hidden absolute top-1/2 left-[12px] h-1 bg-gradient-to-r from-[#5da5a5] to-[#5dd8d8] rounded-full -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ 
            width: currentStep === 0 
              ? '0%' 
              : `calc((100% - 24px - 12px) * ${currentStep / (totalSteps - 1)})`
          }}
        />
        
        {/* Active Line Progress - Medium+ screens */}
        <div 
          className="hidden md:block absolute top-1/2 left-[16px] h-1 bg-gradient-to-r from-[#5da5a5] to-[#5dd8d8] rounded-full -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ 
            width: currentStep === 0 
              ? '0%' 
              : `calc((100% - 32px - 16px) * ${currentStep / (totalSteps - 1)})`
          }}
        />
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={index} className="flex flex-col items-center group">
               {/* Dot */}
              <div className={cn(
                "w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-300",
                isActive 
                    ? "bg-[#5dd8d8] border-[#5dd8d8] sm:scale-125 shadow-[0_0_15px_rgba(93,216,216,0.5)] sm:shadow-[0_0_20px_rgba(93,216,216,0.6)]" 
                    : isCompleted 
                        ? "bg-[#5da5a5] border-[#5da5a5] shadow-[0_0_8px_rgba(93,165,165,0.4)] sm:shadow-[0_0_10px_rgba(93,165,165,0.5)]"
                        : "bg-[rgba(15,30,30,0.9)] border-[rgba(139,197,197,0.3)]"
              )}>
                {/* Inner Dot for completed/active */}
                {(isActive || isCompleted) && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-[#f5f5f5] animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
