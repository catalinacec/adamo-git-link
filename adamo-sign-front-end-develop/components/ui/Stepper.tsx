import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { useSignatureData } from "@/context/SignatureContext";

interface StepperProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

export const Stepper = ({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
}: StepperProps) => {
  const t = useTranslations();
  const { setSignatures } = useSignatureData();
  
  const handleStepClick = (stepNumber: number) => {
    const isCompleted = completedSteps.includes(stepNumber);
    if (isCompleted || stepNumber <= currentStep) {
      onStepChange(stepNumber);

      if (stepNumber === 0 || stepNumber === 1) {
        setSignatures([]);
      }

    }

  };
  return (
    <Container>
      <div className="flex items-center gap-6 xs:gap-10">
        {steps.map((step, index) => {
          const stepNumber = index;
          const isCompleted = completedSteps.includes(stepNumber);

          return (
            <div
              key={step}
              onClick={() => handleStepClick(stepNumber)}
              className={cn(
                "flex items-center gap-2",
                isCompleted || index <= currentStep
                  ? "cursor-pointer text-neutral-600"
                  : "text-neutral-400",
              )}
            >
              <div
                className={cn(
                  "relative before:absolute before:-left-5 before:top-1/2 before:h-px before:w-4 before:-translate-y-1/2 before:bg-current before:content-[''] xs:before:-left-8 xs:before:w-6",
                  index === 0 && "before:content-none",
                )}
              >
                {index < currentStep && (
                  <Image
                    className="shrink-0"
                    width={20}
                    height={20}
                    src="/stepCompletedIcon.svg"
                    alt=""
                  />
                )}

                {index === currentStep && (
                  <Image
                    className="shrink-0"
                    width={20}
                    height={20}
                    src="/stepFocusIcon.svg"
                    alt=""
                  />
                )}

                {index > currentStep && (
                  <Image
                    className="shrink-0"
                    width={20}
                    height={20}
                    src="/stepInActiveIcon.svg"
                    alt=""
                  />
                )}
              </div>

              <span
                className={cn(
                  "truncate text-sm",
                  index === currentStep ? "inline" : "hidden md:inline",
                )}
              >
                {t(`steps.${step}`)}
              </span>
            </div>
          );
        })}
      </div>
    </Container>
  );
};
