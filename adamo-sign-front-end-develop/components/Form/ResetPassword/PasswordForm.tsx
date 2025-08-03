"use client";

import { PasswordInputs, getPasswordSchema } from "@/schemas/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { InputPassword } from "@/components/ui/InputPassword";

interface PasswordFormProps {
  onSubmit: (data: PasswordInputs) => void;
  isSubmitting?: boolean;
}

export const PasswordForm = ({ onSubmit, isSubmitting }: PasswordFormProps) => {
  const t = useTranslations("ResetPage.passwordStep");

  const form = useForm<PasswordInputs>({
    resolver: zodResolver(getPasswordSchema(t)),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = (data: PasswordInputs) => {
    form.reset();
    onSubmit(data);
  };

  return (
    <>
      <p>{t("description")}</p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="mt-12 space-y-10"
        >
          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              const errorMessage = form.formState.errors.password?.type
                ? t("validation." + form.formState.errors.password?.type)
                : undefined;

              return (
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
                      ${errorMessage ? "!border-red-600" : "border-gray-300"} 
                    `}
                    />
                  </FormControl>
                  {errorMessage && (
                    <p className="!mt-1 text-left text-sm text-red-600">
                      {errorMessage}
                    </p>
                  )}
                  {!errorMessage && !field.value && (
                    <p className="!mt-1 text-left text-sm text-white/50">
                      {t("passwordHelperText")}
                    </p>
                  )}
                </FormItem>
              );
            }}
          />
          {/* Confirm Password Input */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputPassword
                    isError={
                      form.formState.errors.confirmPassword !== undefined
                    }
                    variant="dark"
                    field={field}
                    placeholder={t("confirmPasswordPlaceholder")}
                    helperText={
                      form.formState.errors.confirmPassword?.type &&
                      t(
                        "validation." +
                          form.formState.errors.confirmPassword?.type,
                      )
                    }
                    className={`
                      border-2 
                      shadow 
                      shadow-black/30 
                      ${form.formState.errors.confirmPassword?.type ? "!border-red-600" : "border-gray-300"}
                    `}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            className="mt-20"
            type="submit"
            variant="secondary"
            disabled={!form.formState.isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            {t("submitButton")}
          </Button>
        </form>
      </Form>
    </>
  );
};
