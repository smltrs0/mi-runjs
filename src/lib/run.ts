import { formatArg, formatArgs } from "./pretty";

export type LineKind = "log" | "warn" | "error" | "info" | "result";

export type OutLine = { kind: LineKind; text: string };

export type RunResult = { lines: OutLine[]; ms: number; error: boolean };

export function runCode(code: string): RunResult {
  const lines: OutLine[] = [];
  const t0 = performance.now();

  const push = (kind: LineKind, args: unknown[]) => {
    lines.push({ kind, text: formatArgs(args) });
  };

  const fake = {
    log: (...a: unknown[]) => push("log", a),
    info: (...a: unknown[]) => push("info", a),
    warn: (...a: unknown[]) => push("warn", a),
    error: (...a: unknown[]) => push("error", a),
    table: (data: unknown) => push("log", [data]),
    clear: () => {
      lines.length = 0;
    },
  };

  let error = false;
  try {
    const fn = new Function("console", `"use strict";\n${code}\n`);
    const ret = fn(fake);
    if (ret !== undefined) lines.push({ kind: "result", text: formatArg(ret) });
  } catch (e) {
    error = true;
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    lines.push({ kind: "error", text: msg });
  }

  return { lines, ms: Math.round(performance.now() - t0), error };
}
