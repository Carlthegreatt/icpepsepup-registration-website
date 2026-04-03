import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
  iconAlwaysActive?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, variant = 'primary', iconAlwaysActive = false, className, children, ...props }, ref) => {
    
    const styles = {
      primary: {
        container: "md:hover:border-yellow-500/50 focus-within:border-yellow-400 focus-within:shadow-[0_0_15px_rgba(250,204,21,0.2)] md:focus-within:shadow-[0_0_25px_rgba(250,204,21,0.35)]",
        iconWrapper: "group-focus-within:bg-yellow-500/10",
        iconActive: "text-yellow-400",
        iconInactive: "text-white/50 group-focus-within:text-yellow-400",
        label: "group-focus-within:text-yellow-400"
      },
      secondary: {
        container: "md:hover:border-amber-500/50 focus-within:border-amber-400 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.2)] md:focus-within:shadow-[0_0_25px_rgba(245,158,11,0.35)]",
        iconWrapper: "group-focus-within:bg-amber-500/10",
        iconActive: "text-amber-400",
        iconInactive: "text-white/50 group-focus-within:text-amber-400",
        label: "group-focus-within:text-amber-400"
      }
    };

    const currentStyle = styles[variant];

    return (
      <div className={cn(
        "bg-[#1a1405]/60 backdrop-blur-xl border border-yellow-900/20 rounded-xl p-2.5 flex items-start gap-2.5 transition-all group shadow-lg",
        currentStyle.container,
        className
      )}>
        <div className={cn(
          "p-2 bg-white-50/5 rounded-lg transition-colors mt-0.5",
          currentStyle.iconWrapper
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            iconAlwaysActive ? currentStyle.iconActive : currentStyle.iconInactive
          )} />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
           {label && (
             <label className={cn(
               "text-[9px] text-white/40 uppercase tracking-widest font-bold block transition-colors",
               currentStyle.label
             )}>{label}</label>
           )}
           <input 
              ref={ref}
              className="bg-transparent border-none outline-none shadow-none text-sm focus:ring-0 w-full p-0 placeholder-white text-white font-medium"
              {...props} 
           />
           {children}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

