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
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  async function handleExport() {
    if (!endpoint || !postType || fields.length === 0) return;
    setLoading(true);
    setProgress({ current: 0, total: 0 });

    try {
      const csv = await exportPostsToCsv(
        endpoint,
        postType,
        fields,
        token,
        100,
        (current, total) => {
          setProgress({ current, total });
        }
      );

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
      setProgress({ current: 0, total: 0 });
    }
  }

  const progressPercent = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleExport}
        disabled={!endpoint || !postType || fields.length === 0 || loading}
        variant="primary"
        className="w-full h-14 text-lg gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>
              {progress.total > 0
                ? `Processing ${progress.current}/${progress.total} pages...`
                : 'Generating CSV...'}
            </span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Download CSV</span>
          </>
        )}
      </Button>

      {loading && progress.total > 0 && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground font-medium">
            {progressPercent}% complete
          </p>
        </div>
      )}
    </div>
  );
}
