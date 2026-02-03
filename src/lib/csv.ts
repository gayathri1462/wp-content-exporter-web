import Papa from "papaparse";

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { rows: CsvRow[]; headers: string[] } {
	// Parse CSV text into rows and headers. Papa.parse handles quoted
	// fields and multiline values when `header: true` is set.
	const parsed = Papa.parse<CsvRow>(text, {
		header: true,
		skipEmptyLines: true,
	});

	if (parsed.errors.length > 0) {
		// Surface the first parse error message to the caller
		const first = parsed.errors[0] as { message?: string };
		throw new Error(first?.message ?? "Invalid CSV format");
	}

	return {
		rows: parsed.data,
		headers: parsed.meta.fields ?? [],
	};
}

export function downloadCsv(rows: CsvRow[], filename = "wp-content-export.csv") {
	const csv = Papa.unparse(rows);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}