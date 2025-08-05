import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { useTranslations } from "@/hooks/useTranslations";

interface SignInInputs {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSubmit: (data: SignInInputs) => void;
  isLoading: boolean;
  errorMessage: string;
  disabled: boolean;
}

export function SignInForm({ onSubmit, isLoading, errorMessage, disabled }: SignInFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SignInInputs>();
  const [showPassword, setShowPassword] = React.useState(false);
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

        {/* Password Input */}
        <div className="relative">
          <Input
            {...register("password", { 
              required: t('passwordRequired') || 'Contraseña es requerida',
              minLength: {
                value: 6,
                message: t('passwordMinLength') || 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
            type={showPassword ? "text" : "password"}
            placeholder={t('passwordPlaceholder') || 'Contraseña'}
            className="w-full h-12 bg-white/95 border-0 rounded-lg text-adamo-sign-900 placeholder:text-neutral-500 text-base px-4 pr-12 focus:ring-2 focus:ring-white/50 focus:bg-white"
            disabled={disabled || isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          {errors.password && (
            <p className="text-white/90 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
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
          {isLoading ? (t('loading') || 'Iniciando...') : (t('signin') || 'Iniciar sesión')}
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