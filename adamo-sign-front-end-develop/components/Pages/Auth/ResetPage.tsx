"use client";

import AuthUseCase from "@/api/useCases/AuthUseCase";
import { OTPInputs } from "@/schemas/otpSchema";
import { PasswordInputs } from "@/schemas/passwordSchema";
import { ResetPasswordInputs } from "@/schemas/resetPasswordSchema";
import { getUserLocale } from "@/services/locale";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { EmailForm } from "@/components/Form/ResetPassword/EmailForm";
import { OTPForm } from "@/components/Form/ResetPassword/OTPForm";
import { PasswordForm } from "@/components/Form/ResetPassword/PasswordForm";
import { AdamoPencilLogo } from "@/components/ui/AdamoLogo";
import { AppHeader } from "@/components/ui/AppHeader";

import { useToast } from "@/hooks/use-toast";

export const ResetPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [temporalPassword, setTemporalPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const maxInvalidAttempts = 3;
  const maxOtpAttempts = 5;
  const maxEmailSendAttempts = 6;
  const [invalidAttempts, setInvalidAttempts] = useState<
    Record<string, number>
  >({});
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [emailSendAttempts, setEmailSendAttempts] = useState<
    Record<string, number>
  >({});
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockExpiresAt, setBlockExpiresAt] = useState<number | null>(null);
  const [isEmailSendBlocked, setIsEmailSendBlocked] = useState(false);
  const [emailBlockExpiresAt, setEmailBlockExpiresAt] = useState<number | null>(
    null,
  );

  const { toast } = useToast();

  const t = useTranslations("ResetPage");
  const locale = getUserLocale();

  // Check if user is temporarily blocked
  const isUserBlocked = (email: string): boolean => {
    if (!blockExpiresAt) return false;
    const now = Date.now();
    if (now > blockExpiresAt) {
      setIsBlocked(false);
      setBlockExpiresAt(null);
      setInvalidAttempts((prev) => ({ ...prev, [email]: 0 }));
      return false;
    }
    return isBlocked;
  };

  // Check if email sending is temporarily blocked
  const isEmailSendingBlocked = (email: string): boolean => {
    if (!emailBlockExpiresAt) return false;
    const now = Date.now();
    if (now > emailBlockExpiresAt) {
      setIsEmailSendBlocked(false);
      setEmailBlockExpiresAt(null);
      setEmailSendAttempts((prev) => ({ ...prev, [email]: 0 }));
      return false;
    }
    return isEmailSendBlocked;
  };

  // Block user temporarily after max attempts
  const blockUser = (): void => {
    setIsBlocked(true);
    const blockTime = 15 * 60 * 1000; // 15 minutes
    setBlockExpiresAt(Date.now() + blockTime);
    toast({
      description: t("invalid.temporaryBlock"),
      variant: "error",
    });
  };

  // Block email sending temporarily after max attempts
  const blockEmailSending = (): void => {
    setIsEmailSendBlocked(true);
    const blockTime = 30 * 60 * 1000; // 30 minutes
    setEmailBlockExpiresAt(Date.now() + blockTime);
    toast({
      description: t("invalid.emailSendingBlocked"),
      variant: "error",
    });
  };

  const handleResendOTP = async (): Promise<boolean> => {
    // Check if email sending is blocked
    if (isEmailSendingBlocked(email)) {
      toast({
        description: t("invalid.emailSendingBlocked"),
        variant: "error",
      });
      return false;
    }

    const sendAttempts = emailSendAttempts[email] || 0;
    if (sendAttempts >= maxEmailSendAttempts) {
      blockEmailSending();
      return false;
    }

    try {
      // Increment send attempts even on success
      await AuthUseCase.resendOtp({ email }, await locale);

      const newSendCount = sendAttempts + 1;
      setEmailSendAttempts((prev) => ({ ...prev, [email]: newSendCount }));

      toast({
        description: t("success.emailSent"),
        variant: "sign",
      });

      // Check if we should block after this successful attempt
      if (newSendCount >= maxEmailSendAttempts) {
        blockEmailSending();
      }

      return true;
    } catch (error) {
      console.error("Error resending OTP:", error);

      // Increment email send attempts on any error
      const newSendCount = sendAttempts + 1;
      setEmailSendAttempts((prev) => ({ ...prev, [email]: newSendCount }));

      const resp = (error as any)?.response;
      const message = resp?.data?.message || "";

      toast({
        description: message || t("invalid.genericError"),
        variant: "error",
      });

      // Block email sending if max send attempts reached
      if (newSendCount >= maxEmailSendAttempts) {
        blockEmailSending();
      }

      return false;
    }
  };

  useEffect(() => {
    return () => {
      setTemporalPassword("");
      setEmail("");
    };
  }, []);

  const handleEmailSubmit = async (data: ResetPasswordInputs) => {
    // Check if user is temporarily blocked
    if (isUserBlocked(data.email)) {
      toast({
        description: t("invalid.temporaryBlock"),
        variant: "error",
      });
      return;
    }

    // Check if email sending is blocked
    if (isEmailSendingBlocked(data.email)) {
      toast({
        description: t("invalid.emailSendingBlocked"),
        variant: "error",
      });
      return;
    }

    const attempts = invalidAttempts[data.email] || 0;
    if (attempts >= maxInvalidAttempts) {
      blockUser();
      return;
    }

    const sendAttempts = emailSendAttempts[data.email] || 0;
    if (sendAttempts >= maxEmailSendAttempts) {
      blockEmailSending();
      return;
    }

    setIsLoading(true);
    try {
      await AuthUseCase.forgotPassword({ email: data.email }, await locale);

      // Increment send attempts even on success
      const newSendCount = sendAttempts + 1;
      setEmailSendAttempts((prev) => ({ ...prev, [data.email]: newSendCount }));

      // Reset invalid attempts on success
      setInvalidAttempts((prev) => ({ ...prev, [data.email]: 0 }));
      setEmail(data.email);
      setStep(2);
      toast({
        description: t("success.emailSent"),
        variant: "sign",
      });
    } catch (error) {
      console.error("Error sending reset email:", error);

      // Increment email send attempts on any error
      const newSendCount = sendAttempts + 1;
      setEmailSendAttempts((prev) => ({ ...prev, [data.email]: newSendCount }));

      const resp = (error as any)?.response;
      const status = resp?.status;
      const message = resp?.data?.message || "";
      const msgLower = message.toString().toLowerCase();

      // Handle different error types
      if (status === 400) {
        const newCount = attempts + 1;
        setInvalidAttempts((prev) => ({ ...prev, [data.email]: newCount }));

        if (
          msgLower.includes("not found") ||
          msgLower.includes("invalid email")
        ) {
          toast({
            description: t("invalid.emailNotFound"),
            variant: "error",
          });
        } else if (
          msgLower.includes("blocked") ||
          msgLower.includes("suspended")
        ) {
          toast({
            description: t("invalid.accountBlocked"),
            variant: "error",
          });
        } else {
          toast({
            description: t("invalid.email"),
            variant: "error",
          });
        }

        // Block user if max attempts reached
        if (newCount >= maxInvalidAttempts) {
          blockUser();
        }
      } else if (status === 429) {
        toast({
          description: t("invalid.tooManyRequests"),
          variant: "error",
        });
      } else if (status >= 500) {
        toast({
          description: t("invalid.serverError"),
          variant: "error",
        });
      } else if (!navigator.onLine) {
        toast({
          description: t("invalid.networkError"),
          variant: "error",
        });
      } else if (message === "User not found.") {
        toast({
          description: t("invalid.emailNotFound"),
          variant: "error",
        });
      } else {
        toast({
          description: message || t("invalid.genericError"),
          variant: "error",
        });
      }

      // Block email sending if max send attempts reached
      if (newSendCount >= maxEmailSendAttempts) {
        blockEmailSending();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (data: OTPInputs) => {
    // Check OTP attempts
    if (otpAttempts >= maxOtpAttempts) {
      toast({
        description: t("invalid.maxOtpAttempts"),
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthUseCase.verifyOTP(
        { email, otp: data.otp },
        await locale,
      );
      setTemporalPassword(response?.data?.temporaryPassword || "");
      // Reset OTP attempts on success
      setOtpAttempts(0);
      setStep(3);
      toast({
        description: t("success.otpVerified"),
        variant: "sign",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);

      const resp = (error as any)?.response;
      const status = resp?.status;
      const message = resp?.data?.message || "";
      const msgLower = message.toString().toLowerCase();

      // Increment OTP attempts
      setOtpAttempts((prev) => prev + 1);

      if (status === 400) {
        if (msgLower.includes("expired")) {
          toast({
            description: t("invalid.otpExpired"),
            variant: "error",
          });
        } else if (
          msgLower.includes("invalid") ||
          msgLower.includes("incorrect")
        ) {
          const remainingAttempts = maxOtpAttempts - otpAttempts - 1;
          toast({
            description: t("invalid.otpInvalid", {
              remaining: remainingAttempts,
            }),
            variant: "error",
          });
        } else {
          toast({
            description: t("invalid.code"),
            variant: "error",
          });
        }
      } else if (status === 429) {
        toast({
          description: t("invalid.tooManyRequests"),
          variant: "error",
        });
      } else if (status >= 500) {
        toast({
          description: t("invalid.serverError"),
          variant: "error",
        });
      } else if (!navigator.onLine) {
        toast({
          description: t("invalid.networkError"),
          variant: "error",
        });
      } else {
        toast({
          description: message || t("invalid.genericError"),
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordInputs) => {
    setIsLoading(true);
    try {
      await AuthUseCase.changePassword(
        {
          email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          temporaryPassword: temporalPassword,
        },
        await locale,
      );
      toast({
        description: t("success.passwordChanged"),
        variant: "sign",
      });

      // Clean up sensitive data
      setTemporalPassword("");
      setEmail("");

      // Redirect to login
      setTimeout(() => {
        router.push("/auth");
      }, 1500);
    } catch (error) {
      console.error("Error resetting password:", error);

      const resp = (error as any)?.response;
      const status = resp?.status;
      const message = resp?.data?.message || "";
      const msgLower = message.toString().toLowerCase();

      if (status === 400) {
        if (msgLower.includes("expired")) {
          toast({
            description: t("invalid.sessionExpired"),
            variant: "error",
          });
          // Return to step 1 if session expired
          setStep(1);
          setTemporalPassword("");
        } else if (msgLower.includes("weak") || msgLower.includes("password")) {
          toast({
            description: t("invalid.weakPassword"),
            variant: "error",
          });
        } else {
          toast({
            description: t("invalid.password"),
            variant: "error",
          });
        }
      } else if (status === 429) {
        toast({
          description: t("invalid.tooManyRequests"),
          variant: "error",
        });
      } else if (status >= 500) {
        toast({
          description: t("invalid.serverError"),
          variant: "error",
        });
      } else if (!navigator.onLine) {
        toast({
          description: t("invalid.networkError"),
          variant: "error",
        });
      } else {
        toast({
          description: message || t("invalid.genericError"),
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-x-0 top-0">
        <AppHeader
          href="/auth"
          heading={t("title")}
          transparent
          disableSidebarTrigger
        />
      </div>

      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <AdamoPencilLogo />

        <div className="mx-auto mt-16 w-full max-w-[430px] text-center">
          {/* Email Form */}
          {step === 1 && (
            <EmailForm onSubmit={handleEmailSubmit} isSubmitting={isLoading} />
          )}

          {/* OTP Form */}
          {step === 2 && (
            <OTPForm
              onSubmit={handleOTPSubmit}
              email={email}
              isSubmitting={isLoading}
              isResendBlocked={isEmailSendingBlocked(email)}
              blockExpiresAt={emailBlockExpiresAt}
              onResend={handleResendOTP}
              onResendBlocked={() => {
                toast({
                  description: t("invalid.emailSendingBlocked"),
                  variant: "error",
                });
              }}
            />
          )}

          {/* Password Form */}
          {step === 3 && (
            <PasswordForm
              onSubmit={handlePasswordSubmit}
              isSubmitting={isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
};
