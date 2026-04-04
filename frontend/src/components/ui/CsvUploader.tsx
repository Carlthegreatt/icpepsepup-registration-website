"use client";
"use client";

import Papa from "papaparse";
import { useRef, useState, useCallback } from "react";

export type ParsedCsv = {
  headers: string[];
  rows: Array<Record<string, string>>;
  rowCount: number;
};

export type CsvMapping = {
  recipient: string; // column key for email address
  name: string; // column key for recipient name
  subject?: string | null; // optional column key for subject
};

type Props = {
  onParsed: (result: { csv: ParsedCsv; mapping: CsvMapping }) => void;
  currentMapping?: CsvMapping;
};

const guessRecipient = (headers: string[]) =>
  headers.find((h) => /^(email|e-mail|recipient|to|address)$/i.test(h)) ||
  headers[0] ||
  "";

const guessName = (headers: string[]) =>
  headers.find((h) => /^(name|full[_\s-]?name|first[_\s-]?name)$/i.test(h)) ||
  headers[0] ||
  "";

const guessSubject = (headers: string[]) =>
  headers.find((h) => /^(subject|title|headline|topic)$/i.test(h)) || null;

export default function CsvUploader({ onParsed, currentMapping }: Props) {
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<CsvMapping | null>(
    currentMapping ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setFileName(file.name);
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
        complete: (results: Papa.ParseResult<Record<string, string>>) => {
          const rows = (results.data || []).filter(Boolean) as Array<
            Record<string, string>
          >;
          const headers = (results.meta.fields || []).map((h) => String(h));
          if (headers.length === 0) {
            setError(
              "No headers found. Ensure the first row contains column names.",
            );
            return;
          }
          const parsed: ParsedCsv = { headers, rows, rowCount: rows.length };
          setCsv(parsed);
          const nextMapping: CsvMapping = {
            recipient: mapping?.recipient || guessRecipient(headers),
            name: mapping?.name || guessName(headers),
            subject: mapping?.subject ?? guessSubject(headers),
          };
          setMapping(nextMapping);
          onParsed({ csv: parsed, mapping: nextMapping });
        },
        error: (err: unknown) => {
          const msg =
            typeof err === "object" && err && "message" in err
              ? String(
                  (err as { message?: string }).message ||
                    "Failed to parse CSV",
                )
              : "Failed to parse CSV";
          setError(msg);
        },
      });
    },
    [mapping, onParsed],
  );

  const onChangeSelect = (key: keyof CsvMapping, value: string) => {
    if (!csv) return;
    const next = {
      ...(mapping || { recipient: "", name: "", subject: null }),
      [key]: value || null,
    } as CsvMapping;
    setMapping(next);
    onParsed({ csv, mapping: next });
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.includes("csv") || file.name.endsWith(".csv")) {
          handleFile(file);
        } else {
          setError("Only .csv files are supported.");
        }
      }
    },
    [handleFile],
  );

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  return (
    <div className="rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.4)] p-5 space-y-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-yellow-50">1) Upload CSV</h2>
            <p className="text-sm text-yellow-100/60">
              Provide a CSV with a header row. Drag & drop or use the button.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="sr-only"
            />
            <label
              htmlFor="csv-file-input"
              className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400 shadow-sm cursor-pointer hover:bg-yellow-500/20 transition-all active:scale-[0.98] focus-within:ring-2 focus-within:ring-yellow-400 focus-within:ring-offset-2 focus-within:ring-offset-[#1a1405]"
            >
              <span className="inline-block">{fileName || "Choose CSV"}</span>
            </label>
            {csv && (
              <button
                type="button"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = "";
                  setCsv(null);
                  setMapping(null);
                  setError(null);
                  setFileName("");
                }}
                className="rounded-xl border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] px-4 py-2 text-sm font-semibold text-yellow-700 shadow-sm hover:text-yellow-500 hover:bg-yellow-950/30 transition-all active:scale-[0.98]"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <div
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          className={`group relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragActive
              ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.15)]"
              : "border-yellow-900/40 hover:border-yellow-700/50 hover:bg-yellow-950/10"
          }`}
        >
          <p
            className={`text-sm font-medium ${dragActive ? "text-yellow-400" : "text-yellow-100/50"}`}
          >
            {dragActive
              ? "Release to upload CSV"
              : "Drag & drop CSV here or use the button above."}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {csv && (
        <div className="space-y-4 pt-2 border-t border-yellow-900/30">
          <h3 className="text-sm font-bold text-yellow-50 uppercase tracking-wider">
            Map Columns
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <label className="text-sm flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
                Recipient column
              </span>
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm bg-[rgba(25,25,10,0.8)] border-yellow-900/50 text-yellow-50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors cursor-pointer"
                value={mapping?.recipient || ""}
                onChange={(e) => onChangeSelect("recipient", e.target.value)}
              >
                {csv.headers.map((h) => (
                  <option value={h} key={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
                Name column
              </span>
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm bg-[rgba(25,25,10,0.8)] border-yellow-900/50 text-yellow-50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors cursor-pointer"
                value={mapping?.name || ""}
                onChange={(e) => onChangeSelect("name", e.target.value)}
              >
                {csv.headers.map((h) => (
                  <option value={h} key={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
                Subject column (optional)
              </span>
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm bg-[rgba(25,25,10,0.8)] border-yellow-900/50 text-yellow-50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors cursor-pointer"
                value={mapping?.subject || ""}
                onChange={(e) => onChangeSelect("subject", e.target.value)}
              >
                <option value="">— None —</option>
                {csv.headers.map((h) => (
                  <option value={h} key={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="text-xs font-medium text-yellow-100/40">
            Rows parsed: {csv.rowCount}
          </div>
        </div>
      )}
    </div>
  );
}
