import React from 'react';
import { cn } from '@/utils';

interface Input2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: 'primary' | 'secondary';
}

export const Input2 = React.forwardRef<HTMLInputElement, Input2Props>(
  ({ label, value, onChange, variant = 'primary', className, ...props }, ref) => {
    
    const styles = {
      primary: "border-primary text-primary focus:shadow-[0_0_15px_rgba(0,128,128,0.25)]",
      secondary: "border-secondary text-secondary focus:shadow-[0_0_15px_rgba(238,116,2,0.25)]"
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
            <label className={cn(
                "text-base font-bold text-primary tracking-wide",
                variant === 'secondary' && "text-secondary"
            )}>
                {label}
            </label>
        )}
        <input 
            ref={ref}
            value={value}
            onChange={onChange}
            className={cn(
                "w-full text-base !bg-transparent border-2 rounded-full px-6 py-3 outline-none !text-white transition-all placeholder:text-white/20",
                styles[variant],
                className
            )}
            {...props} 
        />
      </div>
    );
  }
);
Input2.displayName = "Input2";
