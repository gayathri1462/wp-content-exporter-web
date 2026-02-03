"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "default" };

export default function Button({ variant = "default", className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const variants: Record<string, string> = {
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    default: "bg-white text-slate-900 border",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
