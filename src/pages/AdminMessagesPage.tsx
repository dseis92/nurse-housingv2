import ChatPanel from "../components/panels/ChatPanel";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Trust &amp; safety</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">
          Escalated conversations
        </h1>
        <p className="mt-3 max-w-lg text-sm text-[var(--nh-text-secondary)]">
          Monitor hold requests and intervene quickly if stipend guardrails or safety expectations are misaligned.
        </p>
      </section>

      <ChatPanel />
    </div>
  );
}
