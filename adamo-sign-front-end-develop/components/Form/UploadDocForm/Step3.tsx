import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Card, CardParticipant } from "@/components/Card";
import { EditDocNameModal } from "@/components/Modals/EditDocNameModal";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { useSignatureData } from "@/context/SignatureContext";
import { useProfile } from "@/context/ProfileContext";

export const Step3 = () => {
  const [isEditNameModalOpen, setEditNameModalOpen] = useState(false);
  const [participantSendMethods, setParticipantSendMethods] = useState<Record<number, string>>({});
  const [participantPhoneData, setParticipantPhoneData] = useState<Record<number, { countryCode: string; phone: string }>>({});

  const t = useTranslations();
  const { control, getValues, setValue, watch } = useFormContext();
  const { loading } = useSignatureData();
  const participants = getValues("participants");
  const { email: userEmail } = useProfile();
  const { remove } = useFieldArray({
    control,
    name: "participants",
  });

  // Watch for checkboxes
  const sendReminder = watch("sendReminder", false);
  const allowRejection = watch("allowRejection", false);

  const onSendMethodChange = (index: number, method: string) => {
    console.log(`Send method changed for participant ${index}: ${method}`);
    setParticipantSendMethods(prev => ({ ...prev, [index]: method }));
    setValue("participantSendMethods", { ...participantSendMethods, [index]: method });
  };

  const onPhoneDataChange = (index: number, countryCode: string, phone: string) => {
    console.log(`Phone data changed for participant ${index}:`, { countryCode, phone });
    setParticipantPhoneData(prev => ({ 
      ...prev, 
      [index]: { countryCode, phone } 
    }));
    setValue("participantPhoneData", { 
      ...participantPhoneData, 
      [index]: { countryCode, phone } 
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Card className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="font-bold text-adamo-sign-700">{getValues("name")}</h2>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            disabled={loading}
            onClick={() => setEditNameModalOpen(true)}
          >
            {t("editName")}
          </Button>
        </Card>

        <Card>
          <h2 className="font-bold text-adamo-sign-700">
            {t("documentResume.title")}
          </h2>
          <div className="mt-4 space-y-4 md:mt-8">
            {participants.map((participant: any, index: number) => {
              // Detectar si el participante es el usuario actual por email
              const isSelf = participant.email?.toLowerCase() === userEmail?.toLowerCase();
              return (
                <CardParticipant
                  onRemove={remove}
                  index={index}
                  variant="action"
                  verifications={participant.verifications}
                  key={participant.id + String(index)}
                  disabled={loading}
                  onSendMethodChange={onSendMethodChange}
                  onPhoneDataChange={onPhoneDataChange}
                  isSelf={isSelf}
                  {...participant}
                />
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-adamo-sign-700">
            {t("documentResume.moreOptions")}
          </h2>
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="send-reminder"
                checked={sendReminder}
                onCheckedChange={(checked) => setValue("sendReminder", checked)}
                disabled={loading}
              />
              <Label htmlFor="send-reminder">
                {t("documentResume.option1")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow-rejection"
                checked={allowRejection}
                onCheckedChange={(checked) => setValue("allowRejection", checked)}
                disabled={loading}
              />
              <Label htmlFor="allow-rejection">
                {t("documentResume.option2")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="time-limit" disabled />
              <Label htmlFor="time-limit" className="text-neutral-400">
                {t("documentResume.option3")}
              </Label>
              <span className="rounded-2xl bg-adamo-pay-100 p-2 text-sm font-semibold">
                Plan Pro
              </span>
            </div>
          </div>
        </Card>
      </div>
      <EditDocNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => setEditNameModalOpen(false)}
        onEnter={() => setEditNameModalOpen(false)}
      />
    </>
  );
};