"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Card } from "@/components/Card";
import ParticipantCard, {
  Participant,
} from "@/components/Card/ParticipantCard";
import {
  AccountCircleIcon,
  CancelIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ApprovedData {
  document: {
    filename: string;
    createdAt: string;
    participants: Array<{
      uuid: string;
      _id: string;
      first_name: string;
      last_name: string;
      email: string;
      signatures: Array<unknown>;
      status: "pending" | "sent" | "signed" | "rejected";
      historySignatures: {
        signedAt: string | null;
        hasSigned: boolean;
      };
    }>;
    metadata?: {
      versions?: Array<{ url: string }>;
      url?: string;
    };
  };
  signerId: string;
  pdfLink: string;
  activeUser: string;
}

export default function ApprovedPage() {
  const t = useTranslations("ApprovedPage");
  const tg = useTranslations("Global");
  const router = useRouter();

  const [documentData, setDocumentData] = useState<
    ApprovedData["document"] | null
  >(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<string>("");
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);

  useEffect(() => {
    try {
      const json = sessionStorage.getItem("approvedData");
      if (!json) {
        console.warn("No approvedData en sessionStorage");
        return;
      }
      const { document, signerId }: ApprovedData = JSON.parse(json);

      const activeUser = document.participants.find((p) => p.uuid === signerId);
      console.log("🚀 ~ useEffect ~ activeUser:", activeUser);
      setDocumentData(document);
      const { metadata } = document;
      const versions = metadata?.versions || [];
      const pdfUrl =
        versions.length > 0 ? versions[versions.length - 1].url : metadata?.url;

      setPdfLink(pdfUrl ?? null);
      setActiveUser(activeUser?.first_name + " " + activeUser?.last_name);

      // Construir lista de participantes para las tarjetas
      const list: Participant[] = document.participants.map((p) => ({
        recipientEmail: p.email,
        recipientsName: `${p.first_name.trim()} ${p.last_name.trim()}`.trim(),
        status: p.status,
        timestamp: p.historySignatures.signedAt,
      }));

      setParticipantsList(list);
    } catch (e) {
      console.error("Error leyendo approvedData:", e);
    }
  }, []);

  const onViewClick = () => {
    if (pdfLink) {
      router.push(`/approved/document`);
    }
  };

  if (!documentData) {
    return null; // o spinner
  }

  // Evitar duplicados por email
  const uniqueParticipants = Array.from(
    new Map(participantsList.map((p) => [p.recipientEmail, p])).values(),
  );

  // Totales para badges
  const totalParticipants = documentData.participants.length;
  const signedCount = documentData.participants.filter(
    (p) => p.status === "signed",
  ).length;
  const rejectedCount = documentData.participants.filter(
    (p) => p.status === "rejected",
  ).length;

  return (
    <div className="max-w-[1264px] mx-auto px-6 space-y-4 mt-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-x-6">
          <div className="shrink-0 p-5">
            <Image
              width={48}
              height={48}
              src="/filledIcons/check_circle.svg"
              alt=""
            />
          </div>
          <div className="space-y-4">
            <h2 className="font-bold text-neutral-700">{t("header.title")}</h2>
            <p className="text-neutral-700">{t("header.subtitle")}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 items-start">
        {/* Panel Principal */}
        <Card>
          <h4 className="font-bold text-neutral-700">
            {documentData.filename}
          </h4>
          <div className="mt-8">
            <div className="bg-neutral-50 rounded-3xl p-6">
              <div className="flex gap-x-4 items-center">
                <div className="bg-adamo-sign-100 p-2.5 rounded-xl inline-block shrink-0">
                  <AccountCircleIcon />
                </div>
                <p className="text-neutral-700 font-semibold">{activeUser}</p>
              </div>
              <p className="mt-2 text-sm text-neutral-700">
                {new Date(documentData.createdAt).toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <Badge>
                {signedCount}/{totalParticipants} {tg("signatures")}
              </Badge>

              {rejectedCount > 0 ? (
                <Badge variant="error" type="negative">
                  <CancelIcon />
                  {tg("rejected")}
                </Badge>
              ) : signedCount === totalParticipants ? (
                <Badge variant="success" type="negative">
                  <CheckCircleIcon />
                  {tg("docSigned")}
                </Badge>
              ) : (
                <Badge variant="process" type="negative">
                  <ClockIcon />
                  {tg("inProcess")}
                </Badge>
              )}
            </div>

            <Button onClick={onViewClick} className="mt-10">
              {tg("viewDocument")}
            </Button>
          </div>
        </Card>

        {/* Panel de Participantes */}
        <Card>
          <h4 className="font-bold text-neutral-700">
            {tg("participantsOfDocument")}
          </h4>
          <div className="mt-8 space-y-2">
            {uniqueParticipants.map((participant) => (
              <ParticipantCard
                key={participant.recipientEmail}
                participant={participant}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
