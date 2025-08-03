"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Mode } from "@/types";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { getContactSchema, type ContactType } from "@/schemas/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactRequest, ContactResponse } from "@/api/types/ContactTypes";
import { Path } from "react-hook-form";

import ContactUseCase from "@/api/useCases/ContactUseCase";
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
import { Input } from "../ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { COUNTRY_CODES } from "@/const/countryCodes";

const FormInput = ({
  name,
  control,
  label,
  placeholder,
  isRequired,
  readOnly,
  errors,
  toUppercase = false,
  ...props
}: {
  name: Path<ContactType>
  control: any;
  label: string;
  placeholder: string;
  isRequired?: boolean;
  type?: string;
  errors?: any;
  readOnly?: boolean;
  toUppercase?: boolean;
}) => (
  <Controller
    control={control}
    name={name as any}
    render={({ field }) => (
      <Input
        {...field}
        label={isRequired ? `${label} *` : label}
        placeholder={placeholder}
        value={
          toUppercase && typeof field.value === "string"
            ? field.value.toUpperCase()
            : field.value
        }
        onChange={(e) => {
          const inputValue = e.target.value;
          field.onChange(toUppercase ? inputValue.toUpperCase() : inputValue);
        }}
        readOnly={readOnly}
        isError={!!errors?.[name]}
        helperText={errors?.[name]?.message}
        {...props}
      />
    )}
  />
);

interface EditContactModalProps {
  isOpen: boolean;
  mode: "view" | "edit";
  contact: ContactResponse | null;
  onClose: () => void;
  onChangeMode: (mode: Mode) => void;
  onSuccess?: () => void;
}

export const EditContactModal = ({
  isOpen,
  mode,
  contact,
  onClose,
  onChangeMode,
  onSuccess,
}: EditContactModalProps) => {
  const t = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState, reset, getValues, setError } = useForm<ContactRequest>({
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "",
      phone: "",
      company: "",
      position: "",
      address: {
        street: "",
        city: "",
        country: "",
      },
    },
    resolver: zodResolver(getContactSchema(t)),
  });

  useEffect(() => {
    /* let countryCode = "";
    let phone = contact?.phone || "";

    const match = phone.match(/^(\+\d{1,2})(\d+)$/);
    if (match) {
      countryCode = match[1]; // +x, +xx || +xxx
      phone = match[2];       // 321 1234567
    } */
    if (contact) {
      const fullPhone = contact?.phone || "";
      const countryEntry = COUNTRY_CODES.find((entry) =>
        fullPhone.startsWith(entry.value)
      );
      const countryCode = countryEntry?.value || "";
      const phone = countryEntry
        ? fullPhone.slice(countryCode.length)
        : fullPhone;

      const initial: ContactRequest = {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone,
        countryCode,
        company: contact.company || "",
        position: contact.position || "",
        address: {
          street: contact.address?.street || "",
          city: contact.address?.city || "",
          country: contact.address?.country || "",
        },
      };

      reset(initial);
    }
  }, [contact, reset]);

  const onSubmit = async (/* dataForm: ContactRequest */) => {
    setServerError(null);
    
    const dataForm = getValues();
    const fullPhone =
      dataForm.phone && dataForm.countryCode
        ? `${dataForm.countryCode}${dataForm.phone}`
        : "";

    const contactData = {
      ...contact, // Original data
      ...dataForm, // Override data
      //phone: fullPhone,
      address: {
        ...contact?.address,
        ...dataForm.address,
      },
    };

    // No phone number then then phone and countryCode
    if (!dataForm.phone) {
      contactData.phone = "";
      contactData.countryCode = "";
    } else {
      contactData.phone = fullPhone;
      contactData.countryCode = dataForm.countryCode;
    }

    try {
      if (!contactData.id) {
        throw new Error("Contact ID is required");
      }
      await ContactUseCase.updateContact(contactData.id, contactData);
      if (onSuccess) onSuccess();
      onChangeMode("view");
      onClose();
    }  catch (error: any) {
      const backendMsg = error?.response?.data?.message?.toLowerCase() || "";
      if (
        error?.response?.status === 400 &&
        backendMsg.includes("email")
      ) {
        setError("email", {
          type: "manual",
          message: error?.response?.data?.message || t("contactForm.validation.emailDuplicateError"),
        });
      } else {
        setServerError(error?.response?.data?.message || t("contactForm.validation.genericError"));
      }
      console.log("error adding contact", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[808px]">
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {mode === "view"
              ? t("editContactModal.title")
              : t("editContactModal.titleEdit")}
          </DialogTitle>
          <DialogDescription>
            <span className="sr-only">
              {mode === "view"
                ? t("editContactModal.title")
                : t("editContactModal.title")}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {/* Display error if exist */}
          {serverError && (
            <div className="mb-4 text-sm text-error-500">{serverError}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput
                name="firstName"
                control={control}
                label={t("contactForm.firstNameLabel")}
                placeholder={t("contactForm.firstNamePlaceholder")}
                isRequired={mode === "edit"}
                readOnly={mode === "view"}
                toUppercase
                errors={formState.errors}
              />
              <FormInput
                name="lastName"
                control={control}
                label={t("contactForm.lastNameLabel")}
                placeholder={t("contactForm.lastNamePlaceholder")}
                isRequired={mode === "edit"}
                readOnly={mode === "view"}
                toUppercase
                errors={formState.errors}
              />
              <FormInput
                name="email"
                control={control}
                type="email"
                label={t("contactForm.emailLabel")}
                placeholder={t("contactForm.emailPlaceholder")}
                isRequired={mode === "edit"}
                readOnly={mode === "view"}
                errors={formState.errors}
              />

              {mode === "view" && contact && contact.phone && (
                <Input
                  label={t("contactForm.phoneNumberLabel")}
                  placeholder={t("contactForm.phoneNumberPlaceholder")}
                  readOnly
                  value={contact.phone}
                />
              )}

              {mode === "edit" && (
                <div className="space-y-1">
                  <label className="text-xs">
                    {t("contactForm.phoneNumberLabel")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name="countryCode"
                      render={({ field }) => {
                        return (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRY_CODES.map((code) => (
                                <SelectItem key={code.value} value={code.value}>
                                  {code.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                    <Controller
                      control={control}
                      name="phone"
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          placeholder="Número de teléfono"
                          {...field}
                          isError={Boolean(formState.errors.phone)}
                          helperText={formState.errors.phone?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {mode === "view" && (!contact?.phone || contact.phone === "") ? (
                <>
                  <FormInput
                    name="company"
                    control={control}
                    label={t("contactForm.companyLabel")}
                    placeholder={t("contactForm.companyPlaceholder")}
                    readOnly={mode === "view"}
                    toUppercase
                    errors={formState.errors}
                  />
                  <div className="md:col-span-2">
                    <FormInput
                      name="position"
                      control={control}
                      label={t("contactForm.positionLabel")}
                      placeholder={t("contactForm.positionPlaceholder")}
                      readOnly
                      errors={formState.errors}
                    />
                  </div>
                </>
              ) : (
                <>
                  <FormInput
                    name="company"
                    control={control}
                    label={t("contactForm.companyLabel")}
                    placeholder={t("contactForm.companyPlaceholder")}
                    readOnly={mode === "view"}
                    toUppercase
                    errors={formState.errors}
                  />
                  <FormInput
                    name="position"
                    control={control}
                    label={t("contactForm.positionLabel")}
                    placeholder={t("contactForm.positionPlaceholder")}
                    readOnly={mode === "view"}
                    errors={formState.errors}
                  />
                </>
              )}

              <div className="md:col-span-2">
                <FormInput
                  name="address.street"
                  control={control}
                  label={t("contactForm.addressLabel")}
                  placeholder={t("contactForm.addressPlaceholder")}
                  readOnly={mode === "view"}
                  toUppercase
                  errors={formState.errors}
                />
              </div>
              <FormInput
                name="address.country"
                control={control}
                label={t("contactForm.countryLabel")}
                placeholder={t("contactForm.countryPlaceholder")}
                readOnly={mode === "view"}
                toUppercase
                errors={formState.errors}
              />
              <FormInput
                name="address.city"
                control={control}
                label={t("contactForm.cityLabel")}
                placeholder={t("contactForm.cityPlaceholder")}
                readOnly={mode === "view"}
                toUppercase
                errors={formState.errors}
              />
            </div>

            {mode === "edit" && (
              <p className="mt-8">{t("contactForm.requiredFields")}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                {mode === "view" ? "Aceptar" : "Cancelar"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className={cn(mode !== "view" && "hidden")}
                onClick={() => onChangeMode("edit")}
              >
                {t("editContactModal.editContact")}
              </Button>

              <Button
                type="button"
                isLoading={formState.isSubmitting}
                disabled={formState.isSubmitting}
                onClick={onSubmit}

                className={cn(mode !== "edit" && "hidden")}
              >
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
