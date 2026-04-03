"use client";

import { useMemo, useState } from "react";
import type { ParsedCsv, CsvMapping } from "./CsvUploader";

type Props = {
  csv: ParsedCsv | null;
  mapping?: CsvMapping | null;
  onMappingChange?: (m: CsvMapping | null) => void;
  onChange?: (csv: ParsedCsv | null) => void;
};

export default function CsvTable({
  csv,
  mapping,
  onMappingChange,
  onChange,
}: Props) {
  const [limit, setLimit] = useState<number>(100);
  const [q, setQ] = useState<string>("");
  const [editingCell, setEditingCell] = useState<{
    row: number;
    header: string;
  } | null>(null);
  const [newHeader, setNewHeader] = useState<string>("");
  const [showAddCol, setShowAddCol] = useState<boolean>(false);

  const rows = useMemo(() => {
    if (!csv) return [] as Array<Record<string, string>>;
    const all = csv.rows as Array<Record<string, string>>;
    if (!q) return all.slice(0, limit);
    const lower = q.toLowerCase();
    const filtered = all.filter((r) =>
      csv.headers.some((h) =>
        String(r[h] ?? "")
          .toLowerCase()
          .includes(lower),
      ),
    );
    return filtered.slice(0, limit);
  }, [csv, q, limit]);

  if (!csv)
    return (
      <div className="text-sm font-medium text-yellow-100/60">
        No CSV loaded.
      </div>
    );

  const commitCell = (rowIndex: number, header: string, value: string) => {
    const updatedRows = [...csv.rows];
    const target = { ...(updatedRows[rowIndex] as Record<string, string>) };
    target[header] = value;
    updatedRows[rowIndex] = target;
    const updatedCsv: ParsedCsv = { ...csv, rows: updatedRows };
    onChange?.(updatedCsv);
    setEditingCell(null);
  };

  const deleteColumn = (header: string) => {
    const newHeaders = csv.headers.filter((h) => h !== header);
    const newRows = csv.rows.map((r) => {
      const copy = { ...(r as Record<string, string>) };
      delete copy[header];
      return copy;
    });
    const updated: ParsedCsv = { ...csv, headers: newHeaders, rows: newRows };
    onChange?.(updated);
    // Clear mapping if affected
    if (
      mapping &&
      (mapping.recipient === header ||
        mapping.name === header ||
        mapping.subject === header)
    ) {
      onMappingChange?.({
        recipient: mapping.recipient === header ? "" : mapping.recipient,
        name: mapping.name === header ? "" : mapping.name,
        subject: mapping.subject === header ? null : mapping.subject,
      });
    }
  };

  const addColumn = () => {
    const headerName = newHeader.trim();
    if (!headerName || csv.headers.includes(headerName)) return;
    const newHeaders = [...csv.headers, headerName];
    const newRows = csv.rows.map((r) => ({
      ...(r as Record<string, string>),
      [headerName]: "",
    }));
    const updated: ParsedCsv = { ...csv, headers: newHeaders, rows: newRows };
    onChange?.(updated);
    setNewHeader("");
    setShowAddCol(false);
  };

  const downloadCsv = () => {
    const headerLine = csv.headers.join(",");
    const lines = csv.rows.map((r) =>
      csv.headers
        .map((h) => {
          const v = (r as Record<string, string>)[h] ?? "";
          const escaped = '"' + String(v).replace(/"/g, '""') + '"';
          return escaped;
        })
        .join(","),
    );
    const content = [headerLine, ...lines].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batchmail-modified.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.4)] p-5">
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <div className="text-[11px] font-bold text-yellow-500 uppercase tracking-wider opacity-70 mt-1">
          Rows: {csv.rowCount}
        </div>
        <label className="inline-flex items-center gap-2">
          <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
            Search
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-lg border border-yellow-900/50 bg-[rgba(25,25,10,0.8)] px-3 py-1.5 text-sm text-yellow-50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 placeholder:text-yellow-700/50 transition-colors"
            placeholder="Filter..."
          />
        </label>
        <label className="inline-flex items-center gap-2">
          <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
            Show
          </span>
          <select
            className="rounded-lg border border-yellow-900/50 bg-[rgba(25,25,10,0.8)] px-2 py-1.5 text-sm text-yellow-50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors cursor-pointer"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={downloadCsv}
          className="rounded-lg border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] px-4 py-1.5 text-sm font-semibold text-yellow-600 shadow-sm hover:text-yellow-400 hover:bg-yellow-950/30 transition-all active:scale-[0.98]"
        >
          Download CSV
        </button>
      </div>

      {showAddCol && (
        <div className="flex items-center gap-3 text-sm pt-2">
          <input
            value={newHeader}
            onChange={(e) => setNewHeader(e.target.value)}
            placeholder="New column name"
            className="w-52 rounded-lg border border-yellow-900/50 bg-[rgba(25,25,10,0.8)] px-3 py-1.5 text-sm text-yellow-50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 placeholder:text-yellow-700/50 transition-colors"
          />
          <button
            type="button"
            onClick={addColumn}
            className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-sm font-bold text-yellow-400 shadow-sm hover:bg-yellow-500/20 transition-all active:scale-[0.98]"
          >
            Add
          </button>
        </div>
      )}

      <div className="overflow-auto max-h-[60vh] border border-yellow-900/50 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] custom-scrollbar">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-[rgba(35,35,15,0.95)] backdrop-blur-md z-10 shadow-sm border-b border-yellow-900/50">
            <tr>
              {csv.headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 border-r border-yellow-900/40 last:border-r-0 text-left font-bold text-yellow-400 min-w-[140px] uppercase tracking-wider text-[11px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" title={h}>
                      {h}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteColumn(h)}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      aria-label={`Delete column ${h}`}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCol((v) => !v)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                  >
                    {showAddCol ? "Cancel" : "+ Column"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blank: Record<string, string> = {};
                      csv.headers.forEach((h) => (blank[h] = ""));
                      const updated: ParsedCsv = {
                        ...csv,
                        rows: [...csv.rows, blank],
                        rowCount: (csv.rowCount || 0) + 1,
                      };
                      onChange?.(updated);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                  >
                    + Row
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="odd:bg-[rgba(25,25,10,0.4)] even:bg-[rgba(35,35,15,0.4)] hover:bg-yellow-500/10 transition-colors text-yellow-50 border-b border-yellow-900/20 last:border-b-0"
              >
                {csv.headers.map((h) => {
                  const isEditing =
                    editingCell &&
                    editingCell.row === i &&
                    editingCell.header === h;
                  return (
                    <td
                      key={h}
                      className="px-4 py-2.5 border-r border-yellow-900/30 last:border-r-0 align-top max-w-[40ch] truncate cursor-pointer transition-colors"
                      onDoubleClick={() =>
                        setEditingCell({ row: i, header: h })
                      }
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          defaultValue={row[h]}
                          onBlur={(e) => commitCell(i, h, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              commitCell(
                                i,
                                h,
                                (e.target as HTMLInputElement).value,
                              );
                            } else if (e.key === "Escape") {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full bg-[rgba(10,10,5,0.9)] text-yellow-50 border border-yellow-400 rounded px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                        />
                      ) : (
                        <span className="whitespace-pre-wrap break-words text-[13px] leading-snug opacity-90">
                          {row[h]}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 align-top">
                  <button
                    type="button"
                    onClick={() => {
                      const indexInAll = (
                        csv.rows as Array<Record<string, string>>
                      ).indexOf(row);
                      const updatedRows = [...csv.rows];
                      if (indexInAll >= 0) {
                        updatedRows.splice(indexInAll, 1);
                      } else {
                        // fallback: remove by shallow equality on values
                        const key = JSON.stringify(row);
                        const idx = (
                          csv.rows as Array<Record<string, string>>
                        ).findIndex((r) => JSON.stringify(r) === key);
                        if (idx >= 0) updatedRows.splice(idx, 1);
                      }
                      const updated: ParsedCsv = {
                        ...csv,
                        rows: updatedRows,
                        rowCount: Math.max((csv.rowCount || 1) - 1, 0),
                      };
                      onChange?.(updated);
                    }}
                    className="text-[11px] font-bold px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
