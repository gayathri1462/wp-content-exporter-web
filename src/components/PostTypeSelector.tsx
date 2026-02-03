"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fetchPostTypes } from "@/lib/exporterUtils";
import { Layers, ChevronRight, Loader2 } from "lucide-react";

type PostTypeMetadata = { name?: string } & Record<string, unknown>;

type Props = {
  endpoint: string;
  token?: string;
  onSelect: (postType: string) => Promise<void>;
};

export default function PostTypeSelector({ endpoint, token, onSelect }: Props) {
  const [postTypes, setPostTypes] = useState<Record<string, PostTypeMetadata>>({});
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const types = await fetchPostTypes(endpoint, headers);
        setPostTypes(types);
        const first = Object.keys(types)[0];
        if (first) setSelected(first);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || "Failed to load post types");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [endpoint, token]);

  async function handleSelect() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onSelect(selected);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to select post type");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <Loader2 className="text-primary animate-spin" size={32} />
        <p className="text-sm font-medium text-muted-foreground">Loading post types...</p>
      </Card>
    );
  }

  return (
    <Card className="animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Layers size={18} />
            <h3 className="font-bold text-lg">Select Content Type</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose the type of WordPress content you want to export.
          </p>
        </header>

        <div className="relative">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full appearance-none border border-border/50 bg-background/50 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 cursor-pointer"
          >
            {Object.entries(postTypes).map(([key, meta]) => (
              <option key={key} value={key} className="bg-background">
                {(meta.name as string) || key}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground">
            <ChevronRight size={16} className="rotate-90" />
          </div>
        </div>

        <Button
          onClick={handleSelect}
          disabled={submitting || !selected}
          variant="primary"
          className="w-full font-bold h-12"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Processing...
            </span>
          ) : "Next: Select Fields"}
        </Button>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}
