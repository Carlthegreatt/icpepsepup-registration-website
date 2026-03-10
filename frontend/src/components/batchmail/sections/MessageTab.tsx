type RecipientScope = "all" | "registered" | "pending";

type MessageTabProps = {
  recipientScope: RecipientScope;
  setRecipientScope: (value: RecipientScope) => void;
  recipientCountLabel: string;
  totalCount: number;
  subjectDraft: string;
  setSubjectDraft: (value: string) => void;
  headerDraft: string;
  setHeaderDraft: (value: string) => void;
  messageDraft: string;
  setMessageDraft: (value: string) => void;
  hasUnconfirmedChanges: boolean;
  onConfirmMessage: () => void;
};

export default function MessageTab({
  recipientScope,
  setRecipientScope,
  recipientCountLabel,
  totalCount,
  subjectDraft,
  setSubjectDraft,
  headerDraft,
  setHeaderDraft,
  messageDraft,
  setMessageDraft,
  hasUnconfirmedChanges,
  onConfirmMessage,
}: MessageTabProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-primary/20 bg-white p-4">
        <h2 className="text-lg font-semibold text-primary">Recipients</h2>
        <p className="text-sm text-secondary">
          Choose which guests should receive this message.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <select
              value={recipientScope}
              onChange={(event) =>
                setRecipientScope(event.target.value as RecipientScope)
              }
              className="w-full appearance-none rounded-xl border border-primary/30 bg-white px-3 py-2.5 pr-11 text-sm text-primary shadow-sm transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-primary/50"
            >
              <option value="all">All guests</option>
              <option value="registered">Registered only</option>
              <option value="pending">Pending only</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary/60">
              v
            </span>
          </div>
          <div className="flex items-center justify-start md:justify-end">
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {recipientCountLabel} - {totalCount}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-primary/20 bg-white p-4">
        <h2 className="text-lg font-semibold text-primary">Subject</h2>
        <p className="text-xs text-secondary mb-2">
          You can use variables like {"{{ name }}"} or {"{{ recipient }}"}.
        </p>
        <input
          type="text"
          value={subjectDraft}
          onChange={(event) => setSubjectDraft(event.target.value)}
          placeholder="Enter subject line"
          className="w-full rounded border border-primary/20 px-3 py-2 text-sm text-primary"
        />
      </section>

      <section className="rounded-lg border border-primary/20 bg-white p-4">
        <h2 className="text-lg font-semibold text-primary">Header</h2>
        <p className="text-xs text-secondary mb-2">
          This line appears at the top of the email body. You can use
          variables like {"{{ recipient }}"}.
        </p>
        <input
          type="text"
          value={headerDraft}
          onChange={(event) => setHeaderDraft(event.target.value)}
          placeholder="Hi {{ recipient }},"
          className="w-full rounded border border-primary/20 px-3 py-2 text-sm text-primary"
        />
      </section>

      <section className="rounded-lg border border-primary/20 bg-white p-4">
        <h2 className="text-lg font-semibold text-primary">Message</h2>
        <p className="text-xs text-secondary mb-2">
          The message is injected into the ADPH template. New lines are preserved.
        </p>
        <textarea
          value={messageDraft}
          onChange={(event) => setMessageDraft(event.target.value)}
          placeholder="Write the email content here."
          rows={8}
          className="w-full rounded border border-primary/20 px-3 py-2 text-sm text-primary"
        />
      </section>

      <section className="rounded-lg border border-primary/20 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">Confirm Message</h2>
            <p className="text-xs text-secondary">
              Preview & Export uses the last confirmed subject, header, and message.
            </p>
          </div>
          <button
            type="button"
            onClick={onConfirmMessage}
            disabled={!hasUnconfirmedChanges}
            className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Subject, Header, and Message
          </button>
        </div>
        {!hasUnconfirmedChanges && (
          <div className="mt-2 text-xs text-secondary">
            No unconfirmed changes.
          </div>
        )}
      </section>
    </div>
  );
}
