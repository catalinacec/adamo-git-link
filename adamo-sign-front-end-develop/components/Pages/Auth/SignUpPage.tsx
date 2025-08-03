"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpForm, SignUpInputs } from "@/components/Form/SignUpForm";
import { LangToggle } from "@/components/ui/LangToggle";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('auth');

  const onSubmit = async (data: SignUpInputs) => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      
      // TODO: Integrar con AuthUseCase.register
      console.log('Register data:', data);
      
      // Simular registro exitoso
      toast({ 
        title: t('registrationSuccess') || 'Registro exitoso',
        description: t('checkEmail') || 'Revisa tu email para verificar tu cuenta'
      });
      
      // Redirigir a verificación con el email
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        setErrorMessage(t('serverError') || 'Error de conexión');
      } else if (error.response?.status === 409) {
        setErrorMessage(t('emailAlreadyExists') || 'El email ya está registrado');
      } else {
        setErrorMessage(t('registrationError') || 'Error al registrar usuario');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <SignUpForm 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
        errorMessage={errorMessage}
      />

      <p className="mt-12 text-center">
        <LangToggle/>
      </p>
    </div>
  );
}