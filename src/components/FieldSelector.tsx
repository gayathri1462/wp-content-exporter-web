"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Props = {
  fields: string[];
  sampleData?: Record<string, string>;
  onSelect: (selected: string[]) => void;
};

export default function FieldSelector({ fields, sampleData, onSelect }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(fields.slice(0, 10)));
  const [search, setSearch] = useState("");
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const filtered = fields.filter((f) => f.toLowerCase().includes(search.toLowerCase()));

  function getFieldLabel(field: string): string {
    // Make field names more readable by replacing dots/underscores with spaces and title casing
    return field
      .split('.')
      .map(part => part.replace(/_/g, ' ').split(/(?=[A-Z])/).join(' ').trim())
      .join(' › ')
      .replace(/^\w/, c => c.toUpperCase());
  }

  function toggle(field: string) {
    const next = new Set(selected);
    if (next.has(field)) next.delete(field);
    else next.add(field);
    setSelected(next);
  }

  function handleExport() {
    onSelect(Array.from(selected).sort());
  }

  const sampleValue = hoveredField && sampleData?.[hoveredField];

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Select Fields to Export</h3>
          <p className="text-sm text-gray-600 mb-3">
            Choose which fields to include in your CSV export. Hover over fields to see sample data.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search Fields</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by field name…"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Available Fields</label>
              <span className="text-xs text-gray-500">{selected.size} of {fields.length} selected</span>
            </div>
            <div className="border rounded-md p-3 max-h-80 overflow-y-auto bg-slate-50 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center">No fields found</div>
              ) : (
                filtered.map((field) => (
                  <label
                    key={field}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-50 transition text-sm"
                    onMouseEnter={() => setHoveredField(field)}
                    onMouseLeave={() => setHoveredField(null)}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(field)}
                      onChange={() => toggle(field)}
                      className="rounded"
                    />
                    <span title={field} className="truncate flex-1">
                      {getFieldLabel(field)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Sample Value</label>
            <div className="border rounded-md p-3 bg-slate-50 max-h-80 overflow-y-auto">
              {hoveredField ? (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-gray-600 break-all">{hoveredField}</div>
                  {sampleValue ? (
                    <div className="text-sm text-gray-800 break-words">
                      {sampleValue.length > 200 ? `${sampleValue.substring(0, 200)}…` : sampleValue}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No sample data available</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400">Hover over a field to see sample data</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setSelected(new Set(fields))}
            variant="secondary"
            className="text-sm"
          >
            Select All
          </Button>
          <Button
            onClick={() => setSelected(new Set())}
            variant="secondary"
            className="text-sm"
          >
            Clear All
          </Button>
          <Button
            onClick={handleExport}
            disabled={selected.size === 0}
            variant="primary"
            className="flex-1"
          >
            Export {selected.size} {selected.size === 1 ? 'Field' : 'Fields'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
