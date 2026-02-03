declare module "wp-content-exporter" {
  export type ExportOptions = {
    endpoint: string;
    postType: string;
    fields: string[];
    auth?: { token?: string };
    perPage?: number;
    outputFile?: string;
  };

  // Main package export: exportToCSV(options) -> Promise<string>
  export function exportToCSV(options: ExportOptions): Promise<string>;

  const _default: {
    exportToCSV: typeof exportToCSV;
  };

  export default _default;
}
