import { FormEvent, useState } from "react";
import { v4 as uuid } from "uuid";
import { useAppStore } from "../../stores/useAppStore";
import type { Listing } from "../../types";

const defaultState: Partial<Listing> = {
  title: "",
  description: "",
  weeklyPrice: 950,
  city: "San Francisco",
  state: "CA",
  zip: "94103",
  bedrooms: 1,
  bathrooms: 1,
  petPolicy: "allowed",
  parking: "street",
  status: "draft",
  minStayWeeks: 12,
};

export default function ListingForm() {
  const ownerProfile = useAppStore((state) => state.ownerProfiles[0]);
  const createListing = useAppStore((state) => state.actions.createListing);

  const [formState, setFormState] = useState(defaultState);

  if (!ownerProfile) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Create an owner profile to add listings.
      </div>
    );
  }

  const updateField = (key: keyof Listing, value: Listing[keyof Listing]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const listing: Listing = {
      id: uuid(),
      ownerId: ownerProfile.id,
      title: String(formState.title),
      description: String(formState.description),
      weeklyPrice: Number(formState.weeklyPrice),
      address: String(formState.address ?? "TBD"),
      city: String(formState.city ?? ""),
      state: String(formState.state ?? ""),
      zip: String(formState.zip ?? ""),
      lat: 37.7749,
      lng: -122.4194,
      commuteMinutesPeak: Number(formState.commuteMinutesPeak ?? 20),
      commuteMinutesNight: Number(formState.commuteMinutesNight ?? 15),
      stipendFitScore: 80,
      safetyScore: 85,
      qualityScore: 82,
      totalScore: 82,
      bedrooms: Number(formState.bedrooms ?? 1),
      bathrooms: Number(formState.bathrooms ?? 1),
      petPolicy: (formState.petPolicy as Listing["petPolicy"]) ?? "none",
      parking: (formState.parking as Listing["parking"]) ?? "street",
      videoUrl: formState.videoUrl ? String(formState.videoUrl) : undefined,
      heroImage:
        String(formState.heroImage) ||
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200",
      gallery: [],
      amenities: (formState.amenities as string[]) ?? [],
      safetyFeatures: (formState.safetyFeatures as string[]) ?? [],
      status: (formState.status as Listing["status"]) ?? "draft",
      availableFrom: now,
      minStayWeeks: Number(formState.minStayWeeks ?? 12),
      createdAt: now,
      updatedAt: now,
      commuteNotes: formState.commuteNotes ? String(formState.commuteNotes) : undefined,
    };

    createListing(listing);
    setFormState(defaultState);
  };

  return (
    <form
      className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5"
      onSubmit={handleSubmit}
    >
      <header>
        <p className="text-xs uppercase tracking-wide text-sky-600">Create Listing</p>
        <h2 className="text-xl font-semibold text-slate-900">Nurse-ready rental</h2>
        <p className="mt-1 text-sm text-slate-600">
          Highlight safety features, commute details, and flexible terms to stand out.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Headline">
          <input
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="form-input"
            required
          />
        </Field>
        <Field label="Weekly price ($)">
          <input
            type="number"
            min={500}
            step={25}
            value={formState.weeklyPrice}
            onChange={(event) => updateField("weeklyPrice", Number(event.target.value))}
            className="form-input"
            required
          />
        </Field>
        <Field label="Hero image URL">
          <input
            value={formState.heroImage ?? ""}
            onChange={(event) => updateField("heroImage", event.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Video tour URL (optional)">
          <input
            value={formState.videoUrl ?? ""}
            onChange={(event) => updateField("videoUrl", event.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Bedrooms">
          <input
            type="number"
            min={0}
            step={1}
            value={formState.bedrooms}
            onChange={(event) => updateField("bedrooms", Number(event.target.value))}
            className="form-input"
          />
        </Field>
        <Field label="Bathrooms">
          <input
            type="number"
            min={1}
            step={0.5}
            value={formState.bathrooms}
            onChange={(event) => updateField("bathrooms", Number(event.target.value))}
            className="form-input"
          />
        </Field>
        <Field label="Address">
          <input
            value={formState.address ?? ""}
            onChange={(event) => updateField("address", event.target.value)}
            className="form-input"
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="City">
            <input
              value={formState.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
              className="form-input"
              required
            />
          </Field>
          <Field label="State">
            <input
              value={formState.state ?? ""}
              onChange={(event) => updateField("state", event.target.value)}
              className="form-input"
              required
            />
          </Field>
          <Field label="ZIP">
            <input
              value={formState.zip ?? ""}
              onChange={(event) => updateField("zip", event.target.value)}
              className="form-input"
              required
            />
          </Field>
        </div>
        <Field label="Commute peak minutes">
          <input
            type="number"
            min={1}
            step={1}
            value={formState.commuteMinutesPeak ?? 20}
            onChange={(event) => updateField("commuteMinutesPeak", Number(event.target.value))}
            className="form-input"
          />
        </Field>
        <Field label="Commute night minutes">
          <input
            type="number"
            min={1}
            step={1}
            value={formState.commuteMinutesNight ?? 15}
            onChange={(event) => updateField("commuteMinutesNight", Number(event.target.value))}
            className="form-input"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={4}
          value={formState.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          className="form-input"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pet policy">
          <select
            value={formState.petPolicy}
            onChange={(event) => updateField("petPolicy", event.target.value as Listing["petPolicy"])}
            className="form-input"
          >
            <option value="allowed">All pets</option>
            <option value="cats">Cats only</option>
            <option value="dogs">Dogs only</option>
            <option value="none">No pets</option>
          </select>
        </Field>
        <Field label="Parking">
          <select
            value={formState.parking}
            onChange={(event) => updateField("parking", event.target.value as Listing["parking"])}
            className="form-input"
          >
            <option value="street">Street</option>
            <option value="driveway">Driveway</option>
            <option value="garage">Garage</option>
            <option value="none">No parking</option>
          </select>
        </Field>
      </div>

      <Field label="Commute notes">
        <textarea
          rows={3}
          value={formState.commuteNotes ?? ""}
          onChange={(event) => updateField("commuteNotes", event.target.value)}
          className="form-input"
        />
      </Field>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary gap-2 px-6 py-3">
          Publish to queue
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="space-y-1 text-sm font-medium text-slate-600">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
