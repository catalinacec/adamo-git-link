"use client";

import AuthUseCase from "@/api/useCases/AuthUseCase";
import { OTPInputs, getOtpSchema } from "@/schemas/otpSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/Input-otp";

import { useCountdown } from "@/hooks/useCountdown";
import { getUserLocale } from "@/services/locale";

interface OTPFormProps {
  onSubmit: (data: OTPInputs) => void;
  isSubmitting?: boolean;
  email: string;
  isResendBlocked?: boolean;
  blockExpiresAt?: number | null;
  onResend?: () => Promise<boolean>;
  onResendBlocked?: () => void;
}

export const OTPForm = ({ 
  onSubmit, 
  email, 
  isSubmitting, 
  isResendBlocked = false,
  blockExpiresAt,
  onResend,
  onResendBlocked 
}: OTPFormProps) => {
  const t = useTranslations("ResetPage.otpStep");

  const { formattedTime, isExpired, setTimer } = useCountdown(30);

  const [blockTimeLeft, setBlockTimeLeft] = useState("");

    const locale = getUserLocale();

  // Update block time every second
  useEffect(() => {
    if (!isResendBlocked || !blockExpiresAt) {
      setBlockTimeLeft("");
      return;
    }
    
    const updateBlockTime = () => {
      const now = Date.now();
      const timeLeft = blockExpiresAt - now;
      
      if (timeLeft <= 0) {
        setBlockTimeLeft("");
        return;
      }
      
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      if (minutes > 0) {
        setBlockTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setBlockTimeLeft(`${seconds}`);
      }
    };
    
    updateBlockTime(); // Initial update
    const interval = setInterval(updateBlockTime, 1000);
    
    return () => clearInterval(interval);
  }, [isResendBlocked, blockExpiresAt]);

  const form = useForm<OTPInputs>({
    resolver: zodResolver(getOtpSchema(t)),
    defaultValues: {
      otp: "",
    },
    mode: "onChange", // Validar en cada cambio para habilitar/deshabilitar el botón
  });

  const handleResend = async () => {
    if (isResendBlocked) {
      onResendBlocked?.();
      return;
    }

    if (onResend) {
      // Use the custom resend function from parent
      const success = await onResend();
      if (success) {
        form.reset();
        setTimer(30); // Reset timer to 30 seconds
        form.clearErrors("otp");
      }
    } else {
      // Fallback to original logic (shouldn't happen)
      try {
        await AuthUseCase.resendOtp({ email }, await locale);
        form.reset();
        setTimer(30);
        form.clearErrors("otp");
      } catch (error) {
        console.error("Error resending OTP:", error);
        form.setError("otp", {
          message:
            (error as any)?.response?.data?.message || "Failed to resend OTP",
        });
      }
    }
  };

  return (
    <>
      <p>
        {t("description")} <br />
        {email}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12">
          {/* OTP Input */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    onChange={(value) => {
                      // Convert to uppercase
                      const upperValue = value.toUpperCase();
                      field.onChange(upperValue);
                    }}
                    variant="dark"
                    isError={!!form.formState.errors.otp}
                    helperText={form.formState.errors.otp?.message}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        isError={!!form.formState.errors.otp}
                        index={0}
                      />
                      <InputOTPSlot
                        isError={!!form.formState.errors.otp}
                        index={1}
                      />
                      <InputOTPSlot
                        isError={!!form.formState.errors.otp}
                        index={2}
                      />
                      <InputOTPSlot
                        isError={!!form.formState.errors.otp}
                        index={3}
                      />
                      <InputOTPSlot
                        isError={!!form.formState.errors.otp}
                        index={4}
                      />
                      <InputOTPSlot
                        isError={!!form.formState.errors.otp}
                        index={5}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="mt-12">
            <p>
              {t("resendText")}{" "}
              {isResendBlocked ? (
                blockTimeLeft ? (
                  <span>
                    <strong>
                      {t("resendBlockedTimer", { timer: blockTimeLeft })}
                    </strong>
                  </span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={isResendBlocked}
                    className={isResendBlocked ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <strong>{t("resendButton")}</strong>
                  </button>
                )
              ) : isExpired ? (
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={isResendBlocked}
                  className={isResendBlocked ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <strong>{t("resendButton")}</strong>
                </button>
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: t.markup("resendTextTimer", {
                      tag: (chunks) => `<strong>${chunks}</strong>`,
                      timer: !isExpired ? formattedTime : "",
                    }),
                  }}
                />
              )}
            </p>
          </div>

          <Button
            className="mt-20"
            type="submit"
            variant="secondary"
            disabled={!form.formState.isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            {t("nextButton")}
          </Button>
        </form>
      </Form>
    </>
  );
};
