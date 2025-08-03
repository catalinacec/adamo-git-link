"use client";

import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Participant } from "@/components/Card/ParticipantCard";
import { ParticipantsModal } from "@/components/Modals/ParticipantsModal";
import { AccountCircleFilledIcon, CheckCircleIcon } from "@/components/icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FinalPdf } from "@/components/ui/FinalPdf";

export default function Page() {
  const t = useTranslations("HomePage");
  const tg = useTranslations("Global");

  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [ownerName, setOwnerName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw =
      sessionStorage.getItem("approvedData") ||
      sessionStorage.getItem("initialData");
    if (!raw) return;

    console.log("🚀 ~ useEffect ~ raw:", raw);
    const { document: doc, signerId } = JSON.parse(raw);
    setDocument(doc);
    const { metadata } = doc || {};
    const versions = metadata?.versions || [];
    const pdfUrl =
      versions.length > 0 ? versions[versions.length - 1].url : metadata?.url;

    const participant =
      (Array.isArray(doc.participants) &&
        doc.participants.find((p: any) => p.uuid === signerId)) ||
      (Array.isArray(doc.participants) && doc.participants[0]) ||
      null;
    if (participant) {
      const full =
        `${participant.first_name?.trim() || ""} ${participant.last_name?.trim() || ""}`.trim();
      setOwnerName(full);
    }

    const parts: Participant[] = [];
    if (Array.isArray(doc.participants)) {
      doc.participants.forEach((p: any) => {
        const fullName =
          `${p.first_name?.trim() || ""} ${p.last_name?.trim() || ""}`.trim();
        parts.push({
          recipientEmail: p.email || p.signatures?.[0]?.recipientEmail || "",
          recipientsName: fullName,
          status: p.status || "pending",
          timestamp: p.historySignatures?.signedAt || p.updatedAt || undefined,
        });
      });
    }
    setParticipants(parts);

    setPdfUrl(pdfUrl || "");
  }, []);

  if (!document) return null;

  return (
    <>
      <div className="mt-4 px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex items-center gap-x-4">
            <p className="text-sm font-bold text-neutral-700">
              {document.filename}
            </p>
            <p className="text-neutral-700 items-center gap-x-2 hidden xl:flex">
              <AccountCircleFilledIcon />
              <span>{ownerName}</span>
            </p>
          </div>

          <div className="flex lg:justify-center items-center gap-x-6 lg:order-2">
            <Badge variant="success">
              <CheckCircleIcon className="text-success-500" />
              {tg("docSigned")}
            </Badge>
          </div>

          <div className="flex items-center lg:justify-end gap-x-4 lg:order-3">
            <p className="text-neutral-400 flex text-sm items-center gap-x-2">
              <AccountCircleFilledIcon />
              <span>{t("participants", { count: participants.length })}</span>
            </p>
            <div className="lg:hidden">
              <Button
                size="medium"
                variant="link"
                onClick={() => setIsParticipantsModalOpen(true)}
              >
                {t("viewSigns")}
              </Button>
            </div>
            <div className="hidden lg:block">
              <Button
                size="medium"
                variant="secondary"
                onClick={() => setIsParticipantsModalOpen(true)}
              >
                {t("viewSigns")}
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-neutral-100 border border-neutral-200 rounded-3xl p-10 mt-4">
          {pdfUrl ? (
            <FinalPdf
              setCurrentSlideIndex={() => {}}
              currentSlideIndex={0}
              queryPdfUrl={pdfUrl}
              pdfLink={pdfUrl}
              viewerRef={viewerRef}
            />
          ) : (
            <p>No PDF available</p>
          )}
        </div>
      </div>

      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={participants}
      />
    </>
  );
}
