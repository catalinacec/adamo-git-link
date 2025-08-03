"use client";

import { verifyTokenParams } from "@/api/types/DocumentsTypes";
import { GeneralResponse } from "@/api/types/GeneralTypes";
import documentsUseCase from "@/api/useCases/DocumentsUseCase";
import { Signature } from "@/types";
import LinearProgress from "@mui/material/LinearProgress";

import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

import { Participant } from "@/components/Card/ParticipantCard";
import { ParticipantsModal } from "@/components/Modals/ParticipantsModal";
import { RejectDocumentModal } from "@/components/Modals/RejectDocumentModal";
import { SignDocumentModal } from "@/components/Modals/SignDocumentModal";
import { AccountCircleFilledIcon } from "@/components/icon";
import { Button } from "@/components/ui/Button";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { SignatureOverlay } from "@/components/ui/SignatureOverlay";

import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // UI & loading state
  const [loading, setLoading] = useState(false);
  const [pdfLoad, setPdfLoad] = useState(true);
  const [disableButton, setDisableButton] = useState(true);

  // Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Document metadata
  const [initialData, setInitialData] = useState<any>(null);
  const [documentName, setDocumentName] = useState("");
  const [activeUserOfQuery, setActiveUserOfQuery] = useState("");
  const [activeRecipientEmail, setActiveRecipientEmail] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);

  // PDF viewing
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [queryPdfUrl, setQueryPdfUrl] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Signatures
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeSignature, setActiveSignature] = useState<Signature | null>(
    null,
  );
  const [typedSignature, setTypedSignature] = useState("");
  const [, setIsEditingSignature] = useState(false);

  // --- Fetch & initialize ---
  useEffect(() => {
    const fetchData = async () => {
      const token = searchParams.get("data");
      sessionStorage.setItem("tokenData", JSON.stringify(token));
      if (!token) return;
      setVerifyToken(token);

      try {
        const params: verifyTokenParams = { token };
        const res: GeneralResponse<any> =
          await documentsUseCase.verifyToken(params);
        if (!res.data) throw new Error(res.message);

        const data = res.data;
        setInitialData(data);

        if (data.document.status === "rejected") {
          sessionStorage.setItem("rejectedData", JSON.stringify(data));
          sessionStorage.setItem(
            "rejectedPdfUrl",
            data.document.metadata?.url || "",
          );
          router.push("/rejected");
          return;
        }
        if (data.document.status === "completed") {
          sessionStorage.setItem("approvedData", JSON.stringify(data));
          sessionStorage.setItem(
            "approvedPdfUrl",
            data.document.metadata?.url || "",
          );
          router.push("/approved");
          return;
        }

        setDocumentName(data.document.filename);
        setDocumentId(data.document.documentId);
        setSignerId(data.signerId);
        sessionStorage.setItem("initialData", JSON.stringify(data));
        sessionStorage.setItem(
          "rejectedPdfUrl",
          data.document.metadata?.url || "",
        );

        // — Cambiado: seleccionamos URL directa de metadata o última versión —
        const { metadata } = data.document;
        const versions = metadata?.versions || [];
        const pdfUrl =
          versions.length > 0
            ? versions[versions.length - 1].url
            : metadata.url;

        setPdfLink(pdfUrl);
        setQueryPdfUrl(pdfUrl);
        setTimeout(() => setPdfLoad(false), 100);
        // ————————————————————————————————————————————————

        // Preparar firmas de TODOS los participantes
        const allSignatures: Signature[] = [];
        data.document.participants.forEach((participant: any) => {
          participant.signatures.forEach((s: any) => {
            allSignatures.push({
              ...s,
              recipientEmail: participant.email,
              signature: "",
              signatureIsEdit: false,
              signatureText: s.signatureText || "",
              signatureImage: s.signatureImage || "",
            });
          });
        });

        // Encontrar el participante activo
        const activePart = data.document.participants.find(
          (p: any) => p.uuid === data.signerId,
        );
        if (activePart) {
          setActiveRecipientEmail(activePart.email);
          setActiveUserOfQuery(
            `${activePart.first_name} ${activePart.last_name}`,
          );
        }

        setSignatures(allSignatures);

        // Establecer participantes para el modal
        const participantsList: Participant[] = data.document.participants.map(
          (p: any) => ({
            recipientEmail: p.email,
            recipientsName:
              `${p.first_name.trim()} ${p.last_name.trim()}`.trim(),
            status: p.status,
            timestamp:
              p.historySignatures.signedAt ||
              p.historySignatures.rejectedAt ||
              null,
          }),
        );
        setParticipants(participantsList);
      } catch (err) {
        console.error("fetchData error:", err);
        toast({
          title: t("invalidOrExpiredLink"),
          description: "",
        });
      }
    };
    fetchData();
  }, [searchParams, router]);

  // --- Habilitar Finish sólo cuando el usuario haya firmado ---
  useEffect(() => {
    const userSigs = signatures.filter(
      (sig) => sig.recipientEmail === activeRecipientEmail,
    );
    const allDone = userSigs.every((sig) => sig.signatureIsEdit);
    setDisableButton(!allDone || userSigs.length === 0);
  }, [signatures, activeRecipientEmail]);

  // --- Handlers ---
  const handleReject = async (reason: string) => {
    setLoading(true);
    try {
      await documentsUseCase.rejectDocument({
        documentId: documentId!,
        signerId: signerId!,
        token: verifyToken!,
        reason,
      });
      sessionStorage.setItem("rejectedData", JSON.stringify(initialData));
      router.push("/rejected");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const userSigs = signatures.filter(
        (sig) =>
          sig.signatureIsEdit && sig.recipientEmail === activeRecipientEmail,
      );
      if (userSigs.length === 0) {
        alert("No hay firmas para procesar");
        return;
      }
      const activeSig = userSigs[0];

      let signatureFile: File | undefined;
      let signatureType: string = activeSig.signatureType || "text";
      let signatureText: string | undefined = activeSig.signatureText;
      let signatureFontFamily: string | undefined =
        activeSig.signatureFontFamily || "Arial";
      let signature: any = undefined;

      // Ajuste: Si es draw o upload, enviar como "image"
      if (signatureType === "draw" || signatureType === "upload") {
        signatureType = "image";
        // Convertir DataURL a File
        const dataUrl = activeSig.signature;
        if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
          const arr = dataUrl.split(",");
          const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          signatureFile = new File(
            [u8arr],
            `sig_${activeSig.id}.${mime.split("/")[1]}`,
            { type: mime },
          );
          signature = signatureFile;
        } else {
          alert("La firma de imagen no tiene un formato válido");
          return;
        }
        signatureText = undefined;
        signatureFontFamily = undefined;
      } else if (signatureType === "text") {
        signature = undefined;
        signatureText = activeSig.signatureText;
        signatureFontFamily = activeSig.signatureFontFamily || "Arial";
      } else {
        alert("Tipo de firma no soportado");
        return;
      }

      const signParams = {
        token: verifyToken!,
        documentId: documentId!,
        signerId: signerId!,
        signId: activeSig.id,
        signature,
        signatureType,
        signatureText,
        signatureFontFamily,
      };

      const signRes = await documentsUseCase.signDocument(signParams);
      if (!signRes.data) throw new Error(signRes.message);

      const newVersions = signRes.data.metadata.versions || [];
      const lastUrl =
        newVersions.length > 0
          ? newVersions[newVersions.length - 1].url
          : signRes.data.metadata.url;

      // --- NUEVO: Redirección según status ---
      const docStatus = signRes.data.status;
      const sessionData = {
        document: signRes.data,
        signerId,
        pdfLink: lastUrl,
        activeUser: activeRecipientEmail,
      };

      if (docStatus === "in_progress") {
        sessionStorage.setItem("processData", JSON.stringify(sessionData));
        router.push("/process");
      } else if (docStatus === "completed") {
        sessionStorage.setItem("approvedData", JSON.stringify(sessionData));
        router.push("/approved");
      } else {
        // fallback: por si acaso
        sessionStorage.setItem("approvedData", JSON.stringify(sessionData));
        router.push("/approved");
      }
      // --- FIN NUEVO ---
    } catch (err) {
      console.error("handleFinish error:", err);
      alert("Error al finalizar el documento: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Conteo de participantes
  const uniqueCount = new Set(signatures.map((s) => s.recipientEmail)).size;
  const participantLabel =
    uniqueCount > 1
      ? t("participants", { count: uniqueCount - 1 })
      : "Only You";

  return (
    <>
      {/* Header */}
      <div className="mt-4 px-4 md:px-8">
        <div className="grid lg:grid-cols-3 lg:gap-6">
          <div className="order-2 flex justify-center items-center gap-x-6">
            <Button
              disabled={disableButton || loading}
              isLoading={loading}
              onClick={handleFinish}
            >
              {t("signDocumentButton")}
            </Button>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => setIsRejectModalOpen(true)}
            >
              {t("rejectDocumentButton")}
            </Button>
          </div>
          <div className="order-1 flex items-center gap-x-4">
            <p className="font-bold text-neutral-700">{documentName}</p>
            <p className="hidden xl:flex items-center gap-x-2 text-neutral-700">
              <AccountCircleFilledIcon />
              {activeUserOfQuery}
            </p>
          </div>
          <div className="order-3 flex items-center gap-x-4 justify-end">
            <p className="flex items-center gap-x-2 text-neutral-400">
              <AccountCircleFilledIcon />
              {participantLabel}
            </p>
            <Button
              variant="link"
              className="lg:hidden"
              onClick={() => setIsParticipantsModalOpen(true)}
            >
              {t("viewSigns")}
            </Button>
            <Button
              variant="secondary"
              className="hidden lg:block"
              onClick={() => setIsParticipantsModalOpen(true)}
            >
              {t("viewSigns")}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {pdfLoad && <LinearProgress className="my-2" />}

      {/* PDF Viewer + Signature Overlay */}
      <div className="relative flex justify-center flex-grow">
        <PdfViewer
          queryPdfUrl={queryPdfUrl}
          pdfLink={pdfLink}
          setCurrentSlideIndex={setCurrentSlideIndex}
          currentSlideIndex={currentSlideIndex}
          activeRecipientEmail={activeRecipientEmail}
          setPdfLoad={setPdfLoad}
          signatures={signatures}
          viewerRef={viewerRef}
        />
        <SignatureOverlay
          signatures={signatures}
          activeRecipientEmail={activeRecipientEmail}
          viewerRef={viewerRef}
          pdfLoad={pdfLoad}
          onEdit={(sig) => {
            setActiveSignature(sig);
            setTypedSignature(sig.signatureText || "");
            setIsSignModalOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <RejectDocumentModal
        isOpen={isRejectModalOpen}
        loading={loading}
        onClose={() => setIsRejectModalOpen(false)}
        onReject={handleReject}
      />
      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={participants}
      />
      <SignDocumentModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        activeSignature={activeSignature}
        typedSignature={typedSignature}
        activeUserOfQuery={activeUserOfQuery}
        setIsEditingSignature={setIsEditingSignature}
        setSignatures={setSignatures}
        signatures={signatures}
      />
    </>
  );
}
