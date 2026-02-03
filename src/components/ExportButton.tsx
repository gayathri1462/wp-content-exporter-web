"use client";

import React, { useState } from "react";
import { exportPostsToCsv, type JsonObject } from "@/lib/exporterUtils";
import Button from "@/components/ui/Button";

type Props = {
  endpoint: string;
  postType: string;
  fields: string[];
  token?: string;
};

export default function ExportButton({ endpoint, postType, fields, token }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!endpoint || !postType || fields.length === 0) return;
    setLoading(true);
    try {
      const csv = await exportPostsToCsv(endpoint, postType, fields, token);
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wordpress-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={!endpoint || !postType || fields.length === 0 || loading}
      variant="primary"
    >
      {loading ? "Exporting…" : `Download CSV (${fields.length} fields)`}
    </Button>
  );
}
