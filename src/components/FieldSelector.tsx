"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Search, Eye, Filter, CheckSquare, Square, Trash2 } from "lucide-react";

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
    <Card className="animate-in fade-in zoom-in-95 duration-500 overflow-visible">
      <div className="space-y-6">
        <header className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Filter size={18} />
              <h3 className="font-bold text-lg">Configure Export Fields</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the specific data points you want to include in your CSV.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSelected(new Set(fields))} variant="secondary" className="px-3 h-9 text-xs">
              Select All
            </Button>
            <Button onClick={() => setSelected(new Set())} variant="secondary" className="px-3 h-9 text-xs">
              <Trash2 size={14} className="mr-1" /> Clear
            </Button>
          </div>
        </header>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground/50">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for fields (e.g. title, author, meta...)"
            className="w-full border border-border/50 bg-background/50 pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-2">
            <div className="flex justify-between items-center mb-1 px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Fields</label>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5">{selected.size} / {fields.length}</span>
            </div>
            <div className="glass bg-background/40 border-border/30 p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
                  <Search size={32} className="opacity-20" />
                  <p className="text-sm">No fields found for &quot;{search}&quot;</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {filtered.map((field) => (
                    <button
                      key={field}
                      onClick={() => toggle(field)}
                      onMouseEnter={() => setHoveredField(field)}
                      onMouseLeave={() => setHoveredField(null)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selected.has(field)
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-secondary/50 text-foreground/70"
                        }`}
                    >
                      {selected.has(field) ? <CheckSquare size={18} /> : <Square size={18} className="opacity-40" />}
                      <span className="truncate flex-1 text-sm">
                        {getFieldLabel(field)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block px-1">Live Preview</label>
            <div className="glass bg-primary/5 border-primary/10 rounded-2xl p-5 h-full min-h-[200px] flex flex-col relative group">
              <div className="absolute top-4 right-4 text-primary/30 group-hover:text-primary/50 transition-colors">
                <Eye size={20} />
              </div>

              {hoveredField ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">Field ID</p>
                    <p className="text-xs font-mono break-all font-medium">{hoveredField}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">Sample Content</p>
                    <div className="text-sm leading-relaxed text-foreground/80 break-words line-clamp-6">
                      {sampleValue || <span className="text-muted-foreground/50 italic">Empty or null</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3 text-muted-foreground/40">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                    <Search size={20} />
                  </div>
                  <p className="text-xs italic">Hover over a field to preview its content from your WordPress site.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleExport}
            disabled={selected.size === 0}
            variant="primary"
            className="w-full text-base font-bold h-14"
          >
            Export {selected.size} {selected.size === 1 ? 'Field' : 'Fields'} to CSV
          </Button>
        </div>
      </div>
    </Card>
  );
}
