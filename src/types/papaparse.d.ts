declare module "papaparse" {
  export interface ParseMeta {
    fields?: string[];
  }

  export interface ParseResult<T> {
    data: T[];
    errors: unknown[];
    meta: ParseMeta;
  }

  export function parse<T = Record<string, string>>(
    input: string,
    config?: unknown
  ): ParseResult<T>;

  export function unparse(data: unknown): string;

  const Papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };

  export default Papa;
}
