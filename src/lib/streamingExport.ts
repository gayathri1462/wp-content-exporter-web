/**
 * Streaming CSV export for large WordPress datasets
 * Processes data in chunks to avoid memory issues
 */

import { JsonObject, CsvRow, flattenObject, fetchPostsPage } from './exporterUtils';

export interface ProgressInfo {
    currentPage: number;
    totalPages: number;
    postsProcessed: number;
    estimatedTotal: number;
}

export type ProgressCallback = (progress: ProgressInfo) => void;

export interface StreamingExportOptions {
    endpoint: string;
    postType: string;
    fields: string[];
    headers?: Record<string, string>;
    perPage?: number;
    onProgress?: ProgressCallback;
    signal?: AbortSignal;
}

/**
 * Generate CSV in chunks using streaming approach
 * Memory-efficient for large datasets
 */
export async function* streamCsvRows(
    options: StreamingExportOptions
): AsyncGenerator<string, void, unknown> {
    const { endpoint, postType, fields, headers, perPage = 100, onProgress, signal } = options;

    // Yield CSV header
    yield fields.join(',') + '\n';

    // Fetch first page to get total
    const firstPage = await fetchPostsPage(endpoint, postType, 1, perPage, headers);
    const totalPages = firstPage.totalPages;
    let postsProcessed = 0;

    // Process first page
    for (const post of firstPage.items) {
        if (signal?.aborted) throw new Error('Export cancelled');

        const row = extractFields(post, fields);
        yield formatCsvRow(row, fields) + '\n';
        postsProcessed++;
    }

    onProgress?.({
        currentPage: 1,
        totalPages,
        postsProcessed,
        estimatedTotal: totalPages * perPage,
    });

    // Process remaining pages
    for (let page = 2; page <= totalPages; page++) {
        if (signal?.aborted) throw new Error('Export cancelled');

        const pageData = await fetchPostsPage(endpoint, postType, page, perPage, headers);

        for (const post of pageData.items) {
            if (signal?.aborted) throw new Error('Export cancelled');

            const row = extractFields(post, fields);
            yield formatCsvRow(row, fields) + '\n';
            postsProcessed++;
        }

        onProgress?.({
            currentPage: page,
            totalPages,
            postsProcessed,
            estimatedTotal: totalPages * perPage,
        });
    }
}

/**
 * Extract and flatten selected fields from a post
 * Optimized to only process requested fields
 */
function extractFields(post: JsonObject, fields: string[]): CsvRow {
    const flattened = flattenObject(post);
    const result: CsvRow = {};

    for (const field of fields) {
        result[field] = flattened[field] ?? '';
    }

    return result;
}

/**
 * Format a row as CSV with proper escaping
 */
function formatCsvRow(row: CsvRow, fields: string[]): string {
    return fields
        .map((field) => {
            const value = row[field] ?? '';
            const str = String(value);

            // Escape quotes and wrap in quotes if contains comma/newline/quote
            const escaped = str.replace(/"/g, '""');
            return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
                ? `"${escaped}"`
                : escaped;
        })
        .join(',');
}

/**
 * Export to CSV using streaming approach
 * Returns a Blob for download
 */
export async function exportWithStreaming(
    options: StreamingExportOptions
): Promise<Blob> {
    const chunks: string[] = [];

    for await (const chunk of streamCsvRows(options)) {
        chunks.push(chunk);
    }

    return new Blob(chunks, { type: 'text/csv;charset=utf-8;' });
}
