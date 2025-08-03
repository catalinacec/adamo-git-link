import Image from "next/image";
import { cn } from "@/lib/utils";

export const NumStepper = ({
  currentStep,
  steps,
  className,
}: {
  currentStep: number;
  steps: number[];
  className: string;
}) => {
  return (
    <div className={cn("flex items-center gap-x-6", className)}>
      {steps.map((step, index) => (
        <div
          key={step}
          className={cn(
            "flex items-center gap-2",
            index <= currentStep ? "text-neutral-600" : "text-neutral-400",
          )}
        >
          <div
            className={cn(
              "relative before:absolute before:-left-5 before:top-1/2 before:h-px before:w-4 before:-translate-y-1/2 before:bg-current before:content-['']",
              index === 0 && "before:content-none",
              index <= currentStep
                ? "before:bg-neutral-600"
                : "before:bg-neutral-400",
            )}
          >
            {index < currentStep - 1 && (
              <Image
                className="shrink-0"
                width={20}
                height={20}
                src="/stepCompletedIcon.svg"
                alt=""
              />
            )}

            {index === currentStep - 1 && (
              <Image
                className="shrink-0"
                width={20}
                height={20}
                src="/stepFocusIcon.svg"
                alt=""
              />
            )}

            {index > currentStep - 1 && (
              <Image
                className="shrink-0"
                width={20}
                height={20}
                src="/stepInActiveIcon.svg"
                alt=""
              />
            )}
          </div>

          <span className={cn("truncate text-sm")}>{step}</span>
        </div>
      ))}
    </div>
  );
};
