"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import ExportForm from "@/components/ExportForm";
import CsvTable from "@/components/CsvTable";
import ColumnToggle from "@/components/ColumnToggle";
import { downloadCsv as downloadCsvUtil } from "@/lib/csv";

export default function Home() {
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [visible, setVisible] = useState<string[]>([]);

  function handleLoad(text: string, nextRows: any[], nextHeaders: string[]) {
    setCsvText(text);
    setRows(nextRows);
    setHeaders(nextHeaders);
    setVisible(nextHeaders);
  }

  const fileSizeKB = useMemo(() => Math.round((csvText.length || 0) / 1024), [csvText]);

  function downloadSelected() {
    if (!rows.length) return;
    const out = rows.map((r) => {
      const o: Record<string, any> = {};
      visible.forEach((h) => (o[h] = r[h] ?? ""));
      return o;
    });
    downloadCsvUtil(out, "export.csv");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <main className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">WP Content Exporter</h1>
            <p className="text-sm text-zinc-600">Preview and download CSV from WordPress endpoints</p>
          </div>
          <div className="flex items-center gap-4">
            <Image src="/vercel.svg" alt="Vercel" width={48} height={16} />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-1">
            <ExportForm onLoad={handleLoad} />
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow">
                <div className="text-sm">Rows: <strong>{rows.length}</strong></div>
                <div className="text-sm">Columns: <strong>{headers.length}</strong></div>
                <div className="text-sm">Size: <strong>{fileSizeKB} KB</strong></div>
                <button
                  onClick={downloadSelected}
                  className="mt-3 w-full rounded bg-sky-600 px-4 py-2 text-white"
                >
                  Download CSV
                </button>
              </div>
              <div>
                <ColumnToggle headers={headers} visible={visible} onChange={setVisible} />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <CsvTable rows={rows} headers={headers} visibleColumns={visible} limit={50} />
          </div>
        </div>
      </main>
    </div>
  );
}
