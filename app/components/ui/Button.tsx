"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const variantStyles = {
    primary: "bg-[#F472B6] text-[#1A1A1A] hover:bg-[#f259a4]", // Pink
    secondary: "bg-[#FDE047] text-[#1A1A1A] hover:bg-[#facc15]", // Yellow
    accent: "bg-[#60A5FA] text-[#1A1A1A] hover:bg-[#3b82f6]", // Blue
    outline: "bg-[#E0F2FE] text-[#1A1A1A] hover:bg-[#bae6fd]", // Sky Blue
    white: "bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#f3f4f6]",
    dark: "bg-[#1A1A1A] text-[#FEFBF6] hover:bg-[#333333]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-bold",
    md: "px-5 py-2.5 text-sm font-extrabold",
    lg: "px-7 py-3.5 text-base font-black tracking-wide",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 border-3 border-[#1A1A1A] rounded-md font-sans shadow-brutal neo-btn cursor-pointer select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
