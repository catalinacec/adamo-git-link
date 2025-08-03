"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { InputPassword } from "@/components/ui/InputPassword";
import { AdamoLogo } from "@/components/ui/AdamoLogo";

import { getPasswordSchema, PasswordInputs } from "@/schemas/passwordSchema";

interface UpdatePasswordFormProps {
  onSubmit: (data: PasswordInputs) => void;
  setIsPasswordUpdate: (update: boolean) => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const UpdatePasswordForm = ({
  onSubmit,
  isLoading,
  setIsPasswordUpdate,
  errorMessage
}: UpdatePasswordFormProps) => {
  // Traducciones
  const t = useTranslations("UpdatePasswordForm");

  // Creamos el schema pasando t directamente
  const schema = getPasswordSchema(t);

  const form = useForm<PasswordInputs>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const handleFormSubmit = (data: PasswordInputs) => {
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-[430px] text-center">
      <div className="flex justify-center">
        <AdamoLogo />
      </div>
      
      <h1 className="mt-16 text-base">{t("title")}</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="mt-12 space-y-10"
        >
          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <InputPassword
                    variant="dark"
                    field={field}
                    placeholder={t("passwordPlaceholder")}
                    className={`
                      border-2 
                      shadow 
                      shadow-black/30 
                      ${fieldState.error ? "!border-red-600" : "border-gray-300"} 
                    `}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="!mt-1 text-left text-sm text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
                {!fieldState.error && !field.value && (
                  <p className="!mt-1 text-left text-sm text-white/60">
                    {t("passwordHelperText")}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Confirm Password Input */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <InputPassword
                    variant="dark"
                    field={field}
                    placeholder={t("confirmPasswordPlaceholder")}
                    className={`
                      border-2 
                      shadow 
                      shadow-black/30 
                      ${fieldState.error ? "!border-red-600" : "border-gray-300"} 
                    `}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="!mt-1 text-left text-sm text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Error message from API */}
          {errorMessage && (
            <p className="!mt-1 text-left text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <Button
            className="!mt-20"
            type="submit"
            variant="secondary"
            isLoading={isLoading}
            disabled={isLoading || !form.formState.isValid}
            onClick={() => setIsPasswordUpdate(true)}
          >
            {t("submitButton")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
