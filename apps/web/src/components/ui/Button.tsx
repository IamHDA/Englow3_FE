import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

// Định nghĩa các biến thể giao diện bằng class-variance-authority
const buttonVariants = cva(
  // Tailwind v4 đặt `cursor: default` cho <button> trong preflight nên phải khai báo cursor-pointer
  "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-[#1E3A8A] text-white hover:bg-[#152e6d] focus-visible:ring-[#1E3A8A]/40", // Màu Navy chủ đạo
        accent: "bg-[#F59E0B] text-white hover:bg-[#D97706] focus-visible:ring-[#F59E0B]/40",  // Màu Cam Amber thương hiệu
        outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400/40",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40",
        gradient: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white hover:brightness-105 shadow-md shadow-amber-500/20 active:scale-[0.98] focus-visible:ring-[#F59E0B]/40",
        // Nền navy nhạt dần + viền đậm lên, không đảo hẳn sang nền đặc để tránh nhấp nháy khi hover
        navOutline:
          "border border-[#2C488F]/70 bg-transparent text-[#2C488F] font-semibold rounded-full hover:border-[#2C488F] hover:bg-[#2C488F]/10 hover:text-[#22376E] hover:shadow-sm hover:shadow-[#2C488F]/15 active:bg-[#2C488F]/15 active:scale-[0.98] focus-visible:ring-[#2C488F]/40",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// Mở rộng interface từ thuộc tính gốc của button HTML
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";