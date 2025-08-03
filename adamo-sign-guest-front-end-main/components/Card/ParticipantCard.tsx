"use client";

import { useTranslations } from "next-intl";

import { CancelIcon, CheckCircleIcon, ClockIcon } from "../icon";

export interface Participant {
  recipientEmail: string;
  recipientsName: string;
  status: "pending" | "sent" | "signed" | "rejected";
  timestamp?: string | null;
}

const getStatusIcon = (status: string) => {
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

function ParticipantCard({ participant }: { participant: Participant }) {
  const t = useTranslations("ParticipantCard");
  const { status, timestamp, recipientsName } = participant;

  return (
    <div className="bg-neutral-50 p-6 rounded-3xl hover:bg-adamo-sign-100">
      <div className="flex gap-x-4 items-center">
        {getStatusIcon(status)}
        <p className="text-neutral-700 font-semibold">{recipientsName}</p>
      </div>
      <p className="text-sm mt-2 text-neutral-400">
        {t(status)}{" "}
        {timestamp
          ? new Date(timestamp).toLocaleString("es-CO", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : ""}
      </p>
    </div>
  );
}

export default ParticipantCard;
