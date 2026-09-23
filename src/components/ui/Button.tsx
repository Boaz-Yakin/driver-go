import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyles = 'rounded-md px-4 py-2 font-medium transition-colors focus:outline-none';
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400',
    danger: 'bg-red-100 text-red-600 border border-red-200',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
