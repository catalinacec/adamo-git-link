"use client";

import {
  ResetPasswordInputs,
  resetPasswordSchema,
} from "@/schemas/resetPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";

interface EmailFormProps {
  onSubmit: (data: ResetPasswordInputs) => void;
  isSubmitting?: boolean;
}

export const EmailForm = ({ isSubmitting, onSubmit }: EmailFormProps) => {
  const t = useTranslations("ResetPage.emailStep");

  const form = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <>
      <h1 className="font-bold">{t("title")}</h1>
      <p className="mt-4">{t("description")}</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12">
          {/* Email Input */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant="dark"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    {...field}
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
            {t("nextButton")}
          </Button>
        </form>
      </Form>
    </>
  );
};
