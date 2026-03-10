"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { driver } from "driver.js";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { CsvMapping } from "@/components/ui/CsvUploader";
import Tabs from "@/components/ui/Tabs";
import type { Guest } from "@/types/guest";
import BatchmailHeader from "@/components/batchmail/BatchmailHeader";
import { buildGuestCsv } from "@/components/batchmail/batchmailCsv";
import { TAB_TUTORIALS, buildSteps, ensureTabSelected, type TabId } from "@/components/batchmail/batchmailTutorial";
import DocsTab from "@/components/batchmail/sections/DocsTab";
import GuestsTab from "@/components/batchmail/sections/GuestsTab";
import MessageTab from "@/components/batchmail/sections/MessageTab";
import PreviewTab from "@/components/batchmail/sections/PreviewTab";

type BatchmailWorkspaceProps = {
  guests: Guest[];
};

type RenderedEmail = {
  to: string;
  name?: string;
  subject?: string;
  html: string;
};

export default function BatchmailWorkspace({ guests }: BatchmailWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [recipientScope, setRecipientScope] = useState<"all" | "registered" | "pending">("all");
  const filteredGuests = useMemo(() => {
    if (recipientScope === "all") return guests;
    if (recipientScope === "registered") {
      return guests.filter((guest) => guest.is_registered);
    }
    return guests.filter((guest) => !guest.is_registered);
  }, [guests, recipientScope]);
  const recipientCountLabel = useMemo(() => {
    if (recipientScope === "registered") return "Registered";
    if (recipientScope === "pending") return "Pending";
    return "All";
  }, [recipientScope]);
  const csv = useMemo(() => buildGuestCsv(filteredGuests), [filteredGuests]);
  const mapping = useMemo<CsvMapping | null>(() => {
    if (!csv) return null;
    return { recipient: "email", name: "name", subject: null };
  }, [csv]);
  const [template, setTemplate] = useState<string>("");
  const [subjectDraft, setSubjectDraft] = useState<string>("{{ subject }}");
  const [headerDraft, setHeaderDraft] = useState<string>("Hi {{ recipient }},");
  const [messageDraft, setMessageDraft] = useState<string>("");
  const [subjectConfirmed, setSubjectConfirmed] = useState<string>("{{ subject }}");
  const [headerConfirmed, setHeaderConfirmed] = useState<string>("Hi {{ recipient }},");
  const [messageConfirmed, setMessageConfirmed] = useState<string>("");
  const hasUnconfirmedChanges = useMemo(
    () =>
      subjectDraft !== subjectConfirmed ||
      headerDraft !== headerConfirmed ||
      messageDraft !== messageConfirmed,
    [subjectDraft, subjectConfirmed, headerDraft, headerConfirmed, messageDraft, messageConfirmed]
  );
  const messageContentHtml = useMemo(
    () => messageConfirmed.replace(/\n/g, "<br />"),
    [messageConfirmed]
  );
  const totalCount = useMemo(() => (csv?.rowCount ?? 0), [csv]);
  const templateReady = template.trim().length > 0;

  const startTabTutorial = useCallback((tabId: TabId) => {
    if (typeof window === "undefined") return;
    const configs = TAB_TUTORIALS[tabId];
    if (!configs || configs.length === 0) return;
    ensureTabSelected(tabId);
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

  useEffect(() => {
    let active = true;
    fetch("/email-template/adph.html")
      .then((res) => res.text())
      .then((html) => {
        if (!active) return;
        setTemplate(html);
      })
      .catch(() => {
        if (!active) return;
        setTemplate("");
      });
    return () => {
      active = false;
    };
  }, []);

  const onExportJson = async (htmlRender: (row: Record<string, string>) => string) => {
    if (!csv || !mapping) return;
    const nunjucks = await import("nunjucks");
    const payload: RenderedEmail[] = csv.rows
      .filter((r: Record<string, string>) => r[mapping.recipient])
      .map((r: Record<string, string>) => ({
        to: String(r[mapping.recipient]),
        name: r[mapping.name] ? String(r[mapping.name]) : undefined,
        subject: subjectConfirmed?.trim()
          ? nunjucks.renderString(subjectConfirmed, {
              ...r,
              content: messageContentHtml,
              header: headerConfirmed,
              name: r[mapping.name],
              recipient: r[mapping.recipient],
            })
          : (mapping.subject ? String(r[mapping.subject]) : undefined),
        html: htmlRender(r),
      }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batchmail-payload.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="batchmail-dark space-y-6">
      <BatchmailHeader totalCount={totalCount} />

      <div id="tutorial-tabs" className="rounded-xl border border-primary/20 bg-white p-4 shadow-sm">
        <Tabs
          items={[
            {
              id: "guests",
              label: "Guests",
              content: (
                <GuestsTab
                  guests={guests}
                  filteredGuests={filteredGuests}
                  totalCount={totalCount}
                />
              ),
            },
            {
              id: "message",
              label: "Message",
              content: (
                <MessageTab
                  recipientScope={recipientScope}
                  setRecipientScope={setRecipientScope}
                  recipientCountLabel={recipientCountLabel}
                  totalCount={totalCount}
                  subjectDraft={subjectDraft}
                  setSubjectDraft={setSubjectDraft}
                  headerDraft={headerDraft}
                  setHeaderDraft={setHeaderDraft}
                  messageDraft={messageDraft}
                  setMessageDraft={setMessageDraft}
                  hasUnconfirmedChanges={hasUnconfirmedChanges}
                  onConfirmMessage={() => {
                    setSubjectConfirmed(subjectDraft);
                    setHeaderConfirmed(headerDraft);
                    setMessageConfirmed(messageDraft);
                  }}
                />
              ),
            },
            {
              id: "preview",
              label: "Preview & Export",
              content: (
                <PreviewTab
                  startTutorial={() => startTabTutorial("preview")}
                  csv={csv}
                  mapping={mapping}
                  template={template}
                  onExportJson={onExportJson}
                  subjectTemplate={subjectConfirmed}
                  messageContentHtml={messageContentHtml}
                  headerConfirmed={headerConfirmed}
                />
              ),
            },
            {
              id: "docs",
              label: "Documentation",
              content: (
                <DocsTab startTutorial={() => startTabTutorial("docs")} />
              ),
            },
          ]}
          initialId={(() => {
            const raw = searchParams.get("tab") || "guests";
            if (raw === "csv") return "guests";
            if (raw === "template") return "preview";
            if (raw === "preview" || raw === "docs" || raw === "guests" || raw === "message") return raw;
            return "guests";
          })()}
          isDisabled={(id) => {
            if (id === "preview") {
              return !csv || !mapping || !templateReady;
            }
            return false;
          }}
          getDisabledTitle={(id) => {
            if (id === "preview" && (!csv || !mapping)) return "Add guests first to preview or send.";
            if (id === "preview" && !templateReady) return "Loading the ADPH template.";
            return undefined;
          }}
          onChange={(id) => {
            const usp = new URLSearchParams(Array.from(searchParams.entries()));
            usp.set("tab", id);
            router.replace(`${pathname}?${usp.toString()}`);
          }}
        />
      </div>
    </div>
  );
}
