type BatchmailHeaderProps = {
  totalCount: number;
};

export default function BatchmailHeader({ totalCount }: BatchmailHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3 text-primary font-morganite">
        BatchMail
        <span className="keep-light-pill text-[12px] font-semibold px-2.5 py-1 rounded bg-white-100 text-slate-900 border border-slate-300 tracking-widest uppercase font-urbanist">
          ADPH
        </span>
      </h1>
      <p className="text-sm text-secondary">
        Use the Guests tab list with the ADPH template, preview, and export. {totalCount ? `(${totalCount} recipients)` : ""}
      </p>
    </header>
  );
}
