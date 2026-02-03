"use client";

import React from "react";
import type { CsvRow } from "@/lib/csv";

type Props = {
  headers: string[];
  visible: string[];
  onChange: (next: string[]) => void;
};

export default function ColumnToggle({ headers, visible, onChange }: Props) {
  function toggle(h: string) {
    if (visible.includes(h)) onChange(visible.filter((v) => v !== h));
    else onChange([...visible, h]);
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="mb-2 text-sm font-medium">Columns</div>
      <div className="grid grid-cols-2 gap-2">
        {headers.map((h) => (
          <label key={h} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={visible.includes(h)}
              onChange={() => toggle(h)}
            />
            <span className="truncate">{h}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
