"use client";
import React from "react";

type Props = React.LabelHTMLAttributes<HTMLLabelElement> & { children: React.ReactNode };

export default function Label({ children, className = "", ...props }: Props) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`} {...props}>
      {children}
    </label>
  );
}
