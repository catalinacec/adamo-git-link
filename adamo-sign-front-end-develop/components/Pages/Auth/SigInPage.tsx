"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthUseCase from "@/api/useCases/AuthUseCase";
import TermsUseCase from "@/api/useCases/TermsUseCase";
import { SignInInputs } from "@/schemas/signInSchema";
import { PasswordInputs } from "@/schemas/passwordSchema";
import { SignInForm } from "@/components/Form/SignInForm";
import { UpdatePasswordForm } from "@/components/Form/UpdatePasswordForm";
import Link from "next/link";
import { PrivacyModal } from "@/components/Modals/PrivacyModal";
import { TermsFullModal } from "@/components/Modals/TermsFullModal";
import { PrivacyFullModal } from "@/components/Modals/PrivacyFullModal";
import { LangToggle } from "@/components/ui/LangToggle";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const [tab, setTab] = useState<'sign-in'|'sign-in-password'>('sign-in');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [updatePasswordError, setUpdatePasswordError] = useState<string>("");
  const [loginDisabled, setLoginDisabled] = useState<boolean>(false);

  const { login, setAcceptedTerms, setUpdatedPassword } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('auth');

  const onSubmit = async (data: SignInInputs) => {
    try {
      setLoginError('');
      setIsLoadingLogin(true);
      const response = await AuthUseCase.login(data);
      const accessToken = response?.data?.token || '';
      const refreshToken = response?.data?.refreshToken || '';
      if (!accessToken || !refreshToken) {
        throw new Error("No se recibieron tokens desde el backend");
      }
      login(accessToken, refreshToken);
      if (response?.data?.user?.firstLogin) {
        setIsModalOpen(true);
      } else {
        setAcceptedTerms();
        setUpdatedPassword();
      }
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') setLoginError(t('serverError'));
      else if (error.response?.status === 401) setLoginError(t('invalidCredentials'));
      else if (error.response?.status === 429) {
        setLoginError(t('tooManyAttempts'));
        setLoginDisabled(true);
        const reset = error.response.headers['ratelimit-reset'];
        const waitMs = reset ? parseInt(reset,10)*1000 : 60000;
        setTimeout(() => setLoginDisabled(false), waitMs);
      } else setLoginError(t('internalServerError'));
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleConfirm = useCallback(async () => {
    try {
      setIsLoadingLogin(true);
      const res = await TermsUseCase.acceptTerm({ termId: '6814d54ed5fb985e2ff70d1c', accepted: isChecked });
      if (res) {
        setAcceptedTerms();
        setIsModalOpen(false);
        setTab('sign-in-password');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogin(false);
    }
  }, [setAcceptedTerms, isChecked]);

  const handleUpdateForm = async (data: PasswordInputs) => {
    try {
      setUpdatePasswordError('');
      setIsLoadingUpdate(true);
      await AuthUseCase.changePasswordAuth({ password: data.password, confirmPassword: data.confirmPassword });
      toast({ title: t('passwordUpdateSuccess') });
      setUpdatedPassword();  
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('passwordUpdateError');
      setUpdatePasswordError(errorMessage);
      toast({ description: errorMessage, variant: 'error' });
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {tab === 'sign-in' && (
        <SignInForm onSubmit={onSubmit} isLoading={isLoadingLogin} errorMessage={loginError} disabled={loginDisabled} />
      )}
      {tab === 'sign-in-password' && (
        <UpdatePasswordForm 
          onSubmit={handleUpdateForm} 
          isLoading={isLoadingUpdate} 
          setIsPasswordUpdate={() => {}} 
          errorMessage={updatePasswordError}
        />
      )}

      {tab === 'sign-in' && (
        <p className="mt-8 text-center">
          <span className="text-white/80">¿No tienes cuenta? </span>
          <Link className="font-semibold text-white" href="/register">
            Regístrate
          </Link>
        </p>
      )}

      <p className="mt-12 text-center"><LangToggle/></p>

      <PrivacyModal
        isOpen={isModalOpen}
        isChecked={isChecked}
        setIsChecked={setIsChecked}
        onClose={() => { setIsModalOpen(false); setIsChecked(false); }}
        onShowTerms={() => setIsTermsModalOpen(true)}
        onShowPrivacy={() => setIsPrivacyModalOpen(true)}
        onConfirm={handleConfirm}
      />

      <TermsFullModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => { setIsChecked(true); setIsTermsModalOpen(false); }}
      />

      <PrivacyFullModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAccept={() => { setIsChecked(true); setIsPrivacyModalOpen(false); }}
      />
    </div>
  );
}
