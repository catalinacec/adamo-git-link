"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VerificationForm, VerificationInputs } from "@/components/Form/VerificationForm";
import { LangToggle } from "@/components/ui/LangToggle";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const t = useTranslations('auth');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Si no hay email, redirigir al login
      router.push('/auth');
    }
  }, [searchParams, router]);

  const onSubmit = async (data: VerificationInputs) => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      
      // TODO: Integrar con AuthUseCase.verifyEmail
      console.log('Verification data:', { email, code: data.code });
      
      // Simular verificación exitosa
      toast({ 
        title: t('verificationSuccess') || 'Verificación exitosa',
        description: t('accountActivated') || 'Tu cuenta ha sido activada'
      });
      
      // Redirigir al login
      router.push('/auth');
      
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        setErrorMessage(t('serverError') || 'Error de conexión');
      } else if (error.response?.status === 400) {
        setErrorMessage(t('invalidCode') || 'Código inválido');
      } else if (error.response?.status === 410) {
        setErrorMessage(t('expiredCode') || 'Código expirado');
      } else {
        setErrorMessage(t('verificationError') || 'Error al verificar código');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    try {
      setIsResending(true);
      
      // TODO: Integrar con AuthUseCase.resendVerification
      console.log('Resending verification to:', email);
      
      toast({ 
        title: t('codeResent') || 'Código reenviado',
        description: t('checkEmailAgain') || 'Revisa tu email nuevamente'
      });
      
    } catch (error: any) {
      toast({ 
        title: t('resendError') || 'Error al reenviar',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Evitar render hasta que tengamos el email
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <VerificationForm 
        onSubmit={onSubmit} 
        onResend={onResend}
        isLoading={isLoading}
        isResending={isResending}
        errorMessage={errorMessage}
        email={email}
      />

      <p className="mt-12 text-center">
        <LangToggle/>
      </p>
    </div>
  );
}