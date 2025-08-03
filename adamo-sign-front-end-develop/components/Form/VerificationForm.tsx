"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const verificationSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

export type VerificationInputs = z.infer<typeof verificationSchema>;

interface VerificationFormProps {
  onSubmit: (data: VerificationInputs) => void;
  onResend: () => void;
  isLoading: boolean;
  isResending: boolean;
  errorMessage?: string;
  email: string;
}

export const VerificationForm = ({ 
  onSubmit, 
  onResend, 
  isLoading, 
  isResending, 
  errorMessage, 
  email 
}: VerificationFormProps) => {
  const t = useTranslations("VerificationPageText");

  const form = useForm<VerificationInputs>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (data: VerificationInputs) => {
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-[430px] text-center">
      <div className="flex justify-center">
        <AdamoLogo />
      </div>

      <h1 className="mt-16 text-base">{t("title") || "Verificar email"}</h1>
      
      <p className="mt-4 text-sm text-white/80">
        {t("description") || "Ingresa el código de 6 dígitos que enviamos a"}<br />
        <span className="font-semibold">{email}</span>
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-12 space-y-10"
        >
          {/* OTP Input */}
          <FormField
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      className="gap-2"
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot 
                          index={0} 
                          className={`
                            w-12 h-12 border-2 shadow shadow-black/30 bg-white text-black
                            ${fieldState.error ? "!border-red-600" : "border-gray-300"}
                          `}
                        />
                        <InputOTPSlot 
                          index={1} 
                          className={`
                            w-12 h-12 border-2 shadow shadow-black/30 bg-white text-black
                            ${fieldState.error ? "!border-red-600" : "border-gray-300"}
                          `}
                        />
                        <InputOTPSlot 
                          index={2} 
                          className={`
                            w-12 h-12 border-2 shadow shadow-black/30 bg-white text-black
                            ${fieldState.error ? "!border-red-600" : "border-gray-300"}
                          `}
                        />
                        <InputOTPSlot 
                          index={3} 
                          className={`
                            w-12 h-12 border-2 shadow shadow-black/30 bg-white text-black
                            ${fieldState.error ? "!border-red-600" : "border-gray-300"}
                          `}
                        />
                        <InputOTPSlot 
                          index={4} 
                          className={`
                            w-12 h-12 border-2 shadow shadow-black/30 bg-white text-black
                            ${fieldState.error ? "!border-red-600" : "border-gray-300"}
                          `}
                        />
                        <InputOTPSlot 
                          index={5} 
                          className={`
                            w-12 h-12 border-2 shadow shadow-black/30 bg-white text-black
                            ${fieldState.error ? "!border-red-600" : "border-gray-300"}
                          `}
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                {fieldState.error && (
                  <p className="!mt-1 text-center text-sm text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Error message from API */}
          {errorMessage && (
            <p className="!mt-1 text-center text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {/* Resend code */}
          <p className="text-center">
            <span className="text-white/80">{t("didntReceive") || "¿No recibiste el código?"} </span>
            <button
              type="button"
              className="font-semibold text-white underline disabled:opacity-50"
              onClick={onResend}
              disabled={isResending}
            >
              {isResending ? (t("resending") || "Reenviando...") : (t("resend") || "Reenviar")}
            </button>
          </p>

          {/* Submit Button */}
          <div className="!mt-20">
            <Button
              isLoading={isLoading}
              type="submit"
              variant="secondary"
              disabled={!form.formState.isValid || isLoading || field.value.length !== 6}
            >
              {t("buttons.verify") || "Verificar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};