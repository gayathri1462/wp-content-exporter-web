"use client";

import React from "react";
import type { CsvRow } from "@/lib/csv";

type Props = {
  rows: CsvRow[];
  headers: string[];
  visibleColumns: string[];
  limit?: number;
};

export default function CsvTable({ rows, headers, visibleColumns, limit = 50 }: Props) {
  if (rows.length === 0) {
    return <div className="rounded-2xl bg-white p-6">No data loaded</div>;
  }

  const display = rows.slice(0, limit);

  return (
    <div className="overflow-auto rounded-2xl bg-white p-4 shadow">
      <div className="mb-2 text-sm text-muted-foreground">
        Showing {display.length} of {rows.length} rows
      </div>
      <table className="min-w-full table-auto border-collapse">
        <thead className="sticky top-0 bg-white">
          <tr>
            {headers.filter((h) => visibleColumns.includes(h)).map((h) => (
              <th key={h} className="border-b px-3 py-2 text-left text-sm font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {display.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {headers.filter((h) => visibleColumns.includes(h)).map((h) => (
                <td key={h} className="border-b px-3 py-2 text-sm">
                  {row[h] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
