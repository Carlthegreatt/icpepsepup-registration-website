"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, Dispatch, SetStateAction } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmailEditor, { EmailEditorHandle } from "./EmailEditor";
import VariablePicker from "./VariablePicker";

type SavedTemplate = {
  id: string;
  name: string;
  html: string;
  updatedAt: number;
};

const LS_KEY = "batchmail.templates.v1";

function loadTemplates(fallback: SavedTemplate[]): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const arr = JSON.parse(raw) as SavedTemplate[];
    if (!Array.isArray(arr)) return fallback;
    return arr;
  } catch {
    return fallback;
  }
}

function saveTemplates(arr: SavedTemplate[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch {}
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(4);
}

type Props = {
  availableVars?: string[];
  initialHtml: string;
  onUseTemplate: (t: { html: string }) => void;
};

export default function TemplateLibrary({
  availableVars = [],
  initialHtml,
  onUseTemplate,
}: Props) {
  const seed: SavedTemplate[] = [
    { id: uuid(), name: "Untitled", html: initialHtml || "", updatedAt: 0 },
  ];
  const [templates, setTemplates] = useState<SavedTemplate[]>(() =>
    loadTemplates(seed),
  );
  const [activeId, setActiveId] = useState<string>(
    () => loadTemplates(seed)[0]?.id,
  );
  const [serverTemplates, setServerTemplates] = useState<string[]>([]);
  const active = templates.find((t) => t.id === activeId) || templates[0];
  const [rawMode, setRawMode] = useState(false);
  const [rawZoom, setRawZoom] = useState(1);
  const editorRef = useRef<EmailEditorHandle | null>(null);
  const rawTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [applied, setApplied] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Persist on changes
  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((files) => setServerTemplates(Array.isArray(files) ? files : []))
      .catch(console.error);
  }, []);

  const onSelectTemplate = async (filename: string) => {
    try {
      const res = await fetch(`/api/templates/${filename}`);
      if (!res.ok) throw new Error(await res.text());
      const { html } = await res.json();
      const t: SavedTemplate = {
        id: uuid(),
        name: filename.replace(/\.html$/, ""),
        html,
        updatedAt: Date.now(),
      };
      setTemplates((prev) => [t, ...prev]);
      setActiveId(t.id);
    } catch (error) {
      console.error("Failed to load template", error);
      alert("Failed to load template");
    }
  };

  const available = useMemo(
    () => Array.from(new Set(availableVars)),
    [availableVars],
  );

  const updateActive = (patch: Partial<SavedTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === active.id ? { ...t, ...patch, updatedAt: Date.now() } : t,
      ),
    );
  };

  const addTemplate = () => {
    const t: SavedTemplate = {
      id: uuid(),
      name: "New template",
      html: "",
      updatedAt: Date.now(),
    };
    setTemplates((prev) => [t, ...prev]);
    setActiveId(t.id);
  };

  const saveAsNew = () => {
    const clone: SavedTemplate = {
      id: uuid(),
      name: `${active.name} (copy)`,
      html: active.html,
      updatedAt: Date.now(),
    };
    setTemplates((prev) => [clone, ...prev]);
    setActiveId(clone.id);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one blank template
        const fallback: SavedTemplate = {
          id: uuid(),
          name: "Untitled",
          html: "",
          updatedAt: Date.now(),
        };
        setActiveId(fallback.id);
        return [fallback];
      }
      // Reset active if we deleted current
      if (id === activeId) setActiveId(filtered[0].id);
      return filtered;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      {/* Sidebar */}
      <div className="lg:col-span-1 border border-yellow-900/50 rounded-xl h-full bg-[rgba(25,25,10,0.4)] flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="px-4 py-3 border-b border-yellow-900/50 flex items-center justify-between bg-[rgba(35,35,15,0.4)]">
          <div className="text-sm font-bold text-yellow-50 uppercase tracking-wider">
            Templates
          </div>
          <button
            className="w-7 h-7 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-lg flex items-center justify-center transition-colors active:scale-95"
            onClick={addTemplate}
          >
            +
          </button>
        </div>
        <div className="max-h-96 overflow-auto text-sm custom-scrollbar">
          {serverTemplates.map((filename) => (
            <div
              key={filename}
              className={`group flex items-center justify-between gap-2 px-4 py-3 border-b border-yellow-900/30 hover:bg-yellow-500/10 transition-colors`}
            >
              <button
                onClick={() => onSelectTemplate(filename)}
                className="flex-1 text-left"
              >
                <div className="font-bold text-yellow-50 truncate">
                  {filename.replace(/\.html$/, "")}
                </div>
                <div className="text-[11px] text-yellow-100/50 truncate mt-0.5 uppercase tracking-wide">
                  HTML template
                </div>
              </button>
            </div>
          ))}
          {templates.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center justify-between gap-2 px-4 py-3 border-b border-yellow-900/30 transition-colors ${
                t.id === active.id
                  ? "bg-yellow-500/20 border-l-2 border-l-yellow-400"
                  : "hover:bg-yellow-500/10"
              }`}
            >
              <button
                onClick={() => setActiveId(t.id)}
                className="flex-1 text-left"
              >
                <div className="font-bold text-yellow-50 truncate">
                  {t.name || "Untitled"}
                </div>
                <div className="text-[11px] text-yellow-100/50 truncate mt-0.5 uppercase tracking-wide">
                  HTML template
                </div>
              </button>
              {templates.length > 1 && (
                <button
                  type="button"
                  aria-label="Delete template"
                  onClick={() => deleteTemplate(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] font-bold px-2.5 py-1 rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="lg:col-span-2 space-y-5">
        {applied && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-4 py-3 text-sm flex items-center justify-between shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <span>
              Template applied. You can head to the{" "}
              <strong className="text-yellow-50">Preview &amp; Export</strong>{" "}
              tab to review and send.
            </span>
            <button
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-yellow-500/40 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-500/20 text-yellow-400 transition-colors"
              onClick={() => {
                const usp = new URLSearchParams(
                  Array.from(searchParams.entries()),
                );
                usp.set("tab", "preview");
                router.replace(`/?${usp.toString()}`);
              }}
            >
              Go to Preview
            </button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-bold text-yellow-50">
              Template Editor
            </div>
            <div className="text-xs font-medium text-yellow-100/50 uppercase tracking-wide">
              Autosave enabled
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] text-yellow-500 hover:bg-yellow-950/30 text-sm font-semibold transition-all active:scale-[0.98]"
              onClick={() =>
                setRawMode((v) => {
                  const next = !v;
                  if (!v) {
                    const formatted = formatHtml(active.html);
                    if (formatted && formatted !== active.html) {
                      updateActive({ html: formatted });
                    }
                  }
                  if (v) {
                    setRawZoom(1);
                  }
                  return next;
                })
              }
            >
              {rawMode ? "WYSIWYG" : "Edit HTML"}
            </button>
            <button
              onClick={saveAsNew}
              className="px-3 py-1.5 rounded-lg border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] text-yellow-500 hover:bg-yellow-950/30 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              Save as new Template
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-sm font-bold transition-all active:scale-[0.98]"
              onClick={() => {
                onUseTemplate({ html: active.html });
                setApplied(true);
                window.setTimeout(() => setApplied(false), 4000);
              }}
            >
              Use this template
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
            Template Name
          </div>
          <input
            value={active.name}
            onChange={(e) => updateActive({ name: e.target.value })}
            className="w-full rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.8)] px-4 py-2.5 text-yellow-50 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 placeholder:text-yellow-700/50 transition-colors"
            placeholder="Enter a name"
          />
        </div>

        {/* Upload HTML file */}
        <div className="space-y-2" id="tutorial-upload-html">
          <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
            Upload HTML Template
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-900/40 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-950/30 text-yellow-500 font-semibold text-sm transition-all cursor-pointer w-fit active:scale-[0.98]">
            <input
              type="file"
              accept=".html,.htm,.txt"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = await f.text();
                updateActive({ html: text });
              }}
            />
            <span>Choose file…</span>
          </label>
        </div>

        <div className="space-y-3" id="tutorial-email-message">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
              Email Message
            </span>
            <div id="tutorial-insert-variable">
              <VariablePicker
                variables={available}
                label="Insert Variable"
                onInsert={(v) => {
                  editorRef.current?.insertVariable(v);
                  editorRef.current?.focus();
                }}
              />
            </div>
          </div>
          {!rawMode ? (
            <div className="rounded-xl overflow-hidden border border-yellow-900/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <EmailEditor
                ref={editorRef}
                value={active.html}
                onChange={(html) => updateActive({ html })}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-yellow-100/60">
                <span className="font-semibold uppercase tracking-wider">
                  Zoom
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustRawZoom(-0.1, setRawZoom)}
                    className="px-2.5 py-1 rounded-lg border border-yellow-900/50 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-500/20 text-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={rawZoom <= RAW_ZOOM_MIN}
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-bold text-yellow-50">
                    {(rawZoom * 100).toFixed(0)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustRawZoom(0.1, setRawZoom)}
                    className="px-2.5 py-1 rounded-lg border border-yellow-900/50 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-500/20 text-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={rawZoom >= RAW_ZOOM_MAX}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawZoom(1)}
                    className="ml-2 px-3 py-1 rounded-lg border border-yellow-900/50 bg-[rgba(25,25,10,0.6)] hover:bg-yellow-500/20 text-yellow-500 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={Math.abs(rawZoom - 1) < 0.05}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  ref={rawTextareaRef}
                  value={active.html}
                  onChange={(e) => updateActive({ html: e.target.value })}
                  onKeyDown={(e) =>
                    handleRawKeyDown(e, active.html, updateActive)
                  }
                  rows={22}
                  spellCheck={false}
                  className="w-full min-h-[26rem] rounded-xl border border-yellow-900/50 bg-[rgba(10,10,5,0.9)] text-yellow-50 font-mono shadow-inner focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 px-5 py-5 transition-colors custom-scrollbar"
                  style={{
                    fontSize: `${(rawZoom * BASE_RAW_FONT_SIZE).toFixed(2)}px`,
                    lineHeight: `${(rawZoom * BASE_RAW_LINE_HEIGHT).toFixed(2)}px`,
                  }}
                />
                <div className="pointer-events-none absolute top-3 right-4 text-[10px] font-bold uppercase tracking-widest text-yellow-700/50">
                  HTML
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const BASE_RAW_FONT_SIZE = 14;
const BASE_RAW_LINE_HEIGHT = 22;
const RAW_ZOOM_MIN = 0.7;
const RAW_ZOOM_MAX = 1.6;

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function formatHtml(input: string) {
  const raw = input ?? "";
  if (!raw.trim()) return raw;
  try {
    const tokens = raw
      .replace(/>\s+</g, "><")
      .split(/(<[^>]+>)/g)
      .map((token) => token)
      .filter((token) => token && token.trim().length > 0);
    let depth = 0;
    const lines: string[] = [];
    tokens.forEach((token) => {
      const trimmed = token.trim();
      const isTag = trimmed.startsWith("<") && trimmed.endsWith(">");
      if (!isTag) {
        lines.push(`${"  ".repeat(depth)}${trimmed}`);
        return;
      }
      const isComment = trimmed.startsWith("<!--");
      const closing = /^<\//.test(trimmed);
      const tagMatch = trimmed.match(/^<\/?\s*([^\s>/]+)/);
      const tagName = tagMatch?.[1]?.toLowerCase() ?? "";
      const selfClosing = /\/>$/.test(trimmed) || VOID_TAGS.has(tagName);
      if (closing && !selfClosing) {
        depth = Math.max(depth - 1, 0);
      }
      lines.push(`${"  ".repeat(depth)}${trimmed}`);
      if (!closing && !selfClosing && !isComment) {
        depth += 1;
      }
    });
    return lines.join("\n");
  } catch {
    return raw;
  }
}

function handleRawKeyDown(
  e: KeyboardEvent<HTMLTextAreaElement>,
  currentValue: string,
  update: (patch: Partial<SavedTemplate>) => void,
) {
  if (e.key !== "Tab") return;
  e.preventDefault();
  const textarea = e.currentTarget;
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const insert = "  ";
  let nextValue = currentValue;
  let caret = start;
  if (e.shiftKey) {
    const before = currentValue.slice(0, start);
    if (before.endsWith(insert)) {
      const newStart = start - insert.length;
      nextValue = currentValue.slice(0, newStart) + currentValue.slice(end);
      caret = newStart;
    }
  } else {
    nextValue = currentValue.slice(0, start) + insert + currentValue.slice(end);
    caret = start + insert.length;
  }
  if (nextValue === currentValue) return;
  update({ html: nextValue });
  requestAnimationFrame(() => {
    textarea.selectionStart = caret;
    textarea.selectionEnd = caret;
  });
}

function adjustRawZoom(
  delta: number,
  setZoom: Dispatch<SetStateAction<number>>,
) {
  setZoom((prev) => {
    const next = Math.min(
      RAW_ZOOM_MAX,
      Math.max(RAW_ZOOM_MIN, parseFloat((prev + delta).toFixed(2))),
    );
    return next;
  });
}
