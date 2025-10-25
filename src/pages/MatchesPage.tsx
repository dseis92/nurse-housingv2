import { MessageSquare } from "lucide-react";
import ChatPanel from "../components/panels/ChatPanel";

export default function MatchesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-600">Double opt-in</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Chat with verified owners</h1>
            <p className="mt-2 max-w-lg text-sm text-zinc-600">
              We open chat only on mutual matches or when an owner pre-approves your guardrails. Keep everything in app for safety.
            </p>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 sm:inline-flex">
            <MessageSquare className="h-4 w-4 text-teal-600" />
            Conversations logged
          </span>
        </div>
      </section>

      <ChatPanel />
    </div>
  );
}

