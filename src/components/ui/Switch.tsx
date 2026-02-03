"use client";
import React from "react";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

export default function Switch({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex items-center space-x-2">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-9 rounded-full appearance-none bg-slate-200 checked:bg-sky-600 relative after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all checked:after:translate-x-4"
      />
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}
