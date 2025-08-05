import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface PasswordInputs {
  password: string;
  confirmPassword: string;
}

interface UpdatePasswordFormProps {
  onSubmit: (data: PasswordInputs) => void;
  isLoading: boolean;
  setIsPasswordUpdate: (value: boolean) => void;
  errorMessage: string;
}

export function UpdatePasswordForm({ onSubmit, isLoading, errorMessage }: UpdatePasswordFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PasswordInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations('auth');
  
  const password = watch("password");

  const validatePasswordMatch = (value: string) => {
    return value === password || (t('passwordsMustMatch') || 'Las contraseñas deben coincidir');
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <AdamoLogo width={200} height={120} className="brightness-0 invert" />
      </div>
      
      {/* Title */}
      <div className="text-center">
        <h2 className="text-white text-xl font-semibold mb-2">
          {t('updatePassword') || 'Actualizar Contraseña'}
        </h2>
        <p className="text-white/90 text-sm">
          {t('updatePasswordDescription') || 'Por favor, establece una nueva contraseña para continuar'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Input */}
        <div className="relative">
          <Input
            {...register("password", { 
              required: t('passwordRequired') || 'Contraseña es requerida',
              minLength: {
                value: 8,
                message: t('passwordMinLength') || 'La contraseña debe tener al menos 8 caracteres'
              }
            })}
            type={showPassword ? "text" : "password"}
            placeholder={t('newPassword') || 'Nueva contraseña'}
            className="w-full h-12 bg-white/95 border-0 rounded-lg text-adamo-sign-900 placeholder:text-neutral-500 text-base px-4 pr-12 focus:ring-2 focus:ring-white/50 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.password && (
            <p className="text-white/90 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="relative">
          <Input
            {...register("confirmPassword", { 
              required: t('confirmPasswordRequired') || 'Confirmar contraseña es requerido',
              validate: validatePasswordMatch
            })}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t('confirmPassword') || 'Confirmar contraseña'}
            className="w-full h-12 bg-white/95 border-0 rounded-lg text-adamo-sign-900 placeholder:text-neutral-500 text-base px-4 pr-12 focus:ring-2 focus:ring-white/50 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.confirmPassword && (
            <p className="text-white/90 text-sm mt-1">{errors.confirmPassword.message}</p>
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
          disabled={isLoading}
          className="w-full h-12 bg-white hover:bg-white/90 text-adamo-sign-700 font-semibold text-base rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (t('updating') || 'Actualizando...') : (t('updatePassword') || 'Actualizar Contraseña')}
        </Button>
      </form>
    </div>
  );
}