import { cn } from "@/utils";

interface RegistrationStepperProps {
  currentStep: number;
  totalSteps: number;
}

export function RegistrationStepper({
  currentStep,
  totalSteps,
}: RegistrationStepperProps) {
  return (
    <div className="flex items-center w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto relative cursor-default">
      {/* Steps Container */}
      <div className="relative flex justify-between w-full px-2 sm:px-0">
        {/* Background Line */}
        <div className="absolute top-1/2 left-[8px] sm:left-[12px] md:left-[16px] right-[8px] sm:right-[12px] md:right-[16px] h-0.5 sm:h-1 bg-[rgba(255,255,255,0.12)] rounded-full -translate-y-1/2" />

        {/* Active Line Progress - Mobile */}
        <div
          className="absolute top-1/2 left-[8px] h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full -translate-y-1/2 transition-all duration-500 ease-out sm:hidden"
          style={{
            width:
              currentStep === 0
                ? "0%"
                : `calc((100% - 16px - 8px) * ${currentStep / (totalSteps - 1)})`,
          }}
        />

        {/* Active Line Progress - Small screens */}
        <div
          className="hidden sm:block md:hidden absolute top-1/2 left-[12px] h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full -translate-y-1/2 transition-all duration-500 ease-out"
          style={{
            width:
              currentStep === 0
                ? "0%"
                : `calc((100% - 24px - 12px) * ${currentStep / (totalSteps - 1)})`,
          }}
        />

        {/* Active Line Progress - Medium+ screens */}
        <div
          className="hidden md:block absolute top-1/2 left-[16px] h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full -translate-y-1/2 transition-all duration-500 ease-out"
          style={{
            width:
              currentStep === 0
                ? "0%"
                : `calc((100% - 32px - 16px) * ${currentStep / (totalSteps - 1)})`,
          }}
        />
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={index} className="flex flex-col items-center group">
              {/* Dot */}
              <div
                className={cn(
                  "w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-300",
                  isActive
                    ? "bg-yellow-400 border-yellow-400 sm:scale-125 shadow-[0_0_15px_rgba(250,204,21,0.5)] sm:shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                    : isCompleted
                      ? "bg-yellow-600 border-yellow-600 shadow-[0_0_8px_rgba(202,138,4,0.4)] sm:shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                      : "bg-[rgba(25,25,10,0.9)] border-yellow-900/40",
                )}
              >
                {/* Inner Dot for completed/active */}
                {(isActive || isCompleted) && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-[#0a0a05] animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
