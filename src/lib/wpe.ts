import type { ExportOptions as PackageExportOptions } from "wp-content-exporter";
import { exportToCSV as packageExportToCSV } from "wp-content-exporter";

export type FetchOptions = {
  token?: string;
  usePackage?: boolean;
  // When using the package, these two fields are required by the package API
  postType?: string;
  fields?: string[];
  perPage?: number;
};

/**
 * Attempt to export CSV using the `wp-content-exporter` package when
 * `usePackage` is true and required package params are provided.
 * Otherwise fall back to a plain fetch of the endpoint.
 */
export async function fetchCsvFromEndpoint(endpoint: string, options?: FetchOptions): Promise<string> {
  // If package usage is requested and required args are present, prefer it.
  if (options?.usePackage && options.postType && options.fields && options.fields.length > 0) {
    const pkgOpts: PackageExportOptions = {
      endpoint,
      postType: options.postType,
      fields: options.fields,
      perPage: options.perPage,
      auth: options.token ? { token: options.token } : undefined,
    };

    try {
      const csv = await packageExportToCSV(pkgOpts);
      return csv;
    } catch (err) {
      // if package fails, we'll fall back to fetch below
      // but surface a clear error if it's a fatal package error
      console.warn("wp-content-exporter failed, falling back to fetch:", err);
    }
  }

  // Fallback: simple fetch that supports Bearer token
  const headers: Record<string, string> = {};
  if (options?.token) headers["Authorization"] = `Bearer ${options.token}`;

  const res = await fetch(endpoint, { headers });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  return text;
}

