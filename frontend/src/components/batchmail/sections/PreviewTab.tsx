import type { CsvMapping, ParsedCsv } from "@/components/ui/CsvUploader";
import PreviewPane from "@/components/ui/PreviewPane";

type PreviewTabProps = {
  startTutorial: () => void;
  csv: ParsedCsv | null;
  mapping: CsvMapping | null;
  template: string;
  onExportJson: (htmlRender: (row: Record<string, string>) => string) => void;
  subjectTemplate: string;
  messageContentHtml: string;
  headerConfirmed: string;
};

export default function PreviewTab({
  startTutorial,
  csv,
  mapping,
  template,
  onExportJson,
  subjectTemplate,
  messageContentHtml,
  headerConfirmed,
}: PreviewTabProps) {
  return (
    <div id="tutorial-preview-pane">
      <div className="flex justify-end pb-3">
        <button
          type="button"
          onClick={startTutorial}
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
        extraContext={{ content: messageContentHtml, header: headerConfirmed }}
        showSubjectEditor={false}
      />
    </div>
  );
}
