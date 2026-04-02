"use client";

import { normalizeNameKey } from "@/utils/normalizeName";
import Image from "next/image";
import nunjucks from "nunjucks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CsvMapping, ParsedCsv } from "./CsvUploader";
// email editing is performed in the Template tab
import type { AttachIndex } from "./AttachmentsUploader";
import VariablePicker from "./VariablePicker";

const PREVIEW_RESET_STYLE =
  "<style>html,body{margin:0!important;padding:0!important;background-color:transparent!important;}</style>";

const normalizePreviewHtml = (html: string) => {
  const trimmed = (html || "").trim();
  if (!trimmed) {
    return `<!DOCTYPE html><html><head>${PREVIEW_RESET_STYLE}</head><body></body></html>`;
  }
  if (/<head[\s>]/i.test(trimmed)) {
    return trimmed.replace(
      /<head([^>]*)>/i,
      (_, attrs = "") => `<head${attrs}>${PREVIEW_RESET_STYLE}`,
    );
  }
  if (/<html[\s>]/i.test(trimmed)) {
    return trimmed.replace(
      /<html([^>]*)>/i,
      (_, attrs = "") => `<html${attrs}><head>${PREVIEW_RESET_STYLE}</head>`,
    );
  }
  return `<!DOCTYPE html><html><head>${PREVIEW_RESET_STYLE}</head><body>${trimmed}</body></html>`;
};

type Props = {
  csv: ParsedCsv | null;
  mapping: CsvMapping | null;
  template: string;
  onExportJson: (render: (row: Record<string, string>) => string) => void;
  subjectTemplate?: string;
  onSubjectChange?: (next: string) => void;
  attachmentsByName?: AttachIndex;
  extraContext?: Record<string, unknown>;
  showSubjectEditor?: boolean;
};

