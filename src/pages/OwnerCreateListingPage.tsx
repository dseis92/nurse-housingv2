import { Lightbulb } from "lucide-react";
import ListingForm from "../components/forms/ListingForm";

export default function OwnerCreateListingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-600">Onboard</p>
            <h1 className="text-2xl font-semibold text-slate-900">Create a nurse-friendly listing</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Highlight guardrail-friendly amenities like private entry, secure parking, blackout shades, and pet policies.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600 sm:flex">
            <Lightbulb className="h-4 w-4 text-sky-600" />
            Tip: add a 10-sec video tour for higher conversion.
          </div>
        </div>
      </section>

      <ListingForm />
    </div>
  );
}

