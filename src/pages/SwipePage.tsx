import { Sparkles } from "lucide-react";
import SwipeDeck from "../components/swipe/SwipeDeck";

export default function SwipePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-600">Match &amp; Book</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Swipe to shortlist</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Each card already passed stipend, commute, and safety guardrails. Tap match to open a double-opt chat.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 sm:inline-flex">
            <Sparkles className="h-4 w-4" />
            Smart scoring enabled
          </div>
        </div>
      </section>
      <SwipeDeck />
    </div>
  );
}

