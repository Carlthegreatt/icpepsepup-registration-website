"use client";

export default function Docs() {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-yellow-400 prose-a:text-yellow-500 prose-strong:text-yellow-50 prose-code:text-yellow-200 prose-code:bg-[rgba(25,25,10,0.8)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-[rgba(10,10,5,0.8)] prose-pre:border prose-pre:border-yellow-900/50 prose-li:text-yellow-100/70 prose-p:text-yellow-100/70 p-6 rounded-xl border border-yellow-900/50 bg-[rgba(25,25,10,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        BatchMail Documentation
      </h1>
      <p className="text-lg leading-relaxed">
        BatchMail helps you bulk‑send personalized HTML emails: upload a CSV,
        author a Jinja‑style template, preview & validate, then send or export
        JSON.
      </p>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">Quick Start</h2>
      <ol className="space-y-2 marker:text-yellow-500 font-medium">
        <li>
          <strong className="text-yellow-400">CSV Tab:</strong> Upload your CSV
          (first row must be headers). Map required columns.
        </li>
        <li>
          <strong className="text-yellow-400">Template Tab:</strong> Upload or
          edit HTML. Insert variables using <code>{"{{ variable }}"}</code>.
        </li>
        <li>
          <strong className="text-yellow-400">Preview &amp; Export Tab:</strong>{" "}
          Provide a dynamic subject, verify environment, export or send.
        </li>
      </ol>
      <hr className="my-8 border-yellow-900/30" />

      <h2 className="mt-8 border-b border-yellow-900/30 pb-2">
        Environment Variables
      </h2>
      <p>
        BatchMail uses the ICPEP SE - PUP Manila sender credentials configured
        in the app environment.
      </p>
      <pre className="whitespace-pre-wrap break-word shadow-inner">
        <code>
          # .env ICPEP_SENDER_EMAIL=you@example.com
          ICPEP_SENDER_PASSWORD=your-app-password ICPEP_SENDER_NAME=Your Display
          Name
        </code>
      </pre>
      <ul className="space-y-2 marker:text-yellow-600">
        <li>
          <strong className="text-yellow-400">ICPEP_SENDER_EMAIL</strong> –
          Mailbox you will send from.
        </li>
        <li>
          <strong className="text-yellow-400">ICPEP_SENDER_PASSWORD</strong> –
          Provider generated app password (e.g. Gmail).
        </li>
        <li>
          <strong className="text-yellow-400">ICPEP_SENDER_NAME</strong> –
          Friendly display name.
        </li>
      </ul>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        CSV Requirements
      </h2>
      <p>
        Required headers: an email address column and a name column. Add any
        number of extra personalization columns (e.g. <code>amount</code>,{" "}
        <code>company</code>, <code>plan</code>).
      </p>
      <p>
        You can edit any cell inline by double‑clicking, add/remove columns, and
        insert/delete rows. Download the modified CSV at any time.
      </p>
      <h3 className="text-yellow-500 mt-6 mb-3">Example CSV</h3>
      <pre className="whitespace-pre-wrap break-word shadow-inner">
        <code>
          # recipient,name,... headers on first row
          recipient,name,amount,segment alice@example.com,Alice,125,referral
          bob@example.com,Bob,300,retargeting
        </code>
      </pre>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Template Authoring
      </h2>
      <p>
        Write standard HTML. Use Jinja/Handlebars‑like syntax for variables:
      </p>
      <pre className="whitespace-pre-wrap break-word shadow-inner">
        <code>{`<p>Hello {{ name }}, your invoice total is {{ amount }}.</p>`}</code>
      </pre>
      <p>Available variables:</p>
      <ul className="marker:text-yellow-600">
        <li>
          <code>{"{{ name }}"}</code>, <code>{"{{ recipient }}"}</code>
        </li>
        <li>
          Every CSV header (e.g. <code>{"{{ amount }}"}</code>,{" "}
          <code>{"{{ segment }}"}</code>)
        </li>
      </ul>
      <p>
        Logic, filters, loops, etc. supported by Nunjucks can be added if needed
        (<code>{`{% if amount > 200 %}VIP{% endif %}`}</code>).
      </p>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">Subject Line</h2>
      <p>
        Set a dynamic subject in Preview using the same variable syntax. If the
        subject template is blank, and a mapped subject column exists in the
        CSV, that column’s value is used.
      </p>
      <pre className="whitespace-pre-wrap break-word shadow-inner">
        <code>{`Invoice for {{ name }} - Total {{ amount }}`}</code>
      </pre>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Validation & Variable Checks
      </h2>
      <p>
        Unknown variables are flagged so you can correct typos. Keep variable
        names exactly matching CSV headers.
      </p>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">Export JSON</h2>
      <p>Generates an array of rendered objects:</p>
      <pre className="whitespace-pre-wrap break-word shadow-inner">
        <code>{`[
  {
    "to": "alice@example.com",
    "name": "Alice",
    "subject": "Invoice for Alice - Total 125",
    "html": "<p>Hello Alice...</p>"
  }
]`}</code>
      </pre>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Sending Emails
      </h2>
      <ol className="space-y-2 marker:text-yellow-500 font-medium">
        <li>Ensure the status badge shows a valid sender env.</li>
        <li>Review recipient count and any warnings.</li>
        <li>
          Click <strong className="text-yellow-400">Send Emails</strong>.
          Progress and logs stream live.
        </li>
      </ol>
      <p className="italic text-yellow-500/70">
        For large lists, consider batching (future roadmap) to reduce rate‑limit
        risk.
      </p>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Safety & Sanitization
      </h2>
      <p>
        HTML edited in the WYSIWYG is sanitized via DOMPurify to strip scripts
        and dangerous attributes. Avoid inline event handlers or script tags.
      </p>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Troubleshooting
      </h2>
      <ul className="space-y-2 marker:text-yellow-600">
        <li>
          <strong className="text-yellow-400">Missing env:</strong> Ensure the
          ICPEP SE - PUP Manila sender keys exist in the app environment.
        </li>
        <li>
          <strong className="text-yellow-400">Auth failures:</strong> Verify
          correct app password & provider requirements (e.g. Gmail App Password
          with 2FA).
        </li>
        <li>
          <strong className="text-yellow-400">Unknown variable:</strong> Check
          spelling; confirm the header exists in the CSV.
        </li>
      </ul>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Advanced Template Example
      </h2>
      <pre className="whitespace-pre-wrap break-word shadow-inner">
        <code>{`<html>\n  <body>\n    <h2>Account Summary for {{ name }}</h2>\n    {% if amount %}<p>Your total due: \${{ amount }}.</p>{% endif %}\n    <p>Segment: {{ segment | default('n/a') }}</p>\n    {% if amount and amount > 250 %}<p><strong>VIP Thank You!</strong></p>{% endif %}\n  </body>\n</html>`}</code>
      </pre>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">
        Security Notes
      </h2>
      <p>
        No secrets are persisted beyond memory. For production use, add
        encrypted storage, audit logging, and rate limiting.
      </p>

      <h2 className="mt-10 border-b border-yellow-900/30 pb-2">Roadmap</h2>
      <ul className="marker:text-yellow-600">
        <li>Template versioning & server persistence</li>
        <li>Batch sending + retry / backoff</li>
        <li>Dry‑run full preview per recipient</li>
        <li>Role‑based access & audit logs</li>
      </ul>
    </div>
  );
}
