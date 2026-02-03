"use client";
import React from "react";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

export default function Switch({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex items-center space-x-2 cursor-pointer group">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-11 appearance-none rounded-full bg-muted border-2 border-border checked:bg-primary checked:border-primary relative transition-colors duration-200 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-all checked:after:translate-x-5 checked:after:bg-primary-foreground shadow-inner cursor-pointer"
      />
      {label && <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>}
    </label>
  );
}
