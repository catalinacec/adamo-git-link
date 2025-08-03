import { SignInInputs, getSignInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { InputPassword } from "@/components/ui/InputPassword";

interface SignInFormProps {
  onSubmit: (data: SignInInputs) => void;
  isLoading: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

export const SignInForm = ({ onSubmit, isLoading, errorMessage, disabled }: SignInFormProps) => {
  const t = useTranslations("SignInPageText");

  const form = useForm<SignInInputs>({
    resolver: zodResolver(getSignInSchema()),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: SignInInputs) => {
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
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-12 space-y-10"
        >
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
                    placeholder={t("placeholders.email")}
                    {...field}
                    className={`
                      border-2 
                      shadow 
                      shadow-black/30 
                      ${errorMessage ? "!border-red-600" : "border-gray-300"} 
                    `}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputPassword
                    variant="dark"
                    field={field}
                    placeholder={t("placeholders.password")}
                    className={`
                      border-2 
                      shadow 
                      shadow-black/30 
                      ${errorMessage ? "!border-red-600" : "border-gray-300"} 
                    `}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Error message under password */}
          {errorMessage && (
            <p className="!mt-1 text-left text-sm text-red-600 ">
              {errorMessage}
            </p>
          )}

          {/* Forgot Password Link */}
          <p>
            {t.rich("forgotPasswordText", {
              tag: (chunks) => (
                <Link className="font-semibold" href="/reset-password">
                  {chunks}
                </Link>
              ),
            })}
          </p>

          {/* Submit Button */}
          <div className="!mt-20">
            <Button
              isLoading={isLoading}
              type="submit"
              variant="secondary"
              disabled={!form.formState.isValid || isLoading || disabled}
            >
              {t("buttons.signIn")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
