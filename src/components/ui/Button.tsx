"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "success" };

export default function Button({ variant = "secondary", className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "btn-gradient text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
