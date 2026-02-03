/* Utilities for client-side WordPress -> CSV export
 * - Browser-safe (uses fetch)
 * - Strongly typed JSON helpers
 */

export type Json = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [k: string]: Json };
export type JsonArray = Json[];

export type CsvRow = Record<string, string>;

const EXCLUDE_FIELDS = ['_links', '_embedded'];

export function flattenObject(value: Json, prefix = ''): CsvRow {
  const out: CsvRow = {};

  function walk(v: Json, path: string) {
    if (v === null) {
      out[path] = '';
      return;
    }

    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[path] = String(v);
      return;
    }

    if (Array.isArray(v)) {
      // For arrays, stringify small primitives, otherwise JSON.stringify
      const flat = v.map((item) => {
        if (item === null) return '';
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return String(item);
        return JSON.stringify(item);
      });
      out[path] = flat.join(' | ');
      return;
    }

    // object
    if (typeof v === 'object') {
      const obj = v as JsonObject;
      for (const key of Object.keys(obj)) {
        if (EXCLUDE_FIELDS.includes(key)) continue;
        const next = path ? `${path}.${key}` : key;
        walk(obj[key], next);
      }
      return;
    }
  }

  walk(value, prefix || '');
  return out;
}

export function pickFields(rows: JsonObject[], fields: string[]): CsvRow[] {
  return rows.map((r) => {
    const flat = flattenObject(r);
    const out: CsvRow = {};
    for (const f of fields) {
      out[f] = flat[f] ?? '';
    }
    return out;
  });
}

export async function fetchJson(endpoint: string, path: string, headers?: Record<string, string>) {
  const url = new URL(path, endpoint).toString();
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<unknown>;
}

export async function fetchPostTypes(endpoint: string, headers?: Record<string, string>) {
  const data = await fetchJson(endpoint, '/wp-json/wp/v2/types', headers);
  return data as Record<string, { name?: string } & Record<string, unknown>>;
}

export async function fetchPostsPage(endpoint: string, postType: string, page = 1, perPage = 20, headers?: Record<string, string>) {
  const url = `${endpoint.replace(/\/$/, '')}/wp-json/wp/v2/${postType}?per_page=${perPage}&page=${page}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
  const json = await res.json();
  return { items: json as JsonObject[], totalPages };
}

export async function fetchAllPosts(
  endpoint: string,
  postType: string,
  headers?: Record<string, string>,
  perPage = 100,
  concurrency = 5
) {
  // Fetch first page to get total count
  const first = await fetchPostsPage(endpoint, postType, 1, perPage, headers);
  const result: JsonObject[] = [...first.items];
  const totalPages = first.totalPages;

  // If only 1 page, return early
  if (totalPages <= 1) return result;

  // Fetch remaining pages in batches to avoid overwhelming the server
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

  for (let i = 0; i < remainingPages.length; i += concurrency) {
    const batch = remainingPages.slice(i, i + concurrency);
    const batchPromises = batch.map((pageNum) =>
      fetchPostsPage(endpoint, postType, pageNum, perPage, headers)
    );
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((page) => result.push(...page.items));
  }

  return result;
}

export function inferFieldsFromPost(post: JsonObject): string[] {
  const flat = flattenObject(post);
  return Object.keys(flat).sort();
}

/**
 * Export WordPress posts to CSV using the wp-content-exporter package.
 * This is the primary export method - uses the package for production-grade CSV generation.
 */
export async function exportPostsToCsv(
  endpoint: string,
  postType: string,
  fields: string[],
  token?: string,
  perPage: number = 100
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('exportPostsToCsv only works in the browser');
  }

  try {
    // Dynamic import ensures Node.js code isn't bundled for the browser
    const pkg = await import('wp-content-exporter');
    if (!pkg || typeof pkg.exportToCSV !== 'function') {
      throw new Error('wp-content-exporter package not available');
    }

    const csv = await pkg.exportToCSV({
      endpoint,
      postType,
      fields,
      auth: token ? { token } : undefined,
      perPage,
    });

    return csv;
  } catch (err) {
    // Fallback: fetch all posts manually and generate CSV
    console.warn('wp-content-exporter failed, falling back to manual export:', err);
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const posts = await fetchAllPosts(endpoint, postType, headers, perPage);
    const rows = pickFields(posts, fields);
    // Generate CSV manually
    const headerLine = fields.join(',');
    const dataLines = rows.map((row) =>
      fields.map((f) => {
        const val = row[f] ?? '';
        // Escape quotes and wrap in quotes if contains comma/newline
        const escaped = String(val).replace(/\"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
          ? `"${escaped}"`
          : escaped;
      }).join(',')
    );
    return [headerLine, ...dataLines].join('\n');
  }
}
