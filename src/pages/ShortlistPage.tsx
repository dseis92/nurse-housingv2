import { CalendarClock, HandCoins } from "lucide-react";
import ShortlistBoard from "../components/panels/ShortlistBoard";

export default function ShortlistPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-600">Decision board</p>
            <h1 className="text-2xl font-semibold text-slate-900">Compare final picks</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Hold your top five. When you click request hold, we send the owner an intent notification with your guardrails.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
              <CalendarClock className="h-3.5 w-3.5 text-sky-600" />
              24 hr hold
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
              <HandCoins className="h-3.5 w-3.5 text-sky-600" />
              $100 intent fee (refundable)
            </span>
          </div>
        </div>
      </section>

      <ShortlistBoard />
    </div>
  );
}
