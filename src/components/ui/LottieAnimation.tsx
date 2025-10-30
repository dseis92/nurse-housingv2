import { lazy, Suspense } from "react";
import clsx from "clsx";
import { getLottieSource, type LottieKey } from "../../config/lottie";

const LottiePlayer = lazy(() =>
  import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player }))
);

interface LottieAnimationProps {
  animation: LottieKey;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  preferCdn?: boolean;
}

/**
 * Thin wrapper around the Lottie player that resolves the correct asset URL (CDN or local fallback).
 */
export default function LottieAnimation({
  animation,
  className,
  loop = true,
  autoplay = true,
  preferCdn = true,
}: LottieAnimationProps) {
  return (
    <Suspense
      fallback={<div className={clsx("h-full w-full rounded-2xl bg-[var(--nh-surface-muted)]", className)} />}
    >
      <LottiePlayer
        autoplay={autoplay}
        loop={loop}
        src={getLottieSource(animation, preferCdn)}
        className={clsx("h-full w-full", className)}
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </Suspense>
  );
}
