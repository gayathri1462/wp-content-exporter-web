"use client";

import React, { useState } from "react";
import { exportPostsToCsv } from "@/lib/exporterUtils";
import Button from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";

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
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wp-export-${postType}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
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
      className="w-full h-14 text-lg gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Generating CSV...</span>
        </>
      ) : (
        <>
          <Download size={20} />
          <span>Download CSV</span>
        </>
      )}
    </Button>
  );
}
