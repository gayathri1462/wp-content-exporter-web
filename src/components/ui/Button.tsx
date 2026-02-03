"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "success" };

export default function Button({ variant = "secondary", className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors";
  const variants: Record<string, string> = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-400",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-100",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
