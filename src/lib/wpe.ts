export type FetchOptions = {
  token?: string;
  usePackage?: boolean;
  // When using the package, these fields are passed through to the package API
  postType?: string;
  fields?: string[];
  perPage?: number;
};

/**
 * Browser-safe CSV fetch wrapper.
 * - Dynamically imports `wp-content-exporter` only when running in the browser
 *   and when `usePackage` is requested. This avoids bundling Node-only code
 *   into the client bundle and respects the project rule: client-only code.
 * - Falls back to a plain `fetch` when the package is unavailable, not
 *   requested, or the package invocation fails.
 */
export async function fetchCsvFromEndpoint(endpoint: string, options?: FetchOptions): Promise<string> {
  // If package usage is requested and required args are present, try dynamic import
  if (typeof window !== "undefined" && options?.usePackage && options.postType && options.fields && options.fields.length > 0) {
    try {
      // dynamic import executed only on the client
      const pkg = await import("wp-content-exporter");
      if (pkg && typeof pkg.exportToCSV === "function") {
        const pkgOpts = {
          endpoint,
          postType: options.postType,
          fields: options.fields,
          perPage: options.perPage,
          auth: options.token ? { token: options.token } : undefined,
        } as any;
        const csv = await pkg.exportToCSV(pkgOpts);
        return csv;
      }
    } catch (err) {
      // Do not throw here; fallback to fetch below to keep the client experience robust
      // Log so developers can debug package-related issues.
      // Important: keep error handling client-friendly and non-blocking.
      // eslint-disable-next-line no-console
      console.warn("wp-content-exporter dynamic import failed, falling back to fetch:", err);
    }
  }

  // Fallback: simple fetch that supports Bearer token (browser-only)
  const headers: Record<string, string> = {};
  if (options?.token) headers["Authorization"] = `Bearer ${options.token}`;

  const res = await fetch(endpoint, { headers });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  return text;
}

