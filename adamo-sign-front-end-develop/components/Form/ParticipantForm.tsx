"use client";

import { basicItems, proItems } from "@/const/verificationTypes";
import { DocumentInputs } from "@/schemas/documentSchema";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { useTranslations } from "next-intl";

import { VerificationMethodCard } from "../VerificationMethodCard";
import { AdamoIdIcon } from "../icon/AdamoIdIcon";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Switch } from "../ui/switch";
import ContactSalesModal from "../Modals/ContactSalesModal";


interface Props {
  title: string;
  index: number;
  onRemove?: (index: number) => void;
  totalParticipants: number;
  disableRemove?: boolean;
  disableContactAdd?: boolean; // Nuevo prop para deshabilitar AddContact
  disableVerificationSwitch?: boolean; // Nuevo prop para deshabilitar el switch
}

export const ParticipantForm = (props: Props) => {
  const { title, index, onRemove, totalParticipants, disableRemove, disableContactAdd, disableVerificationSwitch } = props;
  const [requireVerification, setRequireVerification] = useState(false);
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);

  const t = useTranslations();

  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<DocumentInputs>();

  const verifications = useMemo(
    () => watch(`participants.${index}.verifications`) || {},
    [watch, index],
  );

  // Check if at least one verification is true and set the initial state
  useEffect(() => {
    const hasAnyVerificationTrue = Object.values(verifications).some(
      (value) => value === true,
    );
    setRequireVerification(hasAnyVerificationTrue);
  }, [verifications]);

  // Handle Switch Toggle
  const handleToggle = (checked: boolean) => {
    setRequireVerification(checked); // Update local state

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


  // Determinar si el participante es "nuevo" (campos vacíos y único participante)
  const isEmptyParticipant = (formIndex: number) => {
    const values = watch(`participants.${formIndex}`);
    return values && !values.firstName && !values.lastName && !values.email;
  };

  // Si es un participante vacío y es el único, todo debe estar activo
  const isNewSingleParticipant = totalParticipants === 1 && isEmptyParticipant(index);
  const shouldDisable = disableRemove && !isNewSingleParticipant;
  const shouldDisableContactAdd = disableContactAdd && !isNewSingleParticipant;
  const shouldDisableVerificationSwitch = disableVerificationSwitch && !isNewSingleParticipant;

  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-neutral-700">{title}</h4>
        {(totalParticipants > 1 && !disableRemove) && (
          <Button
            variant="linkError"
            onClick={() => {
              if (onRemove && !disableRemove) {
                onRemove(index);
              }
            }}
            disabled={false}
          >
            {t("delete")}
          </Button>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <Input
            placeholder={t("participantForm.participantNamePlaceholder")}
            {...register(`participants.${index}.firstName`, {
              onChange: (e) => {
                setValue(
                  `participants.${index}.firstName`,
                  e.target.value.toUpperCase(),
                  { shouldValidate: true, shouldDirty: true }
                );
              },
            })}
            isError={Boolean(errors.participants?.[index]?.firstName)}
            helperText={
              errors.participants?.[index]?.firstName?.type &&
              t(
                `participantForm.validation.${errors.participants?.[index]?.firstName?.type}`,
              )
            }
            disabled={shouldDisable}
          />
          <Input
            placeholder={t("participantForm.participantLastNamePlaceholder")}
            {...register(`participants.${index}.lastName`, {
              onChange: (e) => {
                setValue(
                  `participants.${index}.lastName`,
                  e.target.value.toUpperCase(),
                  { shouldValidate: true, shouldDirty: true }
                );
              },
            })}
            isError={Boolean(errors.participants?.[index]?.lastName)}
            helperText={
              errors.participants?.[index]?.lastName?.type &&
              t(
                `participantForm.validation.${errors.participants?.[index]?.lastName?.type}`,
              )
            }
            disabled={shouldDisable}
          />
        </div>

        <Input
          placeholder={t("participantForm.participantEmailPlaceholder")}
          {...register(`participants.${index}.email`, {
            onChange: (e) => {
              setValue(
                `participants.${index}.email`,
                e.target.value.toLowerCase(),
                { shouldValidate: true, shouldDirty: true }
              );
            },
          })}
          isError={Boolean(errors.participants?.[index]?.email)}
          helperText={
            errors.participants?.[index]?.email?.type &&
            t(
              `participantForm.validation.${errors.participants?.[index]?.email?.type}`,
            )
          }
          disabled={shouldDisable}
        />

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name={`participants.${index}.listContact`}
            render={({ field }) => (
              <Checkbox
                id="list-contact"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={shouldDisableContactAdd}
              />
            )}
          />
          <Label htmlFor="list-contact" className="text-neutral-700">
            {t("participantForm.addToContacts")}
          </Label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Switch
            id="verification"
            checked={requireVerification}
            onCheckedChange={handleToggle}
            disabled={shouldDisableVerificationSwitch}
          />
          <Label
            htmlFor="verification"
            className="font-semibold text-neutral-700"
          >
            {t("participantForm.requireVerifications")}
          </Label>
        </div>
        <div className="flex items-center gap-2 md:ml-8">
          <span className="justify-center text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
            Powered by
          </span>
          <span className="flex items-center h-5 md:h-6">
            <AdamoIdIcon />
          </span>
        </div>
      </div>
      {requireVerification && (
        <div className="mt-6 space-y-6 border-neutral-200 md:mt-8 md:rounded-2xl md:border md:bg-white md:px-8 md:py-6">
          <div className="!mt-2 flex flex-col items-start gap-4 rounded-2xl bg-adamo-sign-100 p-3 md:flex-row md:items-center md:justify-between">
            <p className="text-neutral-700">
              {t("participantForm.planFreeDescription")}
            </p>
            <Button 
              type="button"
              size="medium" 
              onClick={() => setIsContactSalesModalOpen(true)}
            >
              {t("participantForm.contact")}
            </Button>
          </div>
          <p className="hidden text-neutral-600 md:block">
            {t("participantForm.verificationsDescription")}
          </p>

          <div className="space-y-2">
            <h5 className="font-semibold text-neutral-700">
              {t("participantForm.basicVerifications")}
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
              {t("participantForm.proVerifications")}
            </h5>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {proItems.map((item) => (
                <VerificationMethodCard isPro key={item.type} {...item} />
              ))}
            </div>
          </div>

          <div className="!mt-2 flex flex-col items-start gap-4 rounded-2xl bg-adamo-sign-100 p-3 md:flex-row md:items-center md:justify-between">
            <p className="text-neutral-700">
              {t("participantForm.planDescription")}
            </p>
            <Button type="button" size="medium">{t("participantForm.plan")}</Button>
          </div>
        </div>
      )}
      
      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={isContactSalesModalOpen}
        onClose={() => setIsContactSalesModalOpen(false)}
        onSubmit={(data) => {
          // Aquí puedes manejar el envío del formulario
          console.log('Contact sales data:', data);
          // Por ejemplo, podrías enviar los datos a una API
        }}
      />
    </div>
  );
};
