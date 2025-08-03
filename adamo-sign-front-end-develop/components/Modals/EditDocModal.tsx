"use client";

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
import { useTranslations } from "next-intl";
// import { ChevronIcon } from "../icon";
import { Input } from "../ui/Input";
import { DocumentInputs } from "@/schemas/documentSchema";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/Label";
import { Switch } from "../ui/switch";
import { useEffect, useMemo, useState } from "react";
import { basicItems, proItems } from "@/const/verificationTypes";
import { VerificationMethodCard } from "../VerificationMethodCard";

interface EditDocModalProps {
  index: number;
  isOpen: boolean;
  onClose: () => void;
  onEnter: () => void;
}

export const EditDocModal = ({ index, isOpen, onClose }: EditDocModalProps) => {
  const t = useTranslations();

  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<DocumentInputs>();

  const handleEdit = async () => {
    const isValid = await trigger();

    if (isValid) {
      onClose();
    }
  };

  // Watch the current participant's verifications object
  // const verifications = watch(`participants.${index}.verifications`) || {};
  const verifications = useMemo(
    () => watch(`participants.${index}.verifications`) || {},
    [watch, index],
  );

  // Local state to manage the switch checked state
  const [isChecked, setIsChecked] = useState(false);

  // Check if at least one verification is true and set the initial state
  useEffect(() => {
    const hasAnyVerificationTrue = Object.values(verifications).some(
      (value) => value === true,
    );
    setIsChecked(hasAnyVerificationTrue);
  }, [verifications]);

  // Handle Switch Toggle
  const handleToggle = (checked: boolean) => {
    setIsChecked(checked); // Update local state

    if (!checked) {
      // Set all verifications to false when switched off
      setValue(`participants.${index}.verifications`, {
        selfie: false,
        document: false,
        identity: false,
        facial: false,
        phone: false,
        email: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[808px]" data-mobile-close-hidden>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("EditDocModal.title")}
          </DialogTitle>

          <DialogDescription>
            <span>{t("EditDocModal.description")}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Input
                placeholder={t("EditDocModal.inputFirstNamePlaceholder")}
                {...register(`participants.${index}.firstName`)}
                isError={Boolean(errors.participants?.[index]?.firstName)}
                helperText={errors.participants?.[index]?.firstName?.message}
              />
              <Input
                placeholder={t("EditDocModal.inputLastNamePlaceholder")}
                {...register(`participants.${index}.lastName`)}
                isError={Boolean(errors.participants?.[index]?.lastName)}
                helperText={errors.participants?.[index]?.lastName?.message}
              />
            </div>

            <Input
              placeholder={t("EditDocModal.inputEmailPlaceholder")}
              {...register(`participants.${index}.email`)}
              isError={Boolean(errors.participants?.[index]?.email)}
              helperText={errors.participants?.[index]?.email?.message}
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Switch
              id="verification"
              checked={isChecked}
              onCheckedChange={handleToggle}
            />
            <Label
              htmlFor="verification"
              className="font-semibold text-neutral-700"
            >
              {t("EditDocModal.requireVerificationLabel")}
            </Label>
          </div>

          {isChecked && (
            <div className="mt-6 space-y-6 md:mt-8">
              <div className="space-y-2">
                <h5 className="font-semibold text-neutral-700">
                  {t("EditDocModal.basicVerifications")}
                </h5>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {basicItems.map((item) => (
                    <Controller
                      key={item.type}
                      control={control}
                      name={`participants.${index}.verifications.${item.type}`}
                      render={({ field }) => (
                        <VerificationMethodCard
                          {...item}
                          variant="compact"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-neutral-700">
                  {t("EditDocModal.proVerifications")}
                </h5>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {proItems.map((item) => (
                    <VerificationMethodCard
                      isPro
                      variant="compact"
                      key={item.type}
                      {...item}
                    />
                  ))}
                </div>
              </div>

              <div className="!mt-2 flex flex-col items-start gap-4 rounded-2xl bg-adamo-sign-100 p-3 md:flex-row md:items-center md:justify-between">
                <p className="text-neutral-700">
                  {t("EditDocModal.planDescription")}
                </p>

                <Button size="medium">{t("EditDocModal.plan")}</Button>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="px-4 pb-4 md:p-0">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={() => handleEdit()}>{t("edit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
