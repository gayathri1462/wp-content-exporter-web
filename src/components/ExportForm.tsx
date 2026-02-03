"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import Label from "@/components/ui/Label";
import Card from "@/components/ui/Card";
import { parseCsv, type CsvRow } from "@/lib/csv";
import { fetchCsvFromEndpoint } from "@/lib/wpe";

type Props = {
  onLoad: (text: string, rows: CsvRow[], headers: string[]) => void;
};

export default function ExportForm({ onLoad }: Props) {
  const [endpoint, setEndpoint] = useState("");
  const [useAuth, setUseAuth] = useState(false);
  const [token, setToken] = useState("");
  const [usePackage, setUsePackage] = useState(false);
  const [postType, setPostType] = useState("");
  const [fieldsText, setFieldsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCsv() {
    setError(null);
    setLoading(true);
    try {
      const opts = {
        token: useAuth ? token : undefined,
        usePackage: usePackage || undefined,
        postType: postType || undefined,
        fields: fieldsText ? fieldsText.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      };

      const text = await fetchCsvFromEndpoint(endpoint, opts);
      const { rows, headers } = parseCsv(text);
      onLoad(text, rows, headers);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to fetch CSV");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      try {
        const { rows, headers } = parseCsv(text);
        onLoad(text, rows, headers);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message || "Invalid CSV");
      }
    };
    reader.readAsText(file);
  }

  return (
    <Card>
      <div className="space-y-3">
        <Label>Endpoint (URL)</Label>
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://example.com/wp-json/wp/v2/posts?export=csv"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Switch checked={useAuth} onChange={setUseAuth} label="Requires Authentication" />
            {useAuth && (
              <Input
                type="password"
                placeholder="Bearer token"
                className="w-64"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={usePackage} onChange={setUsePackage} label="Use package export" />
          </div>
        </div>

        {usePackage && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Post type" value={postType} onChange={(e) => setPostType(e.target.value)} placeholder="posts" />
            <Input label="Fields (comma separated)" value={fieldsText} onChange={(e) => setFieldsText(e.target.value)} placeholder="title.rendered,slug,date" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={fetchCsv} disabled={loading || !endpoint} variant="primary">
            {loading ? "Fetching…" : "Fetch CSV"}
          </Button>

          <label className="ml-2 flex cursor-pointer items-center gap-2 rounded border px-3 py-2">
            Upload CSV
            <input className="hidden" type="file" accept=".csv,text/csv" onChange={handleFile} />
          </label>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </Card>
  );
}
