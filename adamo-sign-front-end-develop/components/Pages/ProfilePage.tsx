"use client";

import * as React from "react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";

import { useProfile } from "@/context/ProfileContext";
import { Card } from "../Card";
import { ProfileModal } from "../Modals/ProfileModal";
import { LangIcon, ReceiptIcon, VerifiedIcon } from "../icon";
import { AppHeader } from "../ui/AppHeader";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { useToast } from "@/hooks/use-toast";
import ProfileUseCase from "@/api/useCases/ProfileUseCase";
import { Toaster } from "../ui/toaster";

const ChatButton = dynamic(() => import("../ui/ChatButton"));
const LangModal = dynamic(() =>
  import("../Modals/LangModal").then((mod) => mod.LangModal),
);
const PasswordModal = dynamic(() =>
  import("../Modals/PasswordModal").then((mod) => mod.PasswordModal),
);
const Activate2FAModal = dynamic(() =>
  import("../Modals/Activate2FAModal").then((mod) => mod.Activate2FAModal),
);
const Deactivate2FAModal = dynamic(() =>
  import("../Modals/Deactivate2FAModal").then((mod) => mod.Deactivate2FAModal),
);

export const ProfilePage = () => {
  // Toaster
  const { toast } = useToast();

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isActivate2FAModalOpen, setIsActivate2FAModalOpen] = useState(false);
  const [isDeactivate2FAModalOpen, setIsDeactivate2FAModalOpen] = useState(false);


  // Translations & locale
  const t = useTranslations("ProfilePage");
  const tDisable = useTranslations("Deactivate2FAModal");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();

  // Profile context
  const {
    profileImage,
    name,
    lastName,
    email,
    twoFactorAuthEnabled,
    refreshProfile,
    updateProfile,
    setTwoFactorAuthEnabled,
  } = useProfile();

  const handleDisable2FA = async () => {
    toast({
      title: t("loading", { defaultMessage: "Desactivando 2FA…" }),
    });
    try {
      await ProfileUseCase.TwofaDisable();
      setTwoFactorAuthEnabled(false);
      toast({
        title: t("success", { defaultMessage: "2FA desactivado" }),
      });
    } catch {
      toast({
        title: tDisable("error", { defaultMessage: "Error al desactivar 2FA" }),
      });
    }
  }


  const handleUpdate = async (payload: {
    name: string;
    surname: string;
    language: string;
    profileImage?: File;
  }) => {
    setIsProfileModalOpen(false);

    toast({
      title: t("loading", { defaultMessage: "Actualizando perfil…" }),
    });

    try {
      await updateProfile(payload);
      await refreshProfile();

      toast({
        title: t("success", { defaultMessage: "Perfil actualizado" }),
      });
    } catch {
      toast({
        title: t("error", { defaultMessage: "Error al actualizar" }),
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <AppHeader heading={t("title")} />

        <Container className="space-y-4">
          <Card className="shadow">
            <div className="flex flex-col items-start gap-x-6 gap-y-10 md:flex-row md:items-center">
              <div className="flex w-full flex-col items-start gap-x-10 gap-y-8 md:flex-row md:items-center">
                <div className="relative h-[120px] w-[120px] overflow-hidden rounded-2xl">
                  <Image
                    unoptimized
                    src={profileImage || "/default-user.png"}
                    fill
                    className="object-cover"
                    alt={t("profileImageAlt", { defaultMessage: "Foto de perfil" })}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-neutral-700">
                    {name} {lastName}
                  </h3>
                  <p className="text-neutral-700">{email}</p>
                </div>
              </div>

              <Button onClick={() => setIsProfileModalOpen(true)}>
                {t("updateButton")}
              </Button>
            </div>
          </Card>

          <Card className="grid grid-cols-1 gap-6 !p-6 md:grid-cols-2">
            {/* Security Card */}
            <div className="flex flex-col items-start rounded-2xl border border-neutral-200 bg-white px-8 py-10">
              <div className="inline-block rounded-full bg-adamo-sign-50 p-4 text-adamo-sign-700">
                <VerifiedIcon />
              </div>
              <h4 className="mt-4 text-lg font-bold text-adamo-sign-700">
                {t("card.security.title")}
              </h4>
              <p className="mt-4 text-neutral-700">
                {t("card.security.description")}
              </p>
              <div className="mt-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center">
                <Button
                  variant="secondary"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  {t("card.security.buttonPassword")}
                </Button>

                {/* Aquí es donde usamos directamente twoFactorAuthEnabled para decidir qué botón mostrar */}
                {twoFactorAuthEnabled ? (
                  <Button
                    variant="secondaryError"
                    onClick={() => setIsDeactivate2FAModalOpen(true)}
                  >
                    {t("card.security.deactivateButton2FA")}
                  </Button>
                ) : (
                  <Button onClick={() => setIsActivate2FAModalOpen(true)}>
                    {t("card.security.button2FA")}
                  </Button>
                )}
              </div>
            </div>

            {/* Plans Card */}
            <div className="flex flex-col items-start rounded-2xl border border-neutral-200 bg-white px-8 py-10">
              <div className="inline-block rounded-full bg-adamo-sign-50 p-4 text-adamo-sign-700">
                <ReceiptIcon />
              </div>
              <h4 className="mt-4 text-lg font-bold text-adamo-sign-700">
                {t("card.plans.title")}
              </h4>
              <p className="mt-4 flex-1 text-neutral-700">
                {t("card.plans.description")}
              </p>
              <div className="mt-10">
                <Button variant="secondary">{t("card.plans.button")}</Button>
              </div>
            </div>

            {/* Language Card */}
            <div className="flex flex-col items-start rounded-2xl border border-neutral-200 bg-white px-8 py-10">
              <div className="inline-block rounded-full bg-adamo-sign-50 p-4 text-adamo-sign-700">
                <LangIcon />
              </div>
              <h4 className="mt-4 text-lg font-bold text-adamo-sign-700">
                {t("card.lang.title")}
              </h4>
              <p className="mt-4 text-neutral-700">
                {t("card.lang.description")} {tGlobal(locale)}
              </p>
              <div className="mt-10">
                <Button
                  variant="secondary"
                  onClick={() => setIsLangModalOpen(true)}
                >
                  {t("card.lang.button")}
                </Button>
              </div>
            </div>
          </Card>
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="flex items-start justify-center p-4 pointer-events-auto">
              <Toaster />
            </div>
          </div>
        </Container>
      </div>

      <ChatButton />

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={handleUpdate}
      />
      <LangModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
      <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />

      <Activate2FAModal
        isOpen={isActivate2FAModalOpen}
        onClose={() => setIsActivate2FAModalOpen(false)}
        onAccept={async () => {
          setTwoFactorAuthEnabled(true);
          setIsActivate2FAModalOpen(false);
          await refreshProfile();
        }}
      />

      <Deactivate2FAModal
        isOpen={isDeactivate2FAModalOpen}
        onClose={() => setIsDeactivate2FAModalOpen(false)}
        onAccept={async () => {
          handleDisable2FA();
          setIsDeactivate2FAModalOpen(false);
          await refreshProfile();
        }}
      />
    </>
  );
};
