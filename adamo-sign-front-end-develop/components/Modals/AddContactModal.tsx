"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { getContactSchema, type ContactType } from "@/schemas/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactRequest } from "@/api/types/ContactTypes";
import { Path } from "react-hook-form";
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
import ContactUseCase from "@/api/useCases/ContactUseCase";

// Reusable Component for Input with Controller
const FormInput = ({
  name,
  control,
  label,
  placeholder,
  isRequired = false,
  type = "text",
  errors,
  toUppercase = false,
}: {
  name: Path<ContactType>;
  control: any;
  label: string;
  placeholder: string;
  isRequired?: boolean;
  type?: string;
  errors?: any;
  toUppercase?: boolean;
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <Input
        type={type}
        label={
          <span>
            {isRequired && <span className="text-error-500">*</span>} {label}
          </span>
        }
        placeholder={placeholder}
        {...field}
        value={
          toUppercase && typeof field.value === "string"
            ? field.value.toUpperCase()
            : field.value
        }
        onChange={(e) => {
          const inputValue = e.target.value;
          field.onChange(toUppercase ? inputValue.toUpperCase() : inputValue);
        }}
        isError={Boolean(errors?.[name])}
        helperText={errors?.[name]?.message}
      />
    )}
  />
);

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /* onAdd: (data: ContactRequest) => void; */
}

export const AddContactModal = ({
  isOpen,
  onClose,
  onSuccess,
  /* onAdd, */
}: AddContactModalProps) => {
  const t = useTranslations();

  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState, reset, setError } = useForm<ContactRequest>({
    defaultValues: {
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
        state: "",
        country: "",
        postalCode: "",
      },
    },
    resolver: zodResolver(getContactSchema(t)),
  });

  // Transform data to send inputs with capital letters
  function toUpperCaseDeepIgnore(obj: any, ignoreFields: string[] = []): any {
    if (typeof obj === "string") return obj.toUpperCase();

    if (Array.isArray(obj)) {
      return obj.map(item => toUpperCaseDeepIgnore(item, ignoreFields));
    }

    if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          if (ignoreFields.includes(key)) {
            return [key, value]; // no transformar este campo
          }
          return [key, toUpperCaseDeepIgnore(value, ignoreFields)];
        })
      );
    }

    return obj;
  }

  useEffect(() => {
    reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: ContactRequest) => {
  
    setServerError(null);
    
    let fullPhone = "";
    if ( data.phone && data.countryCode ) {
      fullPhone = data.countryCode + data.phone;
    }

    const contactData = {
      ...data,
      address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.city,
        country: data.address.country,
      },
    }

    // No phone number then void phone and countryCode
    if (!data.phone) {
      contactData.phone = "";
      contactData.countryCode = "";
    } else {
      contactData.phone = fullPhone;
      contactData.countryCode = data.countryCode;
    }

    const capitalizedData = toUpperCaseDeepIgnore(contactData, ["email", "position"])
    try {
      await ContactUseCase.newContact(capitalizedData);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
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
            {t("addContact")}
          </DialogTitle>
          <DialogDescription>
            {t("addContactModal.description")}
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
                isRequired
                toUppercase
                errors={formState.errors}
              />

              <FormInput
                name="lastName"
                control={control}
                label={t("contactForm.lastNameLabel")}
                placeholder={t("contactForm.lastNamePlaceholder")}
                isRequired
                toUppercase
                errors={formState.errors}
              />

              <FormInput
                name="email"
                control={control}
                type="email"
                label={t("contactForm.emailLabel")}
                placeholder={t("contactForm.emailPlaceholder")}
                isRequired
                errors={formState.errors}
              />

              <div className="space-y-1">
                <label className="text-xs">
                  {t("contactForm.phoneNumberLabel")}
                </label>
                <div className="flex items-end gap-2">
                  {/* Country Code Select */}
                  <Controller
                    control={control}
                    name="countryCode"
                    render={({ field }) => (
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
                    )}
                  />

                  {/* Phone Number Input */}
                  <FormInput
                    name="phone"
                    control={control}
                    label=""
                    placeholder={t("contactForm.phoneNumberPlaceholder")}
                    //errors={formState.errors}
                  />
                </div>
                {/* Display error validation between phone and countryCode */}
                {formState.errors.phone && (
                  <p className="text-xs text-error-500 mt-1">
                    {formState.errors.phone.message?.toString()}
                  </p>
                )}
              </div>

              <FormInput
                name="company"
                control={control}
                label={t("contactForm.companyLabel")}
                placeholder={t("contactForm.companyPlaceholder")}
                toUppercase
                errors={formState.errors}
              />

              <FormInput
                name="position"
                control={control}
                label={t("contactForm.positionLabel")}
                placeholder={t("contactForm.positionPlaceholder")}
                errors={formState.errors}
              />

              <div className="md:col-span-2">
                <FormInput
                  name="address.street"
                  control={control}
                  label={t("contactForm.addressLabel")}
                  placeholder={t("contactForm.addressPlaceholder")}
                  toUppercase
                  errors={formState.errors}
                />
              </div>

              <FormInput
                name="address.country"
                control={control}
                label={t("contactForm.countryLabel")}
                placeholder={t("contactForm.countryPlaceholder")}
                toUppercase
                errors={formState.errors}
              />

              <FormInput
                name="address.city"
                control={control}
                label={t("contactForm.cityLabel")}
                placeholder={t("contactForm.cityPlaceholder")}
                toUppercase
                errors={formState.errors}
              />
            </div>

            <p className="mt-8">{t("contactForm.requiredFields")}</p>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button
                isLoading={formState.isSubmitting}
                disabled={formState.isSubmitting}
                type="submit">
                {t("addContact")}
              </Button>
            </DialogFooter>
          </form>


        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
