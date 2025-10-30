import { ArrowLeft } from "lucide-react";
import StepperDots from "../ui/StepperDots";
import LottieAnimation from "../ui/LottieAnimation";
import type { LottieKey } from "../../config/lottie";

interface StepperShellProps {
  title?: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  animation?: LottieKey;
  animationLoop?: boolean;
}

export default function StepperShell({
  title,
  subtitle,
  step,
  totalSteps,
  onBack,
  rightAction,
  children,
  footer,
  animation = "onboardingProgress",
  animationLoop = true,
}: StepperShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col px-4 pb-12 pt-6 text-slate-900">
      <header className="mb-10 flex items-center justify-between text-sm text-slate-500">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 disabled:cursor-default disabled:opacity-40"
          disabled={!onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <StepperDots total={totalSteps} current={step} />
        <div className="w-16 text-right text-sm font-medium text-sky-600">{rightAction}</div>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-32 w-32">
            <LottieAnimation animation={animation} loop={animationLoop} />
          </div>
          {subtitle && <p className="text-xs uppercase tracking-wide text-slate-500">{subtitle}</p>}
          {title && <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>}
        </div>

        <div className="flex-1">{children}</div>
      </main>

      {footer && <div className="mt-10">{footer}</div>}
    </div>
  );
}
