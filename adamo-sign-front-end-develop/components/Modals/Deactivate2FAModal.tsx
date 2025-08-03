"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Button } from "@/components/ui/Button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/Input-otp";
import { Alert } from "../ui/Alert";
import ProfileUseCase from "@/api/useCases/ProfileUseCase";

interface Deactivate2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

type Step = 1 | 2 | 3;

export const Deactivate2FAModal = ({
  isOpen,
  onClose,
  onAccept,
}: Deactivate2FAModalProps) => {
  const t = useTranslations("Deactivate2FAModal");
  const tg = useTranslations("Global");

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setOtpCode("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const isOnFirstStep = currentStep === 1;
  const isOnSecondStep = currentStep === 2;
  const isOnThirdStep = currentStep === 3;

  const handleEnable2FA = async () => {
    if (otpCode.length !== 6) {
      setError(t("errorOTPLength"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await ProfileUseCase.TwofaVerify({ token: otpCode });
      if (response) {
        setCurrentStep(3);
      }
    } catch {
      setError(t("errorInvalidOTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await handleEnable2FA();
    } else if (currentStep === 3) {
      onAccept();
    }
    
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {isOnThirdStep ? t("titleSuccess") : t("title")}
          </DialogTitle>
          <DialogDescription>
            {isOnFirstStep && t("description")}
            {isOnSecondStep && t("descriptionOTP")}
            {isOnThirdStep && t("descriptionSuccess")}
          </DialogDescription>
        </DialogHeader>

        {currentStep > 1 && (
          <DialogBody>
            {isOnSecondStep && (
              <>
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    {[...Array(6)].map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                {error && (
                  <Alert variant="danger" className="mt-4">
                    {error}
                  </Alert>
                )}
              </>
            )}

            {isOnThirdStep && (
              <>
                <div className="p-9">
                  <Image
                    src="/filledIcons/warning.svg"
                    alt="Warning Icon"
                    width={48}
                    height={48}
                  />
                </div>
                <Alert>{t("alert")}</Alert>
              </>
            )}
          </DialogBody>
        )}

        <DialogFooter>
          {(isOnFirstStep || isOnSecondStep) && (
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              {tg("cancel")}
            </Button>
          )}

          {isOnFirstStep && (
            <Button
              variant="secondaryError"
              onClick={handleNextStep}
              disabled={isLoading}
            >
              {tg("continue")}
            </Button>
          )}

          {isOnSecondStep && (
            <Button
              variant="secondary"
              onClick={handleNextStep}
              disabled={isLoading || otpCode.length < 6}
            >
              {t("deactivateButton2FA")}
            </Button>
          )}

          {isOnThirdStep && (
            <Button variant="secondary" onClick={onAccept}>
              {tg("acceptEnter")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
