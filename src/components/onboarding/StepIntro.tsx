interface StepIntroProps {
  headline: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export default function StepIntro({ headline, description, primaryLabel, secondaryLabel, onPrimary, onSecondary }: StepIntroProps) {
  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-500">Let’s get started</p>
        <h1 className="text-3xl font-semibold text-slate-900">{headline}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <div className="mt-10 space-y-3">
        <button type="button" onClick={onPrimary} className="btn btn-primary w-full justify-center text-base">
          {primaryLabel}
        </button>
        {secondaryLabel && (
          <button
            type="button"
            onClick={onSecondary}
            className="btn btn-ghost w-full justify-center text-base"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
