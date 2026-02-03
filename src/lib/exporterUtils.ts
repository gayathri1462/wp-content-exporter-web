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

export async function fetchAllPosts(endpoint: string, postType: string, headers?: Record<string, string>, perPage = 100) {
  const first = await fetchPostsPage(endpoint, postType, 1, perPage, headers);
  const result: JsonObject[] = [...first.items];
  const pages = first.totalPages;
  for (let p = 2; p <= pages; p++) {
    const page = await fetchPostsPage(endpoint, postType, p, perPage, headers);
    result.push(...page.items);
  }
  return result;
}

export function inferFieldsFromPost(post: JsonObject): string[] {
  const flat = flattenObject(post);
  return Object.keys(flat).sort();
}
