import ChatPanel from "../components/panels/ChatPanel";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-teal-600">Trust &amp; safety</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Escalated conversations</h1>
        <p className="mt-2 max-w-lg text-sm text-zinc-600">
          Monitor hold requests and intervene quickly if stipend guardrails or safety expectations are misaligned.
        </p>
      </section>

      <ChatPanel />
    </div>
  );
}

