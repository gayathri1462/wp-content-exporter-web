import { describe, it, expect } from 'vitest'
import { parseCsv } from '@/lib/csv'

describe('parseCsv', () => {
  it('parses headers and rows correctly including quoted fields and multiline', () => {
    const csv = `name,age,notes\n"Alice",30,"Line1\nLine2"\n"Bob",25,"Hello, world"`;
    const { headers, rows } = parseCsv(csv);
    expect(headers).toEqual(['name', 'age', 'notes']);
    expect(rows.length).toBe(2);
    expect(rows[0].name).toBe('Alice');
    expect(rows[0].notes).toContain('Line1');
    expect(rows[1].notes).toBe('Hello, world');
  })
})
