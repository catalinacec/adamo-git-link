import { basicItems, proItems } from "@/const/verificationTypes";
import { ParticipantInputs, participantSchema } from "@/schemas/documentSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { useTranslations } from "next-intl";

import { VerificationMethodCard } from "../VerificationMethodCard";
import { Button } from "../ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Switch } from "../ui/switch";
import { useSignatureData } from "@/context/SignatureContext";
import { Participant } from "@/types";

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddParticipantModal({ isOpen, onClose }: AddParticipantModalProps) {
  const t = useTranslations("AddParticipantModal");
  const tg = useTranslations("Global");
  const tf = useTranslations("participantForm");
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const { setParticipants, participants } = useSignatureData();
  const { append } = useFieldArray({ name: "participants" });
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

  const { handleSubmit, control, formState, setValue, reset } =
    useForm<ParticipantInputs>({
      resolver: zodResolver(participantSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        color: "",
        listContact: false,
        verifications: {
          selfie: false,
          document: false,
          identity: false,
          facial: false,
          phone: false,
          email: false,
        },
      },
    });

  const handleClose = () => {
    onClose();
    reset();
    setError("");

  };

  const onSubmit: SubmitHandler<ParticipantInputs> = (data) => {
    const isDuplicate = participants.some(
      (participant) => participant.email.toLowerCase() === data.email.toLowerCase()
    );

    if (isDuplicate) {
      setError("Email is already in use");
      return;
    }

    // Ensure color is always a string
    const participantWithColor: Participant = {
      ...data,
      color: data.color || colors[Math.floor(Math.random() * colors.length)],
      listContact: false
    };

    const updatedParticipants: Participant[] = [...participants, participantWithColor];

    setParticipants(updatedParticipants);
    localStorage.setItem("participants", JSON.stringify(updatedParticipants));

    append(participantWithColor);
    setError("");
    onClose();
    reset();
  };






  const handleToggle = (checked: boolean) => {
    setIsChecked(checked);

    if (!checked) {
      setValue(`verifications`, {
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[808px]" data-mobile-close-hidden>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>

          <DialogDescription>
            <span>{t("description")}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={tf("participantNamePlaceholder")}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      isError={!!formState.errors.firstName}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={tf("participantLastNamePlaceholder")}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      isError={!!formState.errors.lastName}
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={tf("participantEmailPlaceholder")}
                    isError={!!formState.errors.email || !!error}
                    helperText={formState.errors.email?.message || error}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      field.onChange(value);

                      const isDuplicate = participants.some(
                        (participant) => participant.email.toLowerCase() === value
                      );

                      if (isDuplicate) {
                        setError("Email is already in use");
                      } else {
                        setError("");
                      }
                    }}
                  />
                )}
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
                {tf("requireVerifications")}
              </Label>
            </div>

            {isChecked && (
              <div className="mt-6 space-y-6 md:mt-8">
                <div className="space-y-2">
                  <h5 className="font-semibold text-neutral-700">
                    {tf("basicVerifications")}
                  </h5>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {basicItems.map((item) => (
                      <Controller
                        key={item.type}
                        control={control}
                        name={`verifications.${item.type}`}
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
                    {tf("proVerifications")}
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
                  <p className="text-neutral-700">{tf("planDescription")}</p>

                  <Button size="medium">{tf("plan")}</Button>
                </div>
              </div>
            )}
          </form>
        </DialogBody>

        <DialogFooter className="px-4 pb-4 md:p-0">
          <Button variant="secondary" onClick={handleClose}>
            {tg("cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!formState.isValid}
          >
            {t("addButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddParticipantModal;