export default function PreviewPane({
  csv,
  mapping,
  template,
  onExportJson,
  subjectTemplate = "",
  onSubjectChange,
  attachmentsByName,
  extraContext,
  showSubjectEditor = true,
}: Props) {
  type QueueStatus = "queued" | "sending" | "sent" | "error";

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendModalLogs, setSendModalLogs] = useState<
    Array<{
      to: string;
      status: string;
      subject?: string;
      error?: string;
      messageId?: string;
      attachments?: number;
      timestamp?: string;
    }>
  >([]);
  const [sendModalSummary, setSendModalSummary] = useState<{
    sent: number;
    failed: number;
  }>({ sent: 0, failed: 0 });
  const [sendModalTotal, setSendModalTotal] = useState<number | null>(null);
  const [sendQueue, setSendQueue] = useState<
    Array<{
      index: number;
      batch: number;
      to: string;
      status: QueueStatus;
      error?: string;
    }>
  >([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [batchAssignments, setBatchAssignments] = useState<
    Array<{ batch: number; recipients: string[] }>
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  // User-selectable batch size (3 or 4)
  const [batchSize, setBatchSize] = useState<number>(4);
  const [previewRowIndex, setPreviewRowIndex] = useState<number>(0);
  const ready = !!csv && !!mapping && !!template?.trim();
  const [envOk, setEnvOk] = useState<boolean | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const subjectInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/env")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setEnvOk(!!d.ok);
        setMissing(Array.isArray(d.missing) ? d.missing : []);
      })
      .catch(() => {
        if (!mounted) return;
        setEnvOk(false);
        setMissing(["SENDER_EMAIL", "SENDER_APP_PASSWORD", "SENDER_NAME"]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Profiles removed from UI; sender env is fixed to ICPEP SE - PUP Manila.

  // Attachment handling removed from PreviewPane (now in CSV tab).

  // Cooldown timer: when cooldownSec > 0, tick down every second
  useEffect(() => {
    if (cooldownSec <= 0) return;
    const id = setInterval(() => {
      setCooldownSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownSec]);

  const renderRow = useCallback(
    (row: Record<string, string>) => {
      if (!mapping) return template;
      // Build context with all CSV fields, and standard aliases name/recipient.
      const ctx: Record<string, unknown> = { ...row, ...(extraContext || {}) };
      ctx.name = row[mapping.name];
      ctx.recipient = row[mapping.recipient];
      try {
        // Render using nunjucks (Jinja compatible)
        return nunjucks.renderString(template, ctx);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return `\n` + template;
      }
    },
    [mapping, template, extraContext],
  );

  const previewHtml = useMemo(() => {
    if (!csv || !mapping) return normalizePreviewHtml(template);
    const row = csv.rows[previewRowIndex];
    const html = row ? renderRow(row) : template;
    return normalizePreviewHtml(html);
  }, [csv, mapping, template, previewRowIndex, renderRow]);

  const recipients = useMemo(() => {
    if (!csv || !mapping) return [] as string[];
    return (csv.rows as Array<Record<string, string>>)
      .filter((r) => r[mapping.recipient])
      .map((r) => String(r[mapping.recipient]));
  }, [csv, mapping]);

  const requiresSingleBatch = useMemo(() => {
    if (!attachmentsByName) return false;
    const min = 1024 * 1024;
    const max = 2 * 1024 * 1024;
    return Object.values(attachmentsByName).some((entries) =>
      Array.isArray(entries)
        ? entries.some((entry) => {
            if (!entry) return false;
            const size = entry.sizeBytes ?? 0;
            const filename = entry.filename?.toLowerCase() || "";
            const mime = (entry.contentType || "").toLowerCase();
            const isPdf = mime.includes("pdf") || filename.endsWith(".pdf");
            return Boolean(isPdf && size >= min && size <= max);
          })
        : false,
    );
  }, [attachmentsByName]);

  const attachmentsPresent = useMemo(() => {
    if (!attachmentsByName) return false;
    return Object.values(attachmentsByName).some(
      (arr) => Array.isArray(arr) && arr.length > 0,
    );
  }, [attachmentsByName]);

  const maxBatchSize = requiresSingleBatch ? 1 : attachmentsPresent ? 3 : 4;
  const limitedToThree = !requiresSingleBatch && attachmentsPresent;

  useEffect(() => {
    if (batchSize > maxBatchSize) {
      setBatchSize(maxBatchSize);
    }
  }, [maxBatchSize, batchSize]);

  // Preview batches (size = batchSize) so user can see grouping before sending
  const batchPreview = useMemo(() => {
    const list: Array<{ batch: number; recipients: string[] }> = [];
    if (!recipients || recipients.length === 0) return list;
    const SIZE = Math.max(1, Math.min(batchSize, maxBatchSize));
    for (let i = 0; i < recipients.length; i += SIZE) {
      list.push({
        batch: i / SIZE + 1,
        recipients: recipients.slice(i, i + SIZE),
      });
    }
    return list;
  }, [recipients, batchSize, maxBatchSize]);

  const availableVars = useMemo(() => {
    const s = new Set<string>();
    if (csv?.headers) csv.headers.forEach((h) => s.add(h));
    if (mapping) {
      s.add("name");
      s.add("recipient");
    }
    if (extraContext) Object.keys(extraContext).forEach((key) => s.add(key));
    return Array.from(s);
  }, [csv, mapping, extraContext]);

  const attachmentsByRecipient = useMemo(() => {
    if (!csv || !mapping || !attachmentsByName)
      return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    for (const row of csv.rows as Array<Record<string, string>>) {
      const email = row[mapping.recipient];
      const nameVal = row[mapping.name];
      if (!email || !nameVal) continue;
      const normalized = normalizeNameKey(nameVal.toString());
      const entries = attachmentsByName[normalized];
      if (!entries || entries.length === 0) continue;
      const files = entries
        .filter(Boolean)
        .map((entry) => entry.filename || "Attachment");
      if (files.length > 0) map.set(String(email), files);
    }
    return map;
  }, [csv, mapping, attachmentsByName]);
  const usedSubjectVars = useMemo(() => {
    const vars = new Set<string>();
    const re = /\{\{\s*([a-zA-Z_][\w\.]*)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(subjectTemplate || ""))) vars.add(m[1]);
    return Array.from(vars);
  }, [subjectTemplate]);

  const usedBodyVars = useMemo(() => {
    const vars = new Set<string>();
    const re = /\{\{\s*([a-zA-Z_][\w\.]*)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(template || ""))) vars.add(m[1]);
    return Array.from(vars);
  }, [template]);

  const allUsed = useMemo(
    () => Array.from(new Set([...usedSubjectVars, ...usedBodyVars])),
    [usedSubjectVars, usedBodyVars],
  );
  const invalidUsed = useMemo(
    () => allUsed.filter((v) => !availableVars.includes(v)),
    [allUsed, availableVars],
  );

  const insertSubjectVariable = useCallback(
    (variable: string) => {
      if (!onSubjectChange) return;
      const addition = `{{ ${variable} }}`;
      const value = subjectTemplate ?? "";
      const input = subjectInputRef.current;
      if (!input) {
        onSubjectChange(`${value}${addition}`);
        return;
      }
      const start = input.selectionStart ?? value.length;
      const end = input.selectionEnd ?? value.length;
      const next = value.slice(0, start) + addition + value.slice(end);
      onSubjectChange(next);
      requestAnimationFrame(() => {
        input.focus();
        const caret = start + addition.length;
        input.setSelectionRange(caret, caret);
      });
    },
    [onSubjectChange, subjectTemplate],
  );

  const variantLabel = "ICPEP SE - PUP Manila";

  const doSendEmails = useCallback(async () => {
    if (!ready || !csv || !mapping) return;
    const allRows = csv.rows.filter((r) => r[mapping.recipient]);
    const total = allRows.length;
    const BATCH_SIZE = Math.max(1, Math.min(batchSize, maxBatchSize));
    setShowSendModal(true);
    setSendError(null);
    setSendModalLogs([]);
    setSendModalSummary({ sent: 0, failed: 0 });
    setSendModalTotal(total);
    // Compute and expose batch groupings for UI
    const assignments: Array<{ batch: number; recipients: string[] }> = [];
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const recips = allRows
        .slice(i, i + BATCH_SIZE)
        .map((r) => String(r[mapping.recipient]));
      assignments.push({ batch: i / BATCH_SIZE + 1, recipients: recips });
    }
    setBatchAssignments(assignments);
    setSendQueue(
      allRows.map((row, idx) => ({
        index: idx,
        batch: Math.floor(idx / BATCH_SIZE) + 1,
        to: String(row[mapping.recipient]),
        status: "queued",
      })),
    );
    try {
      setIsSending(true);
      for (let start = 0; start < total; start += BATCH_SIZE) {
        setCurrentBatchIndex(start / BATCH_SIZE);
        const batch = allRows.slice(start, start + BATCH_SIZE);
        setSendQueue((prev) =>
          prev.map((item) =>
            item.index >= start && item.index < start + batch.length
              ? { ...item, status: "sending", error: undefined }
              : item,
          ),
        );
        const body = {
          rows: batch,
          mapping,
          template,
          subjectTemplate: subjectTemplate?.trim() || undefined,
          extraContext,
          attachmentsByName,
          delayMs: 2000,
          jitterMs: 250,
        };
        const res = await fetch("/api/send/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          // mark whole batch as failed
          for (let batchIdx = 0; batchIdx < batch.length; batchIdx += 1) {
            const r = batch[batchIdx];
            const to = String(r[mapping.recipient] || "");
            const errMsg = data?.error || "Batch failed";
            setSendModalLogs((prev) => [
              ...prev,
              {
                to,
                status: "error",
                error: errMsg,
                attachments: 0,
                timestamp: new Date().toISOString(),
              },
            ]);
            const queueIndex = start + batchIdx;
            setSendQueue((prev) =>
              prev.map((item) =>
                item.index === queueIndex
                  ? { ...item, status: "error", error: errMsg }
                  : item,
              ),
            );
          }
          setSendError(
            (prev) => prev || data?.error || "One batch failed to send.",
          );
          setSendModalSummary((prev) => ({
            sent: prev.sent,
            failed: prev.failed + batch.length,
          }));
          continue;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line) continue;
            try {
              const obj = JSON.parse(line);
              if (obj.type === "start") {
                // keep total as overall; only set if not yet set
                setSendModalTotal((prev) =>
                  prev == null
                    ? typeof obj.total === "number"
                      ? obj.total
                      : null
                    : prev,
                );
              } else if (obj.type === "item") {
                const queueIndex =
                  typeof obj.index === "number" ? start + obj.index : null;
                setSendModalLogs((prev) => [
                  ...prev,
                  {
                    to: obj.to,
                    status: obj.status,
                    subject: obj.subject,
                    error: obj.error,
                    messageId: obj.messageId,
                    attachments: obj.attachments,
                    timestamp: obj.timestamp,
                  },
                ]);
                if (queueIndex != null) {
                  setSendQueue((prev) =>
                    prev.map((item) =>
                      item.index === queueIndex
                        ? {
                            ...item,
                            status: obj.status === "sent" ? "sent" : "error",
                            error:
                              obj.status === "error"
                                ? obj.error || "Send failed"
                                : undefined,
                          }
                        : item,
                    ),
                  );
                }
                setSendModalSummary((prev) => ({
                  sent: obj.status === "sent" ? prev.sent + 1 : prev.sent,
                  failed:
                    obj.status === "error" ? prev.failed + 1 : prev.failed,
                }));
              } else if (obj.type === "done") {
                // no-op; counts already tracked
              }
            } catch {
              setSendError(
                (prev) => prev || "Received invalid stream data while sending.",
              );
            }
          }
        }
        if (buffer.trim()) {
          try {
            const obj = JSON.parse(buffer.trim());
            if (obj.type === "item") {
              const queueIndex =
                typeof obj.index === "number" ? start + obj.index : null;
              setSendModalLogs((prev) => [
                ...prev,
                {
                  to: obj.to,
                  status: obj.status,
                  subject: obj.subject,
                  error: obj.error,
                  messageId: obj.messageId,
                  attachments: obj.attachments,
                  timestamp: obj.timestamp,
                },
              ]);
              if (queueIndex != null) {
                setSendQueue((prev) =>
                  prev.map((item) =>
                    item.index === queueIndex
                      ? {
                          ...item,
                          status: obj.status === "sent" ? "sent" : "error",
                          error:
                            obj.status === "error"
                              ? obj.error || "Send failed"
                              : undefined,
                        }
                      : item,
                  ),
                );
              }
              setSendModalSummary((prev) => ({
                sent: obj.status === "sent" ? prev.sent + 1 : prev.sent,
                failed: obj.status === "error" ? prev.failed + 1 : prev.failed,
              }));
            }
          } catch {
            setSendError(
              (prev) => prev || "Failed to parse final stream response.",
            );
          }
        }
        // small pause between batches
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected send error";
      setSendError(message);
    } finally {
      setIsSending(false);
      setCooldownSec(5);
    }
  }, [
    ready,
    csv,
    mapping,
    template,
    subjectTemplate,
    attachmentsByName,
    extraContext,
    batchSize,
    maxBatchSize,
  ]);

  return (
    <>
      <div className="rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.4)] p-5 space-y-5">
        <div
          className="flex items-center justify-between gap-3 flex-wrap border-b border-yellow-900/30 pb-4"
          id="tutorial-env-controls"
        >
          <h2 className="text-lg font-bold text-yellow-50">
            3) Preview & Export
          </h2>
          <div className="flex items-center gap-2">
            {/* Variable insertion moved to Template tab */}
            {envOk === true && (
              <span className="px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                Sender env OK
              </span>
            )}
            {envOk === false && (
              <span className="px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider bg-red-500/10 border-red-500/30 text-red-400">
                Missing env: {missing.join(", ")}
              </span>
            )}
            <div className="flex items-center gap-2 text-xs mr-2">
              <span className="font-bold text-yellow-500 uppercase tracking-wider opacity-70">
                Sender:
              </span>
              <span className="px-3 py-1 rounded-lg border bg-[rgba(25,25,10,0.8)] border-yellow-900/50 text-yellow-50 font-medium">
                {variantLabel}
              </span>
              <Image
                src="/email-template/ICPEP-logo 1.png"
                alt="ICPEP SE - PUP Manila"
                width={32}
                height={32}
                className="h-7 w-7 rounded-md border border-yellow-900/50 object-cover bg-yellow-600/40"
              />
            </div>
            <button
              type="button"
              disabled={!ready}
              onClick={() => ready && onExportJson((row) => renderRow(row))}
              className={`px-4 py-1.5 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] ${
                ready
                  ? "bg-[rgba(25,25,10,0.6)] border-yellow-900/40 text-yellow-500 hover:bg-yellow-950/30"
                  : "opacity-40 cursor-not-allowed border-yellow-900/30 text-yellow-700 bg-transparent"
              }`}
            >
              Export JSON
            </button>
            <button
              type="button"
              disabled={
                !ready || envOk === false || isSending || cooldownSec > 0
              }
              onClick={async () => {
                if (!ready || !csv || !mapping || isSending || cooldownSec > 0)
                  return;
                await doSendEmails();
              }}
              className={`px-4 py-1.5 rounded-lg border text-sm font-bold transition-all active:scale-[0.98] ${
                ready && envOk !== false && !isSending && cooldownSec === 0
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
                  : "opacity-40 cursor-not-allowed border-yellow-900/30 text-yellow-700 bg-transparent"
              } ${isSending ? "cursor-wait" : ""}`}
            >
              {isSending ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Sending…
                </span>
              ) : cooldownSec > 0 ? (
                `Wait ${cooldownSec}s`
              ) : (
                "Send Emails"
              )}
            </button>
            {/* Stream Send button removed per user request */}
          </div>
        </div>
        {sendError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs px-4 py-3 font-medium">
            Send error: {sendError}
          </div>
        )}

        {/* Attachments uploader moved to CSV tab */}

        {!csv && (
          <div className="text-sm text-yellow-100/60 font-medium">
            Upload a CSV to see previews.
          </div>
        )}
        {csv && !mapping && (
          <div className="text-sm text-yellow-100/60 font-medium">
            Set column mapping to preview emails.
          </div>
        )}
        {csv && mapping && !template?.trim() && (
          <div className="text-sm text-yellow-100/60 font-medium">
            Provide an HTML template to preview.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div
            className="lg:col-span-1 border border-yellow-900/50 rounded-xl overflow-hidden bg-[rgba(25,25,10,0.4)]"
            id="tutorial-recipient-list"
          >
            <div className="px-4 py-3 text-[11px] bg-[rgba(35,35,15,0.4)] border-b border-yellow-900/50 font-bold text-yellow-50 uppercase tracking-wider flex items-center justify-between">
              <span>Recipients</span>
              <span className="opacity-70 text-yellow-500">
                {recipients.length}
              </span>
            </div>
            <div className="max-h-80 overflow-auto text-xs custom-scrollbar">
              {recipients.length === 0 && (
                <div className="p-4 text-yellow-100/50 font-medium">
                  No recipients. Map a recipient column in the CSV tab.
                </div>
              )}
              <ul className="divide-y divide-yellow-900/30 text-yellow-100/70">
                {recipients.map((email, idx) => (
                  <li
                    key={`${email}-${idx}`}
                    className="px-4 py-2.5 truncate hover:bg-yellow-500/5 transition-colors"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            {showSubjectEditor && (
              <div className="space-y-2" id="tutorial-subject-editor">
                <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
                  Subject
                </div>
                <div className="flex items-center gap-3">
                  <input
                    ref={subjectInputRef}
                    value={subjectTemplate}
                    onChange={(e) => onSubjectChange?.(e.target.value)}
                    placeholder="e.g. Hello {{ name }}"
                    className="flex-1 rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.8)] px-4 py-2.5 text-yellow-50 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 placeholder:text-yellow-700/50 transition-colors"
                  />
                  <VariablePicker
                    variables={availableVars}
                    label="Insert variable"
                    onInsert={(v) => insertSubjectVariable(v)}
                  />
                </div>
                {allUsed.length > 0 && (
                  <div className="text-[11px] flex flex-wrap gap-2 items-center mt-2">
                    <span className="font-bold text-yellow-500/70 uppercase tracking-wider mr-1">
                      Variables used:
                    </span>
                    {allUsed.map((v) => (
                      <span
                        key={v}
                        className={`px-2 py-1 rounded-md border font-mono ${
                          availableVars.includes(v)
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                      >
                        {`{{ ${v} }}`}
                      </span>
                    ))}
                  </div>
                )}
                {invalidUsed.length > 0 && (
                  <div className="text-xs font-medium text-red-400 mt-1">
                    Unknown variables: {invalidUsed.join(", ")} (not found in
                    CSV headers)
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2" id="tutorial-preview-frame">
              <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider flex items-center justify-between">
                <span>Preview</span>
                <span className="text-yellow-100/60 font-medium normal-case tracking-normal">
                  Previewing row{" "}
                  {csv && csv.rowCount > 0 ? previewRowIndex + 1 : 0} of{" "}
                  {csv?.rowCount ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => setPreviewRowIndex((p) => Math.max(0, p - 1))}
                  disabled={previewRowIndex === 0 || !csv}
                  className="px-4 py-1.5 rounded-lg border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-950/30 text-yellow-500 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPreviewRowIndex((p) =>
                      Math.min((csv?.rowCount ?? 1) - 1, p + 1),
                    )
                  }
                  disabled={!csv || previewRowIndex >= csv.rowCount - 1}
                  className="px-4 py-1.5 rounded-lg border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-950/30 text-yellow-500 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Next
                </button>
              </div>
              {/* iframe remains white because most HTML emails are designed for white backgrounds */}
              <iframe
                srcDoc={previewHtml}
                className="w-full h-96 border border-yellow-900/50 rounded-xl bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>

        {/* Batches preview (always visible when recipients exist) */}
        {batchPreview.length > 0 && (
          <div
            className="border border-yellow-900/50 rounded-xl p-5 bg-[rgba(25,25,10,0.4)] space-y-4"
            id="tutorial-batch-preview"
          >
            <div className="text-[11px] font-bold text-yellow-50 uppercase tracking-wider flex items-center gap-2">
              <span>Batches (preview)</span>
              <span className="opacity-70 text-yellow-500">
                {batchPreview.length} total
              </span>
            </div>
            {/* Batch size selector */}
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-yellow-500 uppercase tracking-wider opacity-70">
                  Batch size:
                </span>
                {[1, 3, 4].map((size) => {
                  const disabled =
                    (requiresSingleBatch && size !== 1) ||
                    (limitedToThree && size === 4);
                  return (
                    <label
                      key={size}
                      className={`inline-flex items-center gap-1.5 cursor-pointer font-medium text-yellow-50 ${
                        disabled
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:text-yellow-400 transition-colors"
                      }`}
                    >
                      <input
                        type="radio"
                        name="batchSize"
                        value={size}
                        checked={batchSize === size}
                        onChange={() => setBatchSize(size)}
                        className="accent-yellow-500 w-3.5 h-3.5"
                        disabled={disabled}
                      />
                      <span>{size}</span>
                    </label>
                  );
                })}
              </div>
              <div className="text-[11px] text-yellow-100/50 leading-relaxed">
                {requiresSingleBatch ? (
                  <span className="inline-block text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg font-medium shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                    Large 1-2 MB PDF attachments detected. Sending is locked to
                    1 email per batch.
                  </span>
                ) : attachmentsPresent ? (
                  <span>
                    <strong className="text-yellow-400">Tip:</strong>{" "}
                    Attachments detected. Sending is capped at{" "}
                    <strong className="text-yellow-50">3 per batch</strong> to
                    reduce payload size.
                  </span>
                ) : (
                  <span>
                    <strong className="text-yellow-400">Tip:</strong> No
                    attachments detected. You can use
                    <strong className="text-yellow-50"> 4 per batch</strong> for
                    faster overall sending.
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-48 overflow-auto text-xs bg-[rgba(10,10,5,0.6)] border border-yellow-900/40 rounded-lg custom-scrollbar">
              <ul className="divide-y divide-yellow-900/30">
                {batchPreview.map((b) => (
                  <li key={`batch-${b.batch}`} className="px-4 py-3 space-y-2">
                    <div className="font-bold text-yellow-400">
                      Batch {b.batch}
                    </div>
                    <div className="text-yellow-100/70 space-y-1.5">
                      {b.recipients.map((email) => {
                        const attachments =
                          attachmentsByRecipient.get(email) || [];
                        return (
                          <div
                            key={`${b.batch}-${email}`}
                            className="flex flex-wrap gap-2 items-center"
                          >
                            <span className="wrap-break-word">{email}</span>
                            {attachments.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-yellow-900/50 rounded-md bg-[rgba(35,35,15,0.8)] text-yellow-500/70 shadow-sm">
                                📎
                                <span className="font-medium text-yellow-100/80">
                                  {attachments.length} file
                                  {attachments.length > 1 ? "s" : ""}
                                </span>
                                <span className="text-yellow-100/40">
                                  ({attachments.slice(0, 2).join(", ")}
                                  {attachments.length > 2
                                    ? ` +${attachments.length - 2}`
                                    : ""}
                                  )
                                </span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-[11px] text-yellow-100/50 leading-relaxed max-w-2xl">
              Sending is performed sequentially per batch with a jittered ~2s
              delay per email to reduce throttling and avoid serverless
              timeouts.
            </div>
          </div>
        )}
      </div>

      {/* Send Modal UI */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[rgba(15,15,5,0.95)] w-full max-w-3xl rounded-2xl border border-yellow-500/30 shadow-[0_0_40px_rgba(250,204,21,0.15)] flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-yellow-900/50 flex items-center justify-between bg-[rgba(25,25,10,0.6)] rounded-t-2xl">
              <div className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                {isSending ? "Sending… Live Log" : "Send Summary"}
              </div>
              <button
                className="text-xs font-bold px-3 py-1.5 border border-yellow-500/30 rounded-lg text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all active:scale-[0.98]"
                onClick={() => setShowSendModal(false)}
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {sendError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-medium text-xs px-4 py-3">
                  {sendError}
                </div>
              )}
              <div className="text-xs flex flex-wrap gap-5 items-center text-yellow-100/70">
                <span className="bg-[rgba(25,25,10,0.8)] px-3 py-1.5 rounded-lg border border-yellow-900/50">
                  <strong className="text-yellow-400 font-bold uppercase tracking-wider">
                    Sent:
                  </strong>{" "}
                  {sendModalSummary.sent}
                </span>
                <span className="bg-[rgba(25,25,10,0.8)] px-3 py-1.5 rounded-lg border border-yellow-900/50">
                  <strong className="text-yellow-400 font-bold uppercase tracking-wider">
                    Failed:
                  </strong>{" "}
                  {sendModalSummary.failed}
                </span>
                {typeof sendModalTotal === "number" && (
                  <span className="bg-[rgba(25,25,10,0.8)] px-3 py-1.5 rounded-lg border border-yellow-900/50">
                    <strong className="text-yellow-400 font-bold uppercase tracking-wider">
                      Remaining:
                    </strong>{" "}
                    {Math.max(
                      0,
                      sendModalTotal -
                        (sendModalSummary.sent + sendModalSummary.failed),
                    )}
                  </span>
                )}
                {isSending && (
                  <span className="text-yellow-400 font-bold animate-pulse px-2 uppercase tracking-wider">
                    In Progress…
                  </span>
                )}
              </div>
              {typeof sendModalTotal === "number" && (
                <div className="w-full h-2.5 bg-yellow-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.floor(
                          ((sendModalSummary.sent + sendModalSummary.failed) /
                            (sendModalTotal || 1)) *
                            100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              )}

              {/* Batch overview */}
              {batchAssignments.length > 0 && (
                <div className="border border-yellow-900/40 rounded-xl p-4 bg-[rgba(25,25,10,0.6)] text-xs">
                  <div className="mb-2 font-bold text-yellow-400 uppercase tracking-wider text-[11px]">
                    Batches
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-auto custom-scrollbar pr-2">
                    {batchAssignments.map((b, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 items-start py-1 border-b border-yellow-900/20 last:border-b-0 ${
                          idx === currentBatchIndex
                            ? "text-yellow-400 font-medium"
                            : "text-yellow-100/60"
                        }`}
                      >
                        <span className="min-w-[65px] inline-block font-bold">
                          Batch {b.batch}:
                        </span>
                        <span className="flex-1 wrap-break-word">
                          {b.recipients.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Queue overview */}
              {sendQueue.length > 0 && (
                <div className="border border-yellow-900/40 rounded-xl p-4 bg-[rgba(10,10,5,0.8)] text-xs">
                  <div className="mb-2 font-bold text-yellow-400 uppercase tracking-wider text-[11px]">
                    Queue ({sendQueue.length})
                  </div>
                  <div className="max-h-28 overflow-auto space-y-1.5 custom-scrollbar pr-2">
                    {sendQueue.map((item) => (
                      <div
                        key={`queue-${item.index}-${item.to}`}
                        className="flex items-center gap-3 text-yellow-100/70 border-b border-yellow-900/20 last:border-b-0 pb-1.5"
                      >
                        <span className="min-w-[40px] text-yellow-600 font-bold">
                          B{item.batch}
                        </span>
                        <span className="flex-1 wrap-break-word">
                          {item.to}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "sent"
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : item.status === "error"
                                ? "border-red-500/40 text-red-400 bg-red-500/10"
                                : item.status === "sending"
                                  ? "border-yellow-400/40 text-yellow-300 bg-yellow-400/10 animate-pulse"
                                  : "border-yellow-900/50 text-yellow-100/50 bg-transparent"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-h-72 overflow-auto border border-yellow-900/50 rounded-xl text-xs font-mono bg-[rgba(10,10,5,0.8)] shadow-inner custom-scrollbar">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-yellow-900/20 backdrop-blur-sm shadow-sm z-10">
                    <tr>
                      <th className="text-left px-3 py-2 border-b border-yellow-900/50 text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                        Recipient
                      </th>
                      <th className="text-left px-3 py-2 border-b border-yellow-900/50 text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                        Status
                      </th>
                      <th className="text-left px-3 py-2 border-b border-yellow-900/50 text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                        Time
                      </th>
                      <th className="text-left px-3 py-2 border-b border-yellow-900/50 text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                        Subject
                      </th>
                      <th className="text-left px-3 py-2 border-b border-yellow-900/50 text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                        Attachments
                      </th>
                      <th className="text-left px-3 py-2 border-b border-yellow-900/50 text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                        Message / Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sendModalLogs.map((l, i) => (
                      <tr
                        key={i}
                        className="odd:bg-[rgba(15,15,5,0.8)] even:bg-[rgba(25,25,10,0.8)] hover:bg-yellow-500/10 transition-colors border-b border-yellow-900/30 last:border-b-0 text-yellow-50"
                      >
                        <td className="px-3 py-2 whitespace-pre-wrap wrap-break-word">
                          {l.to}
                        </td>
                        <td
                          className={`px-3 py-2 font-bold ${
                            l.status === "sent"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {l.status}
                        </td>
                        <td className="px-3 py-2 whitespace-pre-wrap wrap-break-word text-yellow-100/60">
                          {l.timestamp
                            ? new Date(l.timestamp).toLocaleTimeString()
                            : ""}
                        </td>
                        <td className="px-3 py-2 whitespace-pre-wrap wrap-break-word">
                          {l.subject || ""}
                        </td>
                        <td className="px-3 py-2 text-yellow-100/60 font-semibold">
                          {typeof l.attachments === "number"
                            ? l.attachments
                            : ""}
                        </td>
                        <td className="px-3 py-2 whitespace-pre-wrap wrap-break-word text-yellow-100/80">
                          {l.error || l.messageId || ""}
                        </td>
                      </tr>
                    ))}
                    {isSending && sendModalLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-yellow-500/70 font-medium italic"
                        >
                          Starting engine...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
