import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Thông báo lỗi; có giá trị thì viền chuyển đỏ và gắn aria-invalid. */
  error?: string;
  /** Nút phụ nằm trong ô, ví dụ nút hiện/ẩn mật khẩu. */
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, trailing, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm',
              'placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
              'transition-colors',
              trailing && 'pr-11',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-200 focus:border-[#F59E0B] focus:ring-[#F59E0B]/25',
              className,
            )}
            {...props}
          />

          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
