function safe(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== "object") {
    if (typeof value === "function") return `[Function ${(value as Function).name || "anonymous"}]`;
    if (typeof value === "bigint") return `${value}n`;
    if (typeof value === "symbol") return value.toString();
    if (value === undefined) return "undefined";
    return value;
  }
  if (seen.has(value as object)) return "[Circular]";
  seen.add(value as object);
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
  if (Array.isArray(value)) return value.map((v) => safe(v, seen));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = safe(v, seen);
  return out;
}

export function formatArg(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(safe(value), null, 2);
  } catch {
    return String(value);
  }
}

export function formatArgs(args: unknown[]): string {
  return args.map(formatArg).join(" ");
}
