import ChatPanel from "../components/panels/ChatPanel";

export default function OwnerMessagesPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Signal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">
          Conversations with nurses
        </h1>
        <p className="mt-3 max-w-lg text-sm text-[var(--nh-text-secondary)]">
          Every message is logged for trust and safety. Reply within 2 hours to keep your verified badge.
        </p>
      </section>

      <ChatPanel />
    </div>
  );
}
