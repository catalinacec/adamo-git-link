import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { useTranslations } from "@/hooks/useTranslations";

interface SignInInputs {
  email: string;
}

interface SignInFormProps {
  onSubmit: (data: SignInInputs) => void;
  isLoading: boolean;
  errorMessage: string;
  disabled: boolean;
}

export function SignInForm({ onSubmit, isLoading, errorMessage, disabled }: SignInFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SignInInputs>();
  const t = useTranslations('auth');

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <AdamoLogo width={200} height={120} className="brightness-0 invert" />
      </div>
      
      {/* Subtitle */}
      <p className="text-white/90 text-lg text-center">
        {t('signinSubtitle') || 'Inicia sesión en tu cuenta'}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <div>
          <Input
            {...register("email", { 
              required: t('emailRequired') || 'Email es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('emailInvalid') || 'Email inválido'
              }
            })}
            type="email"
            placeholder={t('emailPlaceholder') || 'Correo electrónico'}
            className="w-full h-12 bg-white/95 border-0 rounded-lg text-adamo-sign-900 placeholder:text-neutral-500 text-base px-4 focus:ring-2 focus:ring-white/50 focus:bg-white"
            disabled={disabled || isLoading}
          />
          {errors.email && (
            <p className="text-white/90 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-white/90 text-sm text-center p-3 bg-red-500/20 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={disabled || isLoading}
          className="w-full h-12 bg-white hover:bg-white/90 text-adamo-sign-700 font-semibold text-base rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (t('loading') || 'Cargando...') : (t('continue') || 'Continuar')}
        </Button>
      </form>

      {/* Forgot Password Link */}
      <div className="text-center">
        <button
          type="button"
          className="text-white/90 hover:text-white text-sm underline"
        >
          {t('forgotPassword') || '¿Olvidaste tu contraseña? Haz click aquí'}
        </button>
      </div>
    </div>
  );
}