import { fetchNurseOnboarding, saveNurseOnboarding } from "../../actions/onboardingActions";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Dog, Home, MapPin } from "lucide-react";
import StepperShell from "../../components/onboarding/StepperShell";
import StepIntro from "../../components/onboarding/StepIntro";
import PickerWheel from "../../components/onboarding/PickerWheel";
import OptionsGroup from "../../components/onboarding/OptionsGroup";
import { useAppStore } from "../../stores/useAppStore";
import { formatCurrency } from "../../lib/utils";
import type { LottieKey } from "../../config/lottie";

const leaseOptions = ["4 weeks", "8 weeks", "12 weeks", "16 weeks", "20 weeks", "24 weeks"];
const commuteModes = [
  { value: "drive-peak", label: "Drive in traffic", icon: <Car className="h-4 w-4" /> },
  { value: "drive-off", label: "Drive off hours", icon: <Car className="h-4 w-4" /> },
  { value: "public", label: "Public transit", icon: <MapPin className="h-4 w-4" /> },
  { value: "walk", label: "Walk", icon: <Home className="h-4 w-4" /> },
  { value: "bike", label: "Bike", icon: <Home className="h-4 w-4" /> },
];
const petOptions = [
  { value: "none", label: "No pets" },
  { value: "cat", label: "Cat", icon: <Dog className="h-4 w-4 rotate-45" /> },
  { value: "dog", label: "Dog", icon: <Dog className="h-4 w-4" /> },
  { value: "both", label: "Cat + Dog" },
];
const urgencyOptions = [
  { value: "looking", label: "I'm just looking" },
  { value: "soon", label: "Ready to move soon" },
  { value: "flex", label: "Need to move but flexible" },
  { value: "urgent", label: "I have to move" },
];

const bedroomOptions = [
  { value: "studio", label: "Studio" },
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3+ Bedrooms" },
];

const topPriorityOptions = [
  { value: "location", label: "Staying close to assignment" },
  { value: "price", label: "Best value" },
  { value: "amenities", label: "Amenities & safety" },
];

const amenityOptions = [
  { value: "laundry", label: "In-unit laundry" },
  { value: "parking", label: "Secure parking" },
  { value: "gym", label: "Gym access" },
  { value: "workspace", label: "Workspace" },
  { value: "pet-friendly", label: "Pet friendly" },
  { value: "private", label: "Private entrance" },
];

interface StepState {
  firstName: string;
  lastName: string;
  city: string;
  hospital: string;
  leaseLength: string;
  moveDate: string;
  budget: number;
  commuteMinutes: number;
  commuteMode: string;
  pets: string;
  bedrooms: string;
  amenities: string[];
  priority: string;
  urgency: string;
}

const INITIAL_STATE: StepState = {
  firstName: "Jordan",
  lastName: "Carter",
  city: "San Francisco, CA",
  hospital: "UCSF Medical Center",
  leaseLength: leaseOptions[2],
  moveDate: new Date().toISOString().slice(0, 10),
  budget: 2800,
  commuteMinutes: 25,
  commuteMode: "drive-peak",
  pets: "dog",
  bedrooms: "1",
  amenities: ["laundry", "workspace"],
  priority: "location",
  urgency: "soon",
};

const steps = [
  "intro",
  "profile",
  "location",
  "lease",
  "budget",
  "commute",
  "pets",
  "bedrooms",
  "amenities",
  "priority",
  "urgency",
];

const stepAnimations: Record<(typeof steps)[number], LottieKey> = {
  intro: "onboardingProgress",
  profile: "onboardingProgress",
  location: "mapSearchLoading",
  lease: "onboardingProgress",
  budget: "onboardingProgress",
  commute: "mapSearchLoading",
  pets: "onboardingProgress",
  bedrooms: "onboardingProgress",
  amenities: "onboardingProgress",
  priority: "levelUpBadge",
  urgency: "onboardingCompletion",
};

