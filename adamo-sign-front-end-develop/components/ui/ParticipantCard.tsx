// Permitir ambos tipos de Participant (de const/participantsSign y de types/index.d.ts)
type ParticipantCardType = {
  name?: string;
  status?: string;
  timestamp?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  statusObj?: { id: string; timestamp?: string; helperText?: string };
};

import { useTranslations } from "next-intl";

import { CancelIcon, CheckCircleIcon, ClockIcon } from "../icon";

const getStatusIcon = (status?: string) => {
  if (!status) return null;
  switch (status.toLowerCase()) {
    case "signed":
      return (
        <div className="bg-success-100 p-2.5 rounded-xl inline-block shrink-0">
          <CheckCircleIcon />
        </div>
      );
    case "rejected":
      return (
        <div className="bg-error-100 p-2.5 rounded-xl inline-block shrink-0">
          <CancelIcon />
        </div>
      );
    case "pending":
      return (
        <div className="bg-adamo-sign-100 p-2.5 rounded-xl inline-block shrink-0">
          <ClockIcon />
        </div>
      );
    default:
      return null;
  }
};

function ParticipantCard({ participant }: { participant: ParticipantCardType }) {
  const t = useTranslations("ParticipantCard");
  // Permitir ambos tipos de participant
  const status = participant.status || participant.statusObj?.id || "";
  const name = participant.name || `${participant.firstName || ""} ${participant.lastName || ""}`;
  const timestamp = participant.timestamp || participant.statusObj?.timestamp || "";
  return (
    <div className="bg-neutral-50 py-3 rounded-3xl px-4 hover:bg-adamo-sign-100">
      <div className="flex gap-x-4 items-center">
        {getStatusIcon(status)}
        <p className="text-neutral-700 font-semibold text-sm">
          {name}
        </p>
      </div>
      <p className="text-sm mt-2 text-neutral-400">
        {status ? t(status) : ""} {timestamp ? timestamp : ""}
      </p>
    </div>
  );
}

export default ParticipantCard;
