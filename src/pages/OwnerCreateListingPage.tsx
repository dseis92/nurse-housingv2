import { Lightbulb } from "lucide-react";
import ListingForm from "../components/forms/ListingForm";

export default function OwnerCreateListingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-600">Onboard</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Create a nurse-friendly listing</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600">
              Highlight guardrail-friendly amenities like private entry, secure parking, blackout shades, and pet policies.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs text-zinc-600 sm:flex">
            <Lightbulb className="h-4 w-4 text-teal-600" />
            Tip: add a 10-sec video tour for higher conversion.
          </div>
        </div>
      </section>

      <ListingForm />
    </div>
  );
}

