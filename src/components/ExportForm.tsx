"use client";

import React, { useState } from "react";
import { parseCsv } from "@/lib/csv";

type Props = {
  onLoad: (text: string, rows: any[], headers: string[]) => void;
};

export default function ExportForm({ onLoad }: Props) {
  const [endpoint, setEndpoint] = useState("");
  const [useAuth, setUseAuth] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCsv() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        headers: useAuth && token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const text = await res.text();
      const { rows, headers } = parseCsv(text);
      onLoad(text, rows, headers);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch CSV");
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
      } catch (e: any) {
        setError(e.message ?? "Invalid CSV");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow">
      <label className="block text-sm font-medium">Endpoint (URL)</label>
      <input
        className="mt-2 w-full rounded-md border px-3 py-2"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        placeholder="https://example.com/wp-json/wp/v2/posts?export=csv"
      />

      <div className="mt-3 flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useAuth}
            onChange={(e) => setUseAuth(e.target.checked)}
          />
          <span className="text-sm">Use Bearer token</span>
        </label>
        {useAuth && (
          <input
            className="ml-auto w-64 rounded-md border px-3 py-2"
            placeholder="Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="password"
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={fetchCsv}
          disabled={loading || !endpoint}
          className="rounded bg-sky-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Fetching…" : "Fetch CSV"}
        </button>

        <label className="ml-2 flex cursor-pointer items-center gap-2 rounded border px-3 py-2">
          Upload CSV
          <input className="hidden" type="file" accept=".csv,text/csv" onChange={handleFile} />
        </label>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
    </div>
  );
}
