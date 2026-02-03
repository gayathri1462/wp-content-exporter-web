"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fetchPostTypes } from "@/lib/exporterUtils";

type PostTypeMetadata = { name?: string } & Record<string, unknown>;

type Props = {
  endpoint: string;
  headers: Record<string, string>;
  onSelect: (postType: string) => Promise<void>;
};

export default function PostTypeSelector({ endpoint, headers, onSelect }: Props) {
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
        const types = await fetchPostTypes(endpoint, headers);
        setPostTypes(types);
        // Pre-select first available type
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
  }, [endpoint, headers]);

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

  if (loading) return <Card><div className="text-sm">Loading post types…</div></Card>;

  return (
    <Card>
      <div className="space-y-3">
        <label className="block text-sm font-medium">Post Type</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        >
          {Object.entries(postTypes).map(([key, meta]) => (
            <option key={key} value={key}>
              {(meta.name as string) || key}
            </option>
          ))}
        </select>

        <Button onClick={handleSelect} disabled={submitting || !selected} variant="primary">
          {submitting ? "Loading…" : "Next: Select Fields"}
        </Button>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </Card>
  );
}
