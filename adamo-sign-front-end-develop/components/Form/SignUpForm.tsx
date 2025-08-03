"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { z } from "zod";

import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { InputPassword } from "@/components/ui/InputPassword";

const signUpSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  surname: z.string().min(1, "Apellido es requerido"),
  email: z.string().email("Email inválido").min(1, "Email es requerido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/\d/, "Debe contener al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type SignUpInputs = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSubmit: (data: SignUpInputs) => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const SignUpForm = ({ onSubmit, isLoading, errorMessage }: SignUpFormProps) => {
  const t = useTranslations("SignUpPageText");

  const form = useForm<SignUpInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: SignUpInputs) => {
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-[430px] text-center">
      <div className="flex justify-center">
        <AdamoLogo />
      </div>

      <h1 className="mt-16 text-base">{t("title") || "Crear cuenta"}</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-12 space-y-6"
        >
          {/* Name Input */}
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant="dark"
                    type="text"
                    placeholder={t("placeholders.name") || "Nombre"}
                    {...field}
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

          {/* Surname Input */}
          <FormField
            control={form.control}
            name="surname"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant="dark"
                    type="text"
                    placeholder={t("placeholders.surname") || "Apellido"}
                    {...field}
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

          {/* Email Input */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant="dark"
                    type="email"
                    placeholder={t("placeholders.email") || "Email"}
                    {...field}
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
                    placeholder={t("placeholders.password") || "Contraseña"}
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
                    placeholder={t("placeholders.confirmPassword") || "Confirmar contraseña"}
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

          {/* Already have account Link */}
          <p>
            <span className="text-white/80">{t("alreadyHaveAccount") || "¿Ya tienes cuenta?"} </span>
            <Link className="font-semibold text-white" href="/auth">
              {t("signInLink") || "Inicia sesión"}
            </Link>
          </p>

          {/* Submit Button */}
          <div className="!mt-20">
            <Button
              isLoading={isLoading}
              type="submit"
              variant="secondary"
              disabled={!form.formState.isValid || isLoading}
            >
              {t("buttons.signUp") || "Crear cuenta"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};