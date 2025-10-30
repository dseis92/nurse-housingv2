import { Player } from "@lottiefiles/react-lottie-player";
import clsx from "clsx";
import { getLottieSource, type LottieKey } from "../../config/lottie";

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
    <Player
      autoplay={autoplay}
      loop={loop}
      src={getLottieSource(animation, preferCdn)}
      className={clsx("h-full w-full", className)}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}

