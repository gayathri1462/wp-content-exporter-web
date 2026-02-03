"use client";

import React from "react";
import { downloadCsv } from "@/lib/csv";
import { pickFields, type CsvRow, type JsonObject } from "@/lib/exporterUtils";
import Button from "@/components/ui/Button";

type Props = {
  rows: JsonObject[];
  fields: string[];
};

export default function ExportButton({ rows, fields }: Props) {
  function handleExport() {
    if (rows.length === 0 || fields.length === 0) return;
    const data = pickFields(rows, fields);
    downloadCsv(data, "wordpress-export.csv");
  }

  return (
    <Button onClick={handleExport} disabled={rows.length === 0 || fields.length === 0} variant="primary">
      Download CSV ({rows.length} posts, {fields.length} fields)
    </Button>
  );
}
