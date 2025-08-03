"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Button } from "@/components/ui/Button";
import { InputPassword } from "../ui/InputPassword";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import ProfileUseCase from "@/api/useCases/ProfileUseCase";

import {
  getNewPasswordSchema,
  newPasswordInputs,
} from "@/schemas/newPasswordSchema";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "verifyCurrent" | "newPassword";

export const PasswordModal = ({ isOpen, onClose }: PasswordModalProps) => {
  const t       = useTranslations("PasswordModal");
  const tg      = useTranslations("Global");
  const tForm   = useTranslations("UpdatePasswordForm");
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>("verifyCurrent");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = getNewPasswordSchema(tForm);

  const {
    register,
    trigger,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<newPasswordInputs>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPass     = watch("newPassword");
  const confirmPass = watch("confirmPassword");
  const oldPass     = watch("oldPassword");
  const newValid    = !!newPass && !errors.newPassword;
  const confirmValid= !!confirmPass && !errors.confirmPassword;
  const oldValid    = !!oldPass && !errors.oldPassword;

  const handleNextStep = async () => {
    const ok = await trigger("oldPassword");
    if (ok) setCurrentStep("newPassword");
  };

  const onSubmit = async (data: newPasswordInputs) => {
    setIsSubmitting(true);
    try {
      const response = await ProfileUseCase.changePassword(data);
      if (response.message === "Internal Server Error") {
        toast({ title: response.message });
        return;
      }
      toast({ title: t("toast") });
      handleClose();
    } catch {
      toast({ title: t("error") });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep("verifyCurrent");
    reset();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "verifyCurrent"
              ? t("description")
              : t("descriptionNewPassword")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {currentStep === "verifyCurrent" && (
              <InputPassword
                {...register("oldPassword")}
                isError={Boolean(errors.oldPassword)}
                placeholder={t("inputPasswordPlaceholder")}
                helperText={errors.oldPassword?.message}
              />
            )}

            {currentStep === "newPassword" && (
              <>
                <InputPassword
                  autoFocus
                  {...register("newPassword")}
                  isError={Boolean(errors.newPassword)}
                  placeholder={tForm("passwordPlaceholder")}
                  helperText={
                    errors.newPassword?.message ||
                    tForm("passwordHelperText")
                  }
                />
                <InputPassword
                  {...register("confirmPassword")}
                  isError={Boolean(errors.confirmPassword)}
                  placeholder={tForm("confirmPasswordPlaceholder")}
                  helperText={errors.confirmPassword?.message}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
              >
                {tg("cancel")}
              </Button>

              {currentStep === "verifyCurrent" ? (
                <Button type="button" onClick={handleNextStep} disabled={!oldValid}>
                  {tg("continue")}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!newValid || !confirmValid}
                  isLoading={isSubmitting}
                >
                  {t("buttonChangePassword")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
