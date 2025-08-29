import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 btn-hover focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 focus:ring-primary-500 shadow-md hover:shadow-lg",
    danger: "bg-gradient-to-r from-recording-500 to-recording-600 text-white hover:from-recording-600 hover:to-red-700 focus:ring-recording-500 shadow-lg hover:shadow-xl",
    success: "bg-gradient-to-r from-success-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-success-500 shadow-lg hover:shadow-xl",
    ghost: "text-neutral-700 hover:bg-neutral-100 focus:ring-primary-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
    xl: "px-8 py-4 text-lg gap-3"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;