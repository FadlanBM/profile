import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "yellow" | "green" | "pink" | "blue" | "purple" | "white" | "dark";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "yellow",
  className = "",
}) => {
  const variantStyles = {
    yellow: "bg-[#FDE047] text-[#1A1A1A]",
    green: "bg-[#86EFAC] text-[#1A1A1A]",
    pink: "bg-[#F472B6] text-[#1A1A1A]",
    blue: "bg-[#60A5FA] text-[#1A1A1A]",
    purple: "bg-[#C084FC] text-[#1A1A1A]",
    white: "bg-[#FFFFFF] text-[#1A1A1A]",
    dark: "bg-[#1A1A1A] text-[#FEFBF6]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-[#1A1A1A] rounded-md font-mono text-xs font-bold uppercase shadow-brutal-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