export default function OnboardingPage() {
  const completeOnboarding = useAppStore((state) => state.actions.completeOnboarding);
  const refreshSwipeQueue = useAppStore((state) => state.actions.refreshSwipeQueue);
  const nurseProfile = useAppStore((state) => state.nurseProfiles[0]);

  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const [state, setState] = useState<StepState>(INITIAL_STATE);
  useEffect(() => {
    (async () => {
      try {
        const loaded = await fetchNurseOnboarding();
        if (loaded) {
          const loadedState = loaded as Partial<StepState>;
          setState((prev) => ({ ...prev, ...loadedState }));
        }
      } catch (error) {
        console.warn("fetchNurseOnboarding failed", error);
      }
    })();
  }, []);

  const currentStep = steps[stepIndex];

  const next = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const back = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const finish = async () => {
    if (!nurseProfile) return;
    completeOnboarding({ nurseProfileId: nurseProfile.id, answers: state });

    try {
      await saveNurseOnboarding(state as any);
    } catch (error) {
      console.warn("saveNurseOnboarding failed", error);
    }

    refreshSwipeQueue();
    navigate('/swipe', { replace: true });
  };

  const footer = (
    <button
      type="button"
      onClick={stepIndex === steps.length - 1 ? finish : next}
      className="btn btn-primary w-full justify-center text-base"
    >
      {stepIndex === steps.length - 1 ? "Finish" : "Next"}
    </button>
  );

  const subtitle = useMemo(() => {
    switch (currentStep) {
      case "intro":
        return "We're here to build your nurse profile";
      case "profile":
        return "Tell us who we're matching";
      case "location":
        return "Keep commute simple";
      case "lease":
        return "Let's talk contract fit";
      case "budget":
        return "We'll balance stipend and rent";
      case "commute":
        return "Protect rest & recovery";
      case "pets":
        return "Furry family welcome";
      case "bedrooms":
        return "Space that feels good";
      case "amenities":
        return "Must-haves";
      case "priority":
        return "Ranking factors";
      case "urgency":
        return "Timeline";
      default:
        return "";
    }
  }, [currentStep]);

  const title = useMemo(() => {
    switch (currentStep) {
      case "profile":
        return "What’s your first and last name?";
      case "location":
        return "Where are you moving for this contract?";
      case "lease":
        return "Preferred lease length";
      case "budget":
        return "Weekly housing budget";
      case "commute":
        return "Commute guardrails";
      case "pets":
        return "Traveling with pets?";
      case "bedrooms":
        return "Bedrooms needed";
      case "amenities":
        return "Must-have amenities";
      case "priority":
        return "What matters most";
      case "urgency":
        return "Move urgency";
      default:
        return undefined;
    }
  }, [currentStep]);

  const stepContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <StepIntro
            headline="Hi, I’m your housing scout"
            description="I'm going to learn your guardrails so every match feels like a yes."
            primaryLabel="Get started"
            secondaryLabel="Sign in"
            onPrimary={next}
            onSecondary={() => navigate("/login")}
          />
        );
      case "profile":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Let's get started</p>
              <h2 className="text-xl font-semibold text-slate-900">What's your name?</h2>
            </div>
            <div className="grid gap-3">
              <input
                value={state.firstName}
                onChange={(event) => setState((prev) => ({ ...prev, firstName: event.target.value }))}
                className="form-input"
                placeholder="First name"
              />
              <input
                value={state.lastName}
                onChange={(event) => setState((prev) => ({ ...prev, lastName: event.target.value }))}
                className="form-input"
                placeholder="Last name"
              />
            </div>
          </div>
        );
      case "location":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Let’s keep you close</p>
              <h2 className="text-xl font-semibold text-slate-900">Where are you headed next?</h2>
            </div>
            <input
              value={state.city}
              onChange={(event) => setState((prev) => ({ ...prev, city: event.target.value }))}
              className="form-input"
              placeholder="City"
            />
            <input
              value={state.hospital}
              onChange={(event) => setState((prev) => ({ ...prev, hospital: event.target.value }))}
              className="form-input"
              placeholder="Primary facility or hospital"
            />
          </div>
        );
      case "lease":
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Contract fit</p>
              <h2 className="text-xl font-semibold text-slate-900">What lease length works best?</h2>
            </div>
            <PickerWheel
              options={leaseOptions}
              value={state.leaseLength}
              onChange={(value) => setState((prev) => ({ ...prev, leaseLength: value }))}
            />
          </div>
        );
      case "budget":
        return (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">Balance stipend + rent</p>
              <h2 className="text-xl font-semibold text-slate-900">What’s your weekly housing budget?</h2>
              <p className="text-3xl font-semibold text-sky-600">{formatCurrency(state.budget)}</p>
            </div>
            <input
              type="range"
              min={800}
              max={3500}
              step={50}
              value={state.budget}
              onChange={(event) => setState((prev) => ({ ...prev, budget: Number(event.target.value) }))}
              className="w-full"
            />
            <p className="text-xs text-center text-slate-500">Average stipend for telemetry night shift is $2,650/wk</p>
          </div>
        );
      case "commute":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Protect your rest</p>
              <h2 className="text-xl font-semibold text-slate-900">How far are you willing to commute?</h2>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 text-center text-slate-500">
              <p className="text-lg font-semibold text-sky-600">{state.commuteMinutes} minutes</p>
              <input
                type="range"
                min={10}
                max={45}
                value={state.commuteMinutes}
                onChange={(event) => setState((prev) => ({ ...prev, commuteMinutes: Number(event.target.value) }))}
                className="mt-4 w-full"
              />
            </div>
            <OptionsGroup
              options={commuteModes}
              value={state.commuteMode}
              onChange={(value) => setState((prev) => ({ ...prev, commuteMode: value }))}
              columns={2}
            />
          </div>
        );
      case "pets":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Furry teammates</p>
              <h2 className="text-xl font-semibold text-slate-900">Are you traveling with pets?</h2>
            </div>
            <OptionsGroup options={petOptions} value={state.pets} onChange={(value) => setState((prev) => ({ ...prev, pets: value }))} columns={2} />
          </div>
        );
      case "bedrooms":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Space needs</p>
              <h2 className="text-xl font-semibold text-slate-900">How many bedrooms do you need?</h2>
            </div>
            <OptionsGroup options={bedroomOptions} value={state.bedrooms} onChange={(value) => setState((prev) => ({ ...prev, bedrooms: value }))} />
          </div>
        );
      case "amenities":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Must-haves</p>
              <h2 className="text-xl font-semibold text-slate-900">Tap the amenities that matter</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {amenityOptions.map((option) => {
                const isSelected = state.amenities.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        amenities: prev.amenities.includes(option.value)
                          ? prev.amenities.filter((item) => item !== option.value)
                          : [...prev.amenities, option.value],
                      }))
                    }
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "priority":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Almost there</p>
              <h2 className="text-xl font-semibold text-slate-900">What matters most in your matches?</h2>
            </div>
            <OptionsGroup options={topPriorityOptions} value={state.priority} onChange={(value) => setState((prev) => ({ ...prev, priority: value }))} />
          </div>
        );
      case "urgency":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Timeline check</p>
              <h2 className="text-xl font-semibold text-slate-900">How urgent is your move?</h2>
            </div>
            <OptionsGroup options={urgencyOptions} value={state.urgency} onChange={(value) => setState((prev) => ({ ...prev, urgency: value }))} />
          </div>
        );
      default:
        return null;
    }
  };

  const animationKey = stepAnimations[currentStep] ?? "onboardingProgress";
  const animationLoop = currentStep !== "urgency";
  const progressLabel = stepIndex > 0 ? `${stepIndex}/${steps.length - 1}` : null;

  return (
    <div className="min-h-screen bg-white">
      <StepperShell
        title={title}
        subtitle={subtitle}
        step={stepIndex}
        totalSteps={steps.length}
        onBack={stepIndex > 0 ? back : undefined}
        footer={currentStep === "intro" ? undefined : footer}
        rightAction={progressLabel}
        animation={animationKey}
        animationLoop={animationLoop}
      >
        {stepContent()}
      </StepperShell>
    </div>
  );
}
