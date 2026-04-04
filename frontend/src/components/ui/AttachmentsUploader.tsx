"use client";

import { normalizeNameKey } from "@/utils/normalizeName";
import { useCallback, useMemo, useRef } from "react";
import type { ParsedCsv, CsvMapping } from "./CsvUploader";

export type AttachmentEntry = {
  filename: string;
  contentBase64: string;
  contentType?: string;
  sizeBytes?: number;
};
export type AttachIndex = Record<string, AttachmentEntry[]>; // key: normalized name (lowercase, trimmed)

type Props = {
  csv: ParsedCsv | null;
  mapping: CsvMapping | null;
  value: AttachIndex;
  onChange: (next: AttachIndex) => void;
};

export default function AttachmentsUploader({
  csv,
  mapping,
  value,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileBaseName = useCallback((name: string) => {
    const idx = name.lastIndexOf(".");
    return idx > 0 ? name.slice(0, idx) : name;
  }, []);

  const rowsNameSet = useMemo(() => {
    if (!csv || !mapping) return new Set<string>();
    const s = new Set<string>();
    (csv.rows as Array<Record<string, string>>).forEach((r) =>
      s.add(normalizeNameKey(String(r[mapping.name] || ""))),
    );
    return s;
  }, [csv, mapping]);

  const computed = useMemo(() => {
    const files = Object.values(value).reduce(
      (acc, arr) => acc + arr.length,
      0,
    );
    let matched = 0;
    const unmatched: string[] = [];
    for (const [key, arr] of Object.entries(value)) {
      if (rowsNameSet.has(key)) matched += arr.length;
      else unmatched.push(...arr.map((a) => a.filename));
    }
    return {
      files,
      matched,
      unmatched: files - matched,
      unmatchedFiles: unmatched,
    };
  }, [value, rowsNameSet]);

  const largePdfDetected = useMemo(() => {
    const min = 1024 * 1024;
    const max = 2 * 1024 * 1024;
    return Object.values(value).some((arr) =>
      Array.isArray(arr)
        ? arr.some((entry) => {
            if (!entry) return false;
            const size = entry.sizeBytes ?? 0;
            const filename = entry.filename?.toLowerCase() || "";
            const mime = (entry.contentType || "").toLowerCase();
            const isPdf = mime.includes("pdf") || filename.endsWith(".pdf");
            return Boolean(isPdf && size >= min && size <= max);
          })
        : false,
    );
  }, [value]);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const res = String(fr.result || "");
        const idx = res.indexOf("base64,");
        resolve(idx >= 0 ? res.slice(idx + 7) : res);
      };
      fr.onerror = () => reject(fr.error || new Error("read error"));
      fr.readAsDataURL(file);
    });

  const onUpload = async (
    files: FileList | null,
    source?: HTMLInputElement | null,
  ) => {
    if (!files || files.length === 0) return;
    const next: AttachIndex = { ...value };
    for (const f of Array.from(files)) {
      try {
        const contentBase64 = await fileToBase64(f);
        const key = normalizeNameKey(fileBaseName(f.name));
        const entry: AttachmentEntry = {
          filename: f.name,
          contentBase64,
          contentType: f.type || undefined,
          sizeBytes: typeof f.size === "number" ? f.size : undefined,
        };
        next[key] = [...(next[key] || []), entry];
      } catch {
        // ignore failed file
      }
    }
    onChange(next);
    if (source) source.value = "";
  };

  const clearAll = () => {
    onChange({});
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.4)] p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-yellow-50">
            2) Upload Attachments (optional)
          </h2>
          <p className="text-xs text-yellow-100/60 mt-1">
            File base name must match the CSV{" "}
            <strong className="text-yellow-400">Name</strong> column
            (case-insensitive). Multiple files per name are allowed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400 shadow-sm cursor-pointer hover:bg-yellow-500/20 transition-all active:scale-[0.98]">
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files, e.target)}
            />
            Choose files…
          </label>
          <button
            type="button"
            onClick={clearAll}
            disabled={computed.files === 0}
            className="rounded-xl border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] px-4 py-2 text-sm font-semibold text-yellow-700 shadow-sm hover:text-yellow-500 hover:bg-yellow-950/30 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="text-xs flex flex-wrap gap-4 pt-3 border-t border-yellow-900/30">
        <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-wider opacity-70">
          Summary:
        </span>
        <span className="text-yellow-50">
          <strong className="text-yellow-400">Total:</strong> {computed.files}
        </span>
        <span className="text-emerald-400">
          <strong className="text-emerald-500">Matched:</strong>{" "}
          {computed.matched}
        </span>
        <span className="text-red-400">
          <strong className="text-red-500">Unmatched:</strong>{" "}
          {computed.unmatched}
        </span>
      </div>

      {computed.unmatchedFiles.length > 0 && (
        <details className="text-xs group">
          <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300 transition-colors font-medium select-none">
            View unmatched files
          </summary>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-yellow-100/70">
            {computed.unmatchedFiles.slice(0, 30).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
            {computed.unmatchedFiles.length > 30 && (
              <li className="text-yellow-500/50 italic">
                …and {computed.unmatchedFiles.length - 30} more
              </li>
            )}
          </ul>
        </details>
      )}

      {largePdfDetected && (
        <div className="text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3 shadow-[0_0_15px_rgba(251,191,36,0.1)] leading-relaxed">
          Large 1-2 MB PDF attachments detected. Batch sending will be limited
          to 1 email per send to stay under attachment limits.
        </div>
      )}
    </div>
  );
}
