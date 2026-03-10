"use client";

import { useMemo, useState, Suspense, useCallback } from "react";
import { driver } from "driver.js";
import type { DriveStep } from "driver.js";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CsvUploader, {
  CsvMapping,
  ParsedCsv,
} from "@/components/ui/CsvUploader";
// Legacy TemplateManager import removed; using TemplateLibrary instead.
import TemplateLibrary from "@/components/ui/TemplateLibrary";
import PreviewPane from "@/components/ui/PreviewPane";
import CsvTable from "@/components/ui/CsvTable";
import AttachmentsUploader, {
  type AttachIndex,
} from "@/components/ui/AttachmentsUploader";
import Tabs from "@/components/ui/Tabs";
import Docs from "@/components/sections/Docs";

type RenderedEmail = {
  to: string;
  name?: string;
  subject?: string;
  html: string;
};

type TabId = "csv" | "template" | "preview" | "docs";
type StepConfig = {
  selector: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
};

const tabSelector = (id: string) => `[role="tab"][aria-controls="panel-${id}"]`;

const TAB_TUTORIALS: Record<TabId, StepConfig[]> = {
  csv: [
    {
      selector: tabSelector("csv"),
      title: "CSV Workspace",
      description:
        "Start here to upload your spreadsheet and configure mappings.",
      side: "bottom",
      align: "start",
    },
    {
      selector: "#tutorial-csv-uploader",
      title: "Upload CSV",
      description:
        "Drop your file or choose from disk. Columns auto-detect for quicker mapping.",
      side: "right",
      align: "start",
    },
    {
      selector: "#tutorial-attachments",
      title: "Match Attachments",
      description:
        "Optional: associate files per recipient. Diacritic-safe matching is built in.",
      side: "right",
      align: "center",
    },
    {
      selector: "#tutorial-csv-table",
      title: "Review Rows",
      description:
        "Spot check your data, remap columns, and edit values directly.",
      side: "top",
      align: "start",
    },
  ],
  template: [
    {
      selector: tabSelector("template"),
      title: "Template Tab",
      description:
        "Switch here to browse saved HTML templates, upload new ones, or edit from scratch.",
      side: "bottom",
      align: "center",
    },
    {
      selector: "#tutorial-template-library",
      title: "Template Library",
      description:
        'Use raw or visual modes, adjust formatting, and click "Use this template" once satisfied.',
      side: "right",
      align: "start",
    },
    {
      selector: "#tutorial-upload-html",
      title: "Upload or Replace HTML",
      description:
        "Need to tweak an existing file? Upload a fresh HTML export or edit the template inline as needed.",
      side: "right",
      align: "start",
    },
    {
      selector: "#tutorial-email-message",
      title: "Email Message Editor",
      description:
        "Craft the body, toggle HTML mode, and preview the final email layout inside this surface.",
      side: "left",
      align: "start",
    },
    {
      selector: "#tutorial-insert-variable",
      title: "Insert Variables",
      description:
        "Drop recipient data wherever you need it—click here to insert placeholders like {{ name }}.",
      side: "bottom",
      align: "end",
    },
  ],
  preview: [
    {
      selector: tabSelector("preview"),
      title: "Preview Tab",
      description:
        "Everything before send lives here: env checks, recipients, subjects, previews, and batches.",
      side: "bottom",
      align: "center",
    },
    {
      selector: "#tutorial-env-controls",
      title: "Sender Environment",
      description:
        "Sender uses the Arduino Day Philippines account configured in the app env.",
      side: "bottom",
      align: "start",
    },
    {
      selector: "#tutorial-recipient-list",
      title: "Recipient Snapshot",
      description:
        "Double-check who will receive the run—scroll this list to verify every mapped email.",
      side: "right",
      align: "center",
    },
    {
      selector: "#tutorial-subject-editor",
      title: "Subject Controls",
      description:
        "Change the subject to anything you want and inject variables like {{ name }} on the fly.",
      side: "left",
      align: "start",
    },
    {
      selector: "#tutorial-preview-frame",
      title: "Live Preview",
      description:
        "Flip through rows to see exactly what each recipient will receive before exporting or sending.",
      side: "left",
      align: "center",
    },
    {
      selector: "#tutorial-batch-preview",
      title: "Batch Planner",
      description:
        "Batch size adapts automatically—attachments force smaller batches (1 or 3) to respect limits.",
      side: "top",
      align: "start",
    },
  ],
  docs: [
    {
      selector: tabSelector("docs"),
      title: "Documentation Tab",
      description:
        "Need reminders? This section aggregates tips, FAQ, and troubleshooting steps.",
      side: "bottom",
      align: "center",
    },
    {
      selector: "#tutorial-docs",
      title: "Docs Stack",
      description:
        "Skim release notes, watch demos, or follow links to advanced workflows.",
      side: "right",
      align: "start",
    },
  ],
};

