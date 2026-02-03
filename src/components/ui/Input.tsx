"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export default function Input({ label, className = "", ...props }: Props) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-sm font-semibold text-foreground/80 ml-1">{label}</label>}
      <input
        className={`w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-muted-foreground/50 ${className}`}
        {...props}
      />
    </div>
  );
}
