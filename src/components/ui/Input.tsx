"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export default function Input({ label, className = "", ...props }: Props) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <input className={`w-full rounded-md border px-3 py-2 ${className}`} {...props} />
    </div>
  );
}
