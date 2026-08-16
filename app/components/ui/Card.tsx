import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  shadowSize?: "sm" | "md" | "lg" | "xl";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  bgColor = "bg-[#FFFFFF]",
  shadowSize = "md",
}) => {
  const shadowStyles = {
    sm: "shadow-brutal-sm",
    md: "shadow-brutal",
    lg: "shadow-brutal-lg",
    xl: "shadow-brutal-xl",
  };

  return (
    <div
      className={`border-3 border-[#1A1A1A] rounded-lg p-6 ${bgColor} ${shadowStyles[shadowSize]} ${className}`}
    >
      {children}
    </div>
  );
};
