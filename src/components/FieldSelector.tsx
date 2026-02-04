"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Search, Eye, Filter, CheckSquare, Square, Trash2 } from "lucide-react";

type Props = {
  fields: string[];
  initialSelected?: string[];
  sampleData?: Record<string, string>;
  onSelect: (selected: string[]) => void;
};

export default function FieldSelector({ fields, initialSelected, sampleData, onSelect }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected || []));
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
            className="w-full rounded-xl border border-border/50 bg-background/50 pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Fields</label>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selected.size} / {fields.length}</span>
            </div>
            <div className="glass bg-background border-border/50 rounded-2xl p-2 h-[320px] md:h-[400px] lg:h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2 animate-in fade-in duration-500">
                  <Search size={32} />
                  <p className="text-sm font-medium">No fields found for &quot;{search}&quot;</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {filtered.map((field, idx) => (
                    <button
                      key={field}
                      onClick={() => {
                        toggle(field);
                        setHoveredField(field);
                      }}
                      onMouseEnter={() => setHoveredField(field)}
                      onMouseLeave={() => setHoveredField(null)}
                      className={`flex items-center gap-3 p-3 m-1 rounded-xl transition-all text-left group/field animate-in slide-in-from-left-2 duration-300 ${selected.has(field)
                        ? "bg-primary text-primary-foreground font-bold shadow-lg border-primary scale-[1.01]"
                        : "hover:bg-secondary text-foreground font-medium"
                        }`}
                      style={{ animationDelay: `${Math.min(idx * 20, 200)}ms` }}
                    >
                      {selected.has(field) ? (
                        <CheckSquare size={18} className="animate-in zoom-in duration-200" />
                      ) : (
                        <Square size={18} className="text-muted-foreground group-hover/field:text-primary transition-colors" />
                      )}
                      <span className="truncate flex-1 text-sm font-medium">
                        {getFieldLabel(field)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block px-1 mb-2">Live Preview</label>
            <div className="glass bg-card border-border/50 rounded-2xl p-6 h-[280px] md:h-[400px] lg:h-[400px] relative group overflow-y-auto custom-scrollbar shadow-sm">
              <div className="absolute top-6 right-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <Eye size={20} className="animate-pulse" />
              </div>

              {hoveredField ? (
                <div key={hoveredField} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">Field ID</p>
                    <p className="text-xs font-mono break-all font-bold bg-muted p-3 rounded-lg border border-border">{hoveredField}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">Sample Content</p>
                    <div className="text-sm leading-relaxed text-foreground font-semibold break-words bg-muted/50 p-4 rounded-lg border border-border">
                      {sampleValue || <span className="text-muted-foreground italic font-normal">Empty or null</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-5 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary flex items-center justify-center animate-bounce-slow">
                    <Search size={24} className="text-primary" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed text-foreground">Hover or Tap Any Field<br />to Preview</p>
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
