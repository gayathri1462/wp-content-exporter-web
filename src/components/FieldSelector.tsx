"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Props = {
  fields: string[];
  onSelect: (selected: string[]) => void;
};

export default function FieldSelector({ fields, onSelect }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(fields.slice(0, 10)));
  const [search, setSearch] = useState("");

  const filtered = fields.filter((f) => f.toLowerCase().includes(search.toLowerCase()));

  function toggle(field: string) {
    const next = new Set(selected);
    if (next.has(field)) next.delete(field);
    else next.add(field);
    setSelected(next);
  }

  function handleExport() {
    onSelect(Array.from(selected).sort());
  }

  return (
    <Card>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Search Fields</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Available Fields ({selected.size} selected)</label>
            <button
              onClick={() => setSelected(new Set(fields))}
              className="text-xs text-blue-600 hover:underline"
            >
              Select all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3 max-h-64 overflow-y-auto bg-slate-50">
            {filtered.length === 0 ? (
              <div className="text-sm text-gray-500">No fields found</div>
            ) : (
              filtered.map((field) => (
                <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(field)}
                    onChange={() => toggle(field)}
                  />
                  <span className="truncate">{field}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <Button onClick={handleExport} disabled={selected.size === 0} variant="primary">
          Export {selected.size} Fields
        </Button>
      </div>
    </Card>
  );
}
