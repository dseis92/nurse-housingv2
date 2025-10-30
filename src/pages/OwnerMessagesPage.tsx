import ChatPanel from "../components/panels/ChatPanel";

export default function OwnerMessagesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-sky-600">Signal</p>
        <h1 className="text-2xl font-semibold text-slate-900">Conversations with nurses</h1>
        <p className="mt-2 max-w-lg text-sm text-slate-600">
          Every message is logged for trust and safety. Reply within 2 hours to keep your verified badge.
        </p>
      </section>

      <ChatPanel />
    </div>
  );
}