const buildSteps = (configs: StepConfig[]): DriveStep[] =>
  configs.reduce<DriveStep[]>(
    (acc, { selector, title, description, side, align }) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return acc;
      acc.push({
        element,
        popover: {
          title,
          description,
          side,
          align,
        },
      });
      return acc;
    },
    []
  );

function PageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<CsvMapping | null>(null);
  const [template, setTemplate] = useState<string>(
    "<html>\n  <body>\n    <p>Hello {{ name }},</p>\n    <p>This is a sample template. Replace me!</p>\n  </body>\n</html>"
  );
  const [subjectTemplate, setSubjectTemplate] =
    useState<string>("{{ subject }}");
  const [attachmentsByName, setAttachmentsByName] = useState<AttachIndex>({});
  const [hasSelectedTemplate, setHasSelectedTemplate] =
    useState<boolean>(false);
  // Keep a derived indicator but avoid unused variable warnings.
  const totalCount = useMemo(() => csv?.rowCount ?? 0, [csv]);

  const startTabTutorial = useCallback((tabId: TabId) => {
    if (typeof window === "undefined") return;
    const configs = TAB_TUTORIALS[tabId];
    if (!configs || configs.length === 0) return;
    const tabButton = document.querySelector<HTMLButtonElement>(
      tabSelector(tabId)
    );
    if (tabButton && tabButton.getAttribute("aria-selected") !== "true") {
      tabButton.click();
    }
    requestAnimationFrame(() => {
      const steps = buildSteps(configs);
      if (!steps.length) return;
      driver({
        showProgress: true,
        allowClose: true,
        overlayOpacity: 0.55,
        animate: true,
        steps,
      }).drive();
    });
  }, []);

  const onExportJson = async (
    htmlRender: (row: Record<string, string>) => string
  ) => {
    if (!csv || !mapping) return;
    const nunjucks = await import("nunjucks");
    const payload: RenderedEmail[] = csv.rows
      .filter((r: Record<string, string>) => r[mapping.recipient])
      .map((r: Record<string, string>) => ({
        to: String(r[mapping.recipient]),
        name: r[mapping.name] ? String(r[mapping.name]) : undefined,
        subject: subjectTemplate?.trim()
          ? nunjucks.renderString(subjectTemplate, {
              ...r,
              name: r[mapping.name],
              recipient: r[mapping.recipient],
            })
          : mapping.subject
          ? String(r[mapping.subject])
          : undefined,
        html: htmlRender(r),
      }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batchmail-payload.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3 text-primary font-urbanist">
            BatchMail{" "}
            <span className="keep-light-pill text-[12px] font-semibold px-2.5 py-1 rounded bg-white-100 text-slate-900 border border-slate-300 tracking-widest uppercase font-montserrat">
              ADPH
            </span>
          </h1>
          <p className="text-sm text-secondary">
            Upload CSV, edit/upload Jinja-style HTML template, preview, and
            export. {totalCount ? `(${totalCount} rows)` : ""}
          </p>
        </header>

        <div
          id="tutorial-tabs"
          className="rounded-xl border border-primary/20 bg-white p-4 shadow-sm"
        >
          <Tabs
            items={[
              {
                id: "csv",
                label: "CSV",
                content: (
                  <div className="space-y-4" id="tutorial-csv-stack">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => startTabTutorial("csv")}
                        className="text-xs font-semibold rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        CSV Tutorial
                      </button>
                    </div>
                    <section id="tutorial-csv-uploader">
                      <CsvUploader
                        onParsed={(data: {
                          csv: ParsedCsv;
                          mapping: CsvMapping;
                        }) => {
                          setCsv(data.csv);
                          setMapping(data.mapping);
                          // Reset template selection on new CSV to reduce mistakes
                          setHasSelectedTemplate(false);
                        }}
                        currentMapping={mapping ?? undefined}
                      />
                    </section>
                    <section id="tutorial-attachments">
                      <AttachmentsUploader
                        csv={csv}
                        mapping={mapping}
                        value={attachmentsByName}
                        onChange={setAttachmentsByName}
                      />
                    </section>
                    <section id="tutorial-csv-table">
                      <CsvTable
                        csv={csv}
                        mapping={mapping}
                        onMappingChange={setMapping}
                        onChange={setCsv}
                      />
                    </section>
                  </div>
                ),
              },
              {
                id: "template",
                label: "Template",
                content: (
                  <div id="tutorial-template-library">
                    <div className="flex justify-end pb-3">
                      <button
                        type="button"
                        onClick={() => startTabTutorial("template")}
                        className="text-xs font-semibold rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        Template Tutorial
                      </button>
                    </div>
                    <TemplateLibrary
                      availableVars={useMemo(() => {
                        const s = new Set<string>();
                        if (csv?.headers) csv.headers.forEach((h) => s.add(h));
                        if (mapping) {
                          s.add("name");
                          s.add("recipient");
                        }
                        return Array.from(s);
                      }, [csv, mapping])}
                      initialHtml={template}
                      onUseTemplate={({ html }) => {
                        setTemplate(html);
                        setHasSelectedTemplate(true);
                      }}
                    />
                  </div>
                ),
              },
              {
                id: "preview",
                label: "Preview & Export",
                content: (
                  <div id="tutorial-preview-pane">
                    <div className="flex justify-end pb-3">
                      <button
                        type="button"
                        onClick={() => startTabTutorial("preview")}
                        className="text-xs font-semibold rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        Preview Tutorial
                      </button>
                    </div>
                    <PreviewPane
                      csv={csv}
                      mapping={mapping}
                      template={template}
                      onExportJson={onExportJson}
                      subjectTemplate={subjectTemplate}
                      onSubjectChange={setSubjectTemplate}
                      attachmentsByName={attachmentsByName}
                    />
                  </div>
                ),
              },
              {
                id: "docs",
                label: "Documentation",
                content: (
                  <div className="space-y-4" id="tutorial-docs">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => startTabTutorial("docs")}
                        className="text-xs font-semibold rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        Docs Tutorial
                      </button>
                    </div>
                    <Docs />
                  </div>
                ),
              },
            ]}
            initialId={(searchParams.get("tab") as string) || "csv"}
            isDisabled={(id) => {
              if (id === "template") {
                return !csv; // block if no CSV uploaded yet
              }
              if (id === "preview") {
                // require CSV+mapping and explicit template selection via "Use this template"
                return !csv || !mapping || !hasSelectedTemplate;
              }
              return false;
            }}
            getDisabledTitle={(id) => {
              if (id === "template" && !csv)
                return "Upload a CSV first to configure the template.";
              if (id === "preview" && (!csv || !mapping))
                return "Upload CSV and set column mapping first.";
              if (id === "preview" && !hasSelectedTemplate)
                return 'Choose a template and click "Use this template" first.';
              return undefined;
            }}
            onChange={(id) => {
              const usp = new URLSearchParams(
                Array.from(searchParams.entries())
              );
              usp.set("tab", id);
              router.replace(`${pathname}?${usp.toString()}`);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PageInner />
    </Suspense>
  );
}
