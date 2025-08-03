"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Input } from "../ui/Input";
import { CopyIcon } from "../icon";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/Input-otp";
import { NumStepper } from "../ui/NumberStepper";
import { Alert } from "../ui/Alert";
import ProfileUseCase from "@/api/useCases/ProfileUseCase";

interface Activate2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

type Step = 1 | 2 | 3 | 4;
const STEPS: Step[] = [1, 2, 3];

export const Activate2FAModal = ({
  isOpen,
  onClose,
  onAccept,
}: Activate2FAModalProps) => {
  const t = useTranslations("Activate2FAModal");
  const tg = useTranslations("Global");
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSecret("");
      setQrCodeUrl("");
      setOtp("");
      setError("");
    }
  }, [isOpen]);

  const handleGenerateSecret = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await ProfileUseCase.TwofaEnable();
      if (response.data) {
        setSecret(response.data.secret);
        setQrCodeUrl(response.data.qrCodeURI);
        setCurrentStep(2); 
      }
    } catch {
      setError(t("errorGeneratingQR"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (otp.length !== 6) {
      setError(t("errorOTPLength"));
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await ProfileUseCase.TwofaVerify({ token: otp });
      if (response) {
        setCurrentStep(4);
      }
    } catch  {
      setError(t("errorInvalidOTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      await handleGenerateSecret();
    } 
    else if (currentStep === 3) {
      await handleEnable2FA();
    }
    else {
      setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
    }
  };

  const renderDescription = () => {
    switch (currentStep) {
      case 1:
        return t.rich("description", {
          link: (chunks) => (
            <Link href="/" className="text-adamo-sign-500">
              {chunks}
            </Link>
          ),
        });
      case 2:
        return t("descriptionQr");
      case 3:
        return t("descriptionOTP");
      case 4:
        return t("descriptionSuccess");
    }
  };

  const renderBodyContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <>
            {isLoading ? (
              <div className="flex justify-center py-3">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-adamo-sign-500"></div>
              </div>
            ) : qrCodeUrl ? (
              <>
                <div className="flex justify-center py-3">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code for Authentication"
                    width={160}
                    height={160}
                  />
                </div>
                <Input
                  readOnly
                  onClick={() => {
                        navigator.clipboard.writeText(secret);
                      
                      }} 
                  iconRight={
                    <CopyIcon 
                      className="cursor-pointer" 
                    />
                  }
                  value={secret}
                  className="mt-4"
                />
              </>
            ) : (
              <div className="text-center py-6">
                {error && <Alert>{error}</Alert>}
              </div>
            )}
          </>
        );
      case 3:
        return (
          <>
            <InputOTP 
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
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
        );
      case 4:
        return (
          <div className="flex justify-center p-9">
            <Image
              src="/filledIcons/check_circle.svg"
              alt="Success Check Mark"
              width={48}
              height={48}
            />
          </div>
        );
      default:
        return null; 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {currentStep < 4 && (
          <NumStepper
            className="mb-14"
            steps={STEPS}
            currentStep={currentStep}
          />
        )}

        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {currentStep === 4 ? t("titleSuccess") : t("title")}
          </DialogTitle>
          <DialogDescription>{renderDescription()}</DialogDescription>
        </DialogHeader>

        {currentStep > 1 && <DialogBody>{renderBodyContent()}</DialogBody>}

        <DialogFooter>
          {currentStep < 4 && (
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              {tg("cancel")}
            </Button>
          )}
          {currentStep < 4 && (
            <Button onClick={handleNextStep} disabled={isLoading}>
              {tg("continue")}
            </Button>
          )}
          {currentStep === 4 && (
            <Button variant="secondary" onClick={onAccept}>
              {tg("acceptEnter")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};