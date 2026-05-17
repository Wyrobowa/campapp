import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2D5016] focus:outline-none focus:ring-1 focus:ring-[#2D5016] ${className}`}
        {...props}
      />
    </div>
  );
}
