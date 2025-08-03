"use client";

import { DocumentInputs } from "@/schemas/documentSchema";
import { Participant } from "@/types";

import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { useTranslations } from "next-intl";

import { useFile } from "@/context/FileContext";
import { useProfile } from "@/context/ProfileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { Card } from "@/components/Card";
import { SearchContactModal } from "@/components/Modals/SearchContactModal";
import {
  AccountCircleIcon,
  ExternalLinkIcon,
  PlusIcon,
} from "@/components/icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/switch";

import { ParticipantForm } from "../ParticipantForm";

export const Step1 = () => {
  const [isSearchContactModalOpen, setIsSearchContactModalOpen] =
    useState(false);
  const { name, lastName, email } = useProfile();

  const t = useTranslations();
  const { file } = useFile();
  const {
    documentName: contextDocumentName,
    pdfLink: contextPdfLink,
    participants: contextParticipants,
    setDocumentName,
    setAdminCheck,
  } = useSignatureData();

  const {
    control,
    register,
    setValue,
    getValues,
    reset,
    formState,
    clearErrors,
  } = useFormContext<DocumentInputs>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  const getRandomColor = () => {
    const colors = [
      "#94F2F2",
      "#9FF6D6",
      "#ABD4F9",
      "#AEF6B6",
      "#B1B5DA",
      "#B1DAB0",
      "#B4BEA6",
      "#B6D9DB",
      "#BBF3F1",
      "#BAB0F7",
      "#C8EF9C",
      "#C9F6CF",
      "#CDD1F6",
      "#D6ABB9",
      "#D962E0",
      "#D9F1F5",
      "#DAC29E",
      "#DBD9BA",
      "#E6B4FB",
      "#F2F195",
      "#F3F5B9",
      "#F5F5B9",
      "#F8B9BD",
      "#FABEF6",
      "#FAC1D9",
      "#FBC1D9",
      "#FDDCA0",
      "#FEAD23",
      "#FFAAB8",
      "#FFAD80",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const prevParticipantsKeyRef = useRef<string>("");

  useEffect(() => {
    if (!Array.isArray(contextParticipants)) {
      return;
    }
    const newKey = contextParticipants
      .map((p) => p.email?.toLowerCase() || "")
      .join("|");

    if (newKey !== prevParticipantsKeyRef.current) {
      prevParticipantsKeyRef.current = newKey;

      const currentValues = getValues();
      const { participants: _omit, ...others } = currentValues as any;

      const participantsFormArray = contextParticipants.map((p) => ({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        email: p.email || "",
        color: p.color || getRandomColor(),
        listContact: p.listContact ?? false,
        verifications: {
          selfie: false,
          document: false,
          identity: false,
          facial: false,
          phone: false,
          email: false,
        },
      }));

      reset({
        ...others,
        participants: participantsFormArray,
      });
    }
  }, [contextParticipants, getValues, reset]);

  useEffect(() => {
    if (file && typeof file !== "string") {
      setValue("file", file);
      // El nombre editable solo se setea si está vacío
      const nombreArchivo = (file as File).name;
      if (nombreArchivo && !getValues("name")) {
        setDocumentName(nombreArchivo);
      }
    }
  }, [file, setValue, setDocumentName, getValues]);

  useEffect(() => {
    // Solo setea el nombre editable si está vacío
    if (contextDocumentName && !getValues("name")) {
      setValue("name", contextDocumentName.toUpperCase());
    }
  }, [contextDocumentName, setValue, getValues]);

  const handleOpenFile = () => {
    if (file && typeof file !== "string") {
      const fileUrlLocal = URL.createObjectURL(file as File);
      window.open(fileUrlLocal, "_blank");
    } else if (contextPdfLink) {
      window.open(contextPdfLink, "_blank");
    }
  };

  const handleAddParticipant = (
    data?: Partial<Pick<Participant, "firstName" | "lastName" | "email">>,
    options?: { addAsFirst?: boolean }
  ) => {
    // Si es el propio usuario (cuando options?.addAsFirst), forzar mayúsculas en nombre y apellido
    const isSelf = options?.addAsFirst;
    const participant = {
      firstName: isSelf && data?.firstName ? data.firstName.toUpperCase() : (data?.firstName ? data.firstName.toUpperCase() : ""),
      lastName: isSelf && data?.lastName ? data.lastName.toUpperCase() : data?.lastName?.toUpperCase() || "",
      email: data?.email || "",
      color: getRandomColor(),
      listContact: false,
      verifications: {
        selfie: false,
        document: false,
        identity: false,
        facial: false,
        phone: false,
        email: false,
      },
    };
    if (options?.addAsFirst) {
      // Insert as first participant
      const currentParticipants = getValues("participants") || [];
      setValue("participants", [participant, ...currentParticipants.filter(p => (p.email?.toLowerCase() !== participant.email?.toLowerCase()))]);
    } else {
      append(participant);
    }
  };

  const handleSelectParticipant = (participant: any) => {
    const formattedParticipant = {
      firstName: participant.firstName?.toUpperCase() || "",
      lastName: participant.lastName?.toUpperCase() || "",
      email: participant.email?.toLowerCase() || "",
      color: getRandomColor(),
      listContact: false,
      verifications: {
        selfie: false,
        document: false,
        identity: false,
        facial: false,
        phone: false,
        email: false,
      },
    };

    // Obtiene el array actual de participantes del formulario
    const currentParticipants = getValues("participants") as Array<{
      firstName: string;
      lastName: string;
      email: string;
      [key: string]: any;
    }>;

    // Busca el primer participante con algún campo vacío
    const idxToFill = currentParticipants.findIndex(
      (p) => !p.firstName || !p.lastName || !p.email,
    );

    if (idxToFill >= 0) {
      // Si hay uno incompleto, lo actualiza en lugar de añadir
      setValue(`participants.${idxToFill}`, formattedParticipant);
    } else {
      // Si todos están completos, añade uno nuevo
      append(formattedParticipant);
    }
  };
  return (
    <>
      {/* Sección: Nombre de Documento y URL */}
      <Card>
        <h2 className="font-bold text-adamo-sign-700">{t("documentName")}</h2>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            disabled
            // Solo muestra el nombre del archivo subido, no el nombre editable
            value={
              (file && typeof file !== "string"
                ? (file as File).name
                : contextDocumentName) || ""
            }
            iconRight={
              <button
                type="button"
                className="text-neutral-600"
                onClick={handleOpenFile}
                disabled={!(file || contextPdfLink)}
              >
                <ExternalLinkIcon />
              </button>
            }
            placeholder={t("inputDocumentNamePlaceholder")}
          />
          <Input
            {...register("name", {
              onChange: (e) => {
                const value = e.target.value.toUpperCase();
                setValue("name", value);
                setDocumentName(value);
              },
            })}
            placeholder={t("inputDocumentNamePlaceholder")}
            isError={Boolean(formState.errors?.name)}
            helperText={
              formState.errors?.name?.type &&
              t("UploadDocStep1.validation." + formState.errors.name.type)
            }
          />
        </div>
      </Card>

      {/* Sección Participantes */}
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-bold text-adamo-sign-700">
            {t("participantsDocument")}
          </h2>
          <Controller
            control={control}
            name="sign"
            render={({ field }) => (
              <div className="flex items-center gap-4">
                <Switch
                  id="sign"
                  checked={field.value}
                  onCheckedChange={(value) => {
                    // Solo eliminar si hay más de un participante
                    field.onChange(value);
                    setAdminCheck(value);

                    if (value) {
                      // Limpiar errores de validación de todos los participantes antes de agregar el firmante
                      if (formState?.errors && formState.errors.participants) {
                        setValue("participants", getValues("participants"), { shouldValidate: false });
                        clearErrors("participants");
                      }
                      handleAddParticipant(
                        {
                          firstName: name,
                          lastName: lastName,
                          email: email,
                        },
                        { addAsFirst: true }
                      );
                    } else {
                      const currentParticipants = getValues(
                        "participants",
                      ) as Array<{
                        email: string;
                        firstName: string;
                        lastName: string;
                      }>;

                      const indexToRemove = currentParticipants.findIndex(
                        (p) => p.email?.toLowerCase() === email?.toLowerCase(),
                      );

                      if (indexToRemove >= 0) {
                        if (currentParticipants.length > 1) {
                          remove(indexToRemove);
                        } else {
                          // Si solo hay uno, reemplazar por un nuevo participante vacío (sin rastro del firmante)
                          setValue("participants", [{
                            firstName: "",
                            lastName: "",
                            email: "",
                            color: getRandomColor(),
                            listContact: false,
                            verifications: {
                              selfie: false,
                              document: false,
                              identity: false,
                              facial: false,
                              phone: false,
                              email: false,
                            },
                          }]);
                        }
                      }
                    }
                  }}
                />
                <Label
                  htmlFor="sign"
                  className="font-semibold text-neutral-700"
                >
                  {t("signDocument")}
                </Label>
              </div>
            )}
          />
        </div>

        <div className="mt-8 space-y-6">
          {fields.map((field, index) => {
            // Si el participante es el usuario actual y el switch está activado, no permitir eliminarlo manualmente
            const isSelf = field.email?.toLowerCase() === email?.toLowerCase();
            return (
              <ParticipantForm
                key={field.id}
                title={`${t("step1.Signatory")} 0${index + 1}`}
                index={index}
                onRemove={isSelf ? undefined : remove}
                totalParticipants={fields.length}
                disableRemove={isSelf}
                disableContactAdd={isSelf}
                disableVerificationSwitch={isSelf}
              />
            );
          })}
          {fields.length === 0 && (
            <p className="text-neutral-500 italic">
              {t("step1.noParticipants")}
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-4 xs:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsSearchContactModalOpen(true)}
          >
            <AccountCircleIcon />
            <span className="md:hidden">{t("contact")}</span>
            <span className="hidden md:inline">{t("searchContact")}</span>
          </Button>
          <Button type="button" onClick={() => handleAddParticipant()}>
            <PlusIcon />
            {t("participant")}
          </Button>
        </div>
      </Card>

      <SearchContactModal
        isOpen={isSearchContactModalOpen}
        onClose={() => setIsSearchContactModalOpen(false)}
        onConfirm={(participant) => {
          handleSelectParticipant(participant);
          setIsSearchContactModalOpen(false);
        }}
      />
    </>
  );
};
