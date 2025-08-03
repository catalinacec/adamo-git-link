"use client";

import { Signature } from "@/types";

import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Participant } from "@/components/Card/ParticipantCard";
import { ParticipantsModal } from "@/components/Modals/ParticipantsModal";
import { AccountCircleFilledIcon, CancelIcon } from "@/components/icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PdfViewer } from "@/components/ui/PdfViewer";

export default function Page() {
  const t = useTranslations("HomePage");
  const tg = useTranslations("Global");

  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [ownerName, setOwnerName] = useState("");
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw =
      sessionStorage.getItem("rejectedData") ||
      sessionStorage.getItem("initialData");
    if (!raw) return;

    const { document: doc, signerId } = JSON.parse(raw);
    setDocument(doc);

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

    const sigs: Signature[] = [];
    const parts: Participant[] = [];

    if (Array.isArray(doc.participants)) {
      doc.participants.forEach((p: any) => {
        const fullName =
          `${p.first_name?.trim() || ""} ${p.last_name?.trim() || ""}`.trim();

        // construir firmas
        p.signatures?.forEach((s: any) => {
          sigs.push({
            id: s.id,
            recipientEmail: s.recipientEmail,
            recipientsName: fullName,
            signatureText: s.signatureText || "",
            signature: "",
            signatureIsEdit: false,
            slideIndex: s.slideIndex,
            left: s.left,
            top: s.top,
            width: s.width,
            height: s.height,
            signatureContentFixed: false,
          });
        });

        // construir datos de participante
        parts.push({
          recipientEmail: p.signatures?.[0]?.recipientEmail || "", // fallback
          recipientsName: fullName,
          status: p.status || "pending",
          timestamp: p.updatedAt || undefined,
        });
      });
    }

    setSignatures(sigs);
    setParticipants(parts);

    const url = sessionStorage.getItem("rejectedPdfUrl") || "";
    setPdfUrl(url);
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
            <Badge variant="error">
              <CancelIcon className="text-error-500" />
              {tg("rejected")}
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
            <PdfViewer
              setCurrentSlideIndex={() => {}}
              currentSlideIndex={0}
              activeRecipientEmail=""
              setPdfLoad={() => {}}
              queryPdfUrl={pdfUrl}
              signatures={signatures}
              viewerRef={viewerRef}
              pdfLink={pdfUrl}
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
