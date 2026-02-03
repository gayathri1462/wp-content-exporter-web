import Papa from "papaparse";


export function parseCsv(text: string) {
	const parsed: any = Papa.parse(text, {
		header: true,
		skipEmptyLines: true,
	});


if (parsed.errors.length) {
throw new Error("Invalid CSV format");
}


return {
rows: parsed.data,
headers: parsed.meta.fields ?? [],
};
}


export function downloadCsv(rows: any[], filename = "export.csv") {
const csv = Papa.unparse(rows);
const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
}