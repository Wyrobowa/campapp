import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

const variants = {
  primary: 'bg-[#2D5016] text-white hover:bg-[#3d6b1f] active:bg-[#2D5016]',
  secondary: 'bg-[#F0F4EC] text-[#2D5016] border border-[#2D5016] hover:bg-[#e4ecda]',
  ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors min-h-[44px] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
