// app/rejected/page.tsx
"use client";

import botUseCase from "@/api/useCases/botUseCase";

import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/Card";
import ParticipantCard, {
  Participant,
} from "@/components/Card/ParticipantCard";
import { AccountCircleIcon, ClockIcon } from "@/components/icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// app/rejected/page.tsx

// app/rejected/page.tsx

interface RejectedData {
  document: {
    filename: string;
    createdAt: string;
    participants: Array<{
      uuid: string;
      first_name: string;
      last_name: string;
      email: string;
      status: "pending" | "sent" | "signed" | "rejected";
      historySignatures: {
        signedAt: string | null;
        rejectedAt: string | null;
        hasSigned: boolean;
        hasRejected: boolean;
      };
    }>;
  };
  signerId: string;
}

export default function RejectedPage() {
  const t = useTranslations("RejectedPage");
  const tg = useTranslations("Global");

  const hasSentBotRef = useRef(false);

  const [document, setDocument] = useState<RejectedData["document"] | null>(
    null,
  );
  const [ownerName, setOwnerName] = useState<string>("");
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);

  useEffect(() => {
    try {
      const json = sessionStorage.getItem("rejectedData");
      if (!json) return;

      const { document: doc, signerId } = JSON.parse(json) as RejectedData;
      setDocument(doc);

      // Nombre del que rechazó
      const rej = doc.participants.find((p) => p.uuid === signerId);
      if (rej) {
        setOwnerName(`${rej.first_name.trim()} ${rej.last_name.trim()}`.trim());
      }

      // Mapear todos los participantes con su estado y fecha
      const list: Participant[] = doc.participants.map((p) => ({
        recipientEmail: p.email,
        recipientsName: `${p.first_name.trim()} ${p.last_name.trim()}`.trim(),
        status: p.historySignatures.hasRejected
          ? "rejected"
          : p.historySignatures.hasSigned
            ? "signed"
            : "pending",
        timestamp: p.historySignatures.hasRejected
          ? p.historySignatures.rejectedAt
          : p.historySignatures.signedAt,
      }));

      setParticipantsList(list);
    } catch (e) {
      console.error("Error leyendo rejectedData:", e);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("tokenData");
    // evita enviar más de una vez
    if (hasSentBotRef.current || !token) return;
    hasSentBotRef.current = true;
    const sendBot = async () => {
      try {
        const response = await botUseCase.rejectedDocumentBot({
          token: token || "",
        });
        if (response?.to && typeof response.to === "number") {
          window.location.href = `https://wa.me/+13156233678`;
        }
      } catch (e) {
        console.error("Error sending signed bot:", e);
      }
    };
    sendBot();
  }, []);

  if (!document) return null;

  // Evitar duplicados
  const uniqueParticipants = Array.from(
    new Map(participantsList.map((p) => [p.recipientEmail, p])).values(),
  );

  const total = document.participants.length;
  const signedCount = document.participants.filter(
    (p) => p.historySignatures.hasSigned,
  ).length;

  return (
    <div className="max-w-[1264px] mx-auto px-6 space-y-4 mt-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-x-6">
          <div className="shrink-0 p-5">
            <Image
              width={48}
              height={48}
              src="/filledIcons/cancel.svg"
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
        {/* Información del documento rechazado */}
        <Card>
          <h4 className="font-bold text-neutral-700">{document.filename}</h4>
          <div className="mt-8">
            <div className="bg-neutral-50 rounded-3xl p-6">
              <div className="flex gap-x-4 items-center">
                <div className="bg-adamo-sign-100 p-2.5 rounded-xl inline-block shrink-0">
                  <AccountCircleIcon />
                </div>
                <p className="text-neutral-700 font-semibold">{ownerName}</p>
              </div>
              <p className="mt-2 text-sm text-neutral-700">
                {new Date(document.createdAt).toLocaleString("es-CO", {
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
                {signedCount}/{total} {tg("signatures")}
              </Badge>
              <Badge variant="error" type="negative">
                <ClockIcon />
                {tg("rejected")}
              </Badge>
            </div>

            <Button className="mt-10">
              <Link href="/rejected/document">{tg("viewDocument")}</Link>
            </Button>
          </div>
        </Card>

        {/* Lista de participantes */}
        <Card>
          <h4 className="font-bold text-neutral-700">
            {tg("participantsOfDocument")}
          </h4>
          <div className="mt-8 space-y-2">
            {uniqueParticipants.map((p) => (
              <ParticipantCard key={p.recipientEmail} participant={p} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
