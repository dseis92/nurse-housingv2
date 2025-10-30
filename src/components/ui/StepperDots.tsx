import clsx from "clsx";

interface StepperDotsProps {
  total: number;
  current: number;
}

export default function StepperDots({ total, current }: StepperDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={clsx(
            "h-2.5 w-2.5 rounded-full transition",
            index === current ? "bg-sky-600" : "bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}
