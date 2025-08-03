"use client";

//import { participants } from "@/const/participantsSign";
import { Version } from "@/api/types/SignDocumentOwnerType";
import DocumentsUseCase from "@/api/useCases/DocumentUseCase";
import SignDocumentOwnerUseCase from "@/api/useCases/SignDocumentOwnerUseCase";
/* import { useToast } from "@/hooks/use-toast"; */
import { Participant, Signature } from "@/types";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import Link from "next/link";
//import { useDocMenu } from "@/context/DocMenuContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useFile } from "@/context/FileContext";
import { useProfile } from "@/context/ProfileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { SignDocumentModal } from "@/components/Modals/SignDocumentModal";
import { PdfViewer } from "@/components/PdfViewer";
import { useSidebar } from "@/components/Sidebar/Sidebar";
//import SignItem from "@/components/SignItem";
import { AccountCircleFilledIcon, ChevronIcon } from "@/components/icon";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DocMenuStatic } from "@/components/ui/DocMenu";
import { SignatureOverlay } from "@/components/ui/signaturesOverlay";

import { useToast } from "@/hooks/use-toast";

function SignPageContainer() {
  const { setOpen } = useSidebar();
  // const { setOpen: setDocMenuOpen } = useDocMenu();
  const {
    setCurrentSlideIndex,
    currentSlideIndex,
    signatures,
    setPdfLoad,
    setViewerRef,
    pdfLink,
    setPdfLink,
    queryPdfUrl,
    setQueryPdfUrl,
    participants,
    setParticipants,
    activeRecipientEmail,
    setActiveRecipientEmail,
    viewerRef,
    setActiveSignature,
    setSignatures,
    documentName,
    activeSignature,
    setLoading,
  } = useSignatureData();

  const { email, name, lastName } = useProfile();

  const { file } = useFile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Document metadata
  const [_documentName, setDocumentName] = useState("");
  const [_activeUserOfQuery, setActiveUserOfQuery] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [signerId, setSignerId] = useState<string | null>(null);

  /*   const [selectedFile, setSelectedFile] = useState<File | null>(null); */
  const t = useTranslations("SignPageContainer");
  const { toast } = useToast();

  const router = useRouter();
  const searchParams = useSearchParams();

  const formatCreatedAt = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${day}/${month}/${year} ${t("at")} ${displayHours}:${minutes} ${period}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
  }, [setOpen]);

  useEffect(() => {
    if (viewerRef.current) {
      setViewerRef(viewerRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerRef, setViewerRef]);

  // --- SELF-SIGNATURE HANDLING ---
  // On mount, check if there are self-signatures and meta in sessionStorage (set by Step4 when user clicks "Firmar documento")
  useEffect(() => {
    const selfSignaturesRaw = sessionStorage.getItem("selfSignatures");
    const selfSignMetaRaw = sessionStorage.getItem("selfSignMeta");
    //let used = false;
    if (selfSignaturesRaw) {
      try {
        const selfSignatures = JSON.parse(selfSignaturesRaw);
        if (Array.isArray(selfSignatures) && selfSignatures.length > 0) {
          setSignatures(selfSignatures);
          if (selfSignatures[0]?.recipientEmail) {
            setActiveRecipientEmail(selfSignatures[0].recipientEmail);
          }
          //used = true;
        }
      } catch {
        // Ignore parse errors
      }
      sessionStorage.removeItem("selfSignatures");
    }
    if (selfSignMetaRaw) {
      try {
        const meta = JSON.parse(selfSignMetaRaw);
        if (meta && meta.documentId) setDocumentId(meta.documentId);
        if (meta && meta.signerId) setSignerId(meta.signerId);
        if (meta && meta.documentName) setDocumentName(meta.documentName);
        if (meta && meta.pdfUrl) {
          setPdfLink(meta.pdfUrl);
          setQueryPdfUrl(meta.pdfUrl);
        }
        if (meta && meta.activeUser) setActiveUserOfQuery(meta.activeUser);
        //used = true;
      } catch {
        // Ignore parse errors
      }
      sessionStorage.removeItem("selfSignMeta");
    }
    // Si se usó selfSignatures/meta, no hacer fetchData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof file === "string" && file.startsWith("http")) {
      setPdfLink(file);
      setSelectedFile(null);
    } else if (file instanceof File) {
      setSelectedFile(file);
      setPdfLink(null);
    }
  }, [file, setPdfLink]);

  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const documentIdFormUrl = params.id as string;

      try {
        const res = await DocumentsUseCase.getDocumentById(documentIdFormUrl);
        const data = res.data;

        if (!data) return;

        if (data.status === "rejected") {
          sessionStorage.setItem("rejectedData", JSON.stringify(data));
          sessionStorage.setItem("rejectedPdfUrl", data.metadata?.url || "");
          router.push("/rejected");
          return;
        }

        const participant = data.participants.find(
          (p: any) => p.email === email,
        );
        const uuid = participant ? participant.uuid : null;

        if (!uuid) return;

        setDocumentName(data.filename);
        setDocumentId(data.documentId);
        setSignerId(uuid);
        sessionStorage.setItem("initialData", JSON.stringify(data));
        sessionStorage.setItem("rejectedPdfUrl", data.metadata?.url || "");

        // — Cambiado: seleccionamos URL directa de metadata o última versión —

        const { metadata } = data;
        const versions: Version[] = metadata.versions || [];
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
        data.participants.forEach((participant: any) => {
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
        const activePart = data.participants.find(
          (p: any) => p.email === email,
        );
        if (activePart) {
          setActiveRecipientEmail(activePart.email);
          setActiveUserOfQuery(
            `${activePart.first_name} ${activePart.last_name}`,
          );
        }

        setSignatures(allSignatures);

        // Establecer participantes para el modal
        const participantsList: Participant[] = data.participants.map(
          (p: any) => ({
            recipientEmail: p.email,
            recipientsName:
              `${p.first_name?.trim() || ""} ${p.last_name?.trim() || ""}`.trim(),
            status: p.status,
            timestamp: p.historySignatures?.signedAt
              ? formatCreatedAt(p.historySignatures.signedAt)
              : p.historySignatures?.rejectedAt
                ? formatCreatedAt(p.historySignatures.rejectedAt)
                : "",
            firstName: p.first_name || "",
            lastName: p.last_name || "",
            email: p.email || "",
            color: p.color || "",
            listContact: p.listContact || [],
          }),
        );
        setParticipants(participantsList);
      } catch (err) {
        console.error("fetchData error:", err);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const handleFinish = async () => {
    setLoading(true);
    const abortController = new AbortController();
    try {
      // Filter signatures to find the user's signature
      console.log("signatures active: ", activeRecipientEmail);
      console.log("signatures: ", signatures);

      const userSigs = signatures.filter(
        (sig) => sig.recipientEmail === activeRecipientEmail,
      );
      console.log("userSigs", userSigs);

      if (userSigs.length === 0) {
        alert("No hay firmas para procesar");
        return;
      }
      const sig = userSigs[0]; // Assuming only one signature per user

      // Process each signature (only the user's signatures)
      /*  for (const sig of userSignatures) { */
      let signatureFile: File | undefined;
      let signatureType: string = sig.signatureType || "text";
      let signatureText: string | undefined = sig.signatureText;
      let signatureFontFamily: string | undefined =
        sig.signatureFontFamily || "Arial";
      let signature: any = undefined;

      // Write signature to file
      if (signatureType === "draw" || signatureType === "upload") {
        signatureType = "image";
        // Convertir DataURL a File
        const dataUrl = sig.signature;
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
            `sig_${sig.id}.${mime.split("/")[1]}`,
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
        signatureText = sig.signatureText;
        signatureFontFamily = sig.signatureFontFamily || "Arial";
      } else {
        alert("Tipo de firma no soportado");
        return;
      }

      const signParams = {
        documentId: documentId!,
        signerId: signerId!,
        signId: sig.id,
        signature,
        signatureType,
        signatureText,
        signatureFontFamily,
        signal: abortController.signal,
      };

      const signRes = await SignDocumentOwnerUseCase.signDocument(signParams);
      if (!signRes.data) throw new Error(signRes.message);

      const newVersions = signRes.data.metadata.versions || [];
      const lastUrl =
        newVersions.length > 0
          ? newVersions[newVersions.length - 1].url
          : signRes.data.metadata.url;

      sessionStorage.setItem(
        "approvedData",
        JSON.stringify({
          document: signRes.data,
          signerId,
          pdfLink: lastUrl,
          activeUser: activeRecipientEmail,
        }),
      );

      router.push("/documents/pending");
      toast({
        title: "Firmado exitosamente",
        description: "El documento fue firmado correctamente.",
      });
    } catch (error) {
      console.error("Error al firmar el documento: ", error);
      alert("¡Error al firmar el documento! " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${name || ""} ${lastName || ""}`.trim();

  return (
    <>
      <Container>
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="flex justify-between items-center bg-adamo-sign-25 py-2">
            <Link
              className="inline-flex gap-x-4 items-center"
              href={"/documents/pending"}
            >
              <ChevronIcon className="transform rotate-90" />
              <span className="font-semibold text-neutral-800">
                {t("pendingHeading")}
              </span>
            </Link>

            <Button
              size="medium"
              variant="secondary"
              className="md:hidden"
              onClick={() => handleFinish()}
            >
              {t("viewSigns")}
            </Button>
          </div>

          <div className="flex items-center gap-x-4 py-4">
            <div className="flex gap-x-4 items-center ">
              <p className="text-sm font-bold text-neutral-700">
                {documentName || t("noDocumentName")}
              </p>

              <p className="flex gap-x-2 items-center">
                <AccountCircleFilledIcon className="text-neutral-700" />
                <span className="text-sm text-neutral-700">
                  {fullName || t("noName")}
                </span>
              </p>
            </div>

            <div className="hidden md:block xl:hidden">
              <Button
                size="medium"
                variant="secondary"
                onClick={() => handleFinish()}
              >
                {t("viewSigns")}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-x-8 mt-4">
          <DocMenuStatic
            participants={participants}
            onShowSignModal={() => handleFinish()}
          />
          <div className="flex-1 rounded-3xl border border-neutral-200 bg-neutral-25 p-6">
            <PdfViewer
              setCurrentSlideIndex={setCurrentSlideIndex}
              currentSlideIndex={currentSlideIndex}
              activeRecipientEmail={activeRecipientEmail}
              setPdfLoad={setPdfLoad}
              signatures={signatures}
              queryPdfUrl={queryPdfUrl}
              viewerRef={viewerRef}
              pdfLink={pdfLink}
              file={selectedFile}
            />
            <SignatureOverlay
              signatures={signatures}
              activeRecipientEmail={activeRecipientEmail}
              viewerRef={viewerRef}
              pdfLoad={false}
              onEdit={(sig) => {
                setActiveSignature(sig);
                setIsModalOpen(true);
              }}
            />
          </div>
        </div>
      </Container>

      <SignDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeSignature={activeSignature}
        setSignatures={setSignatures}
        signatures={signatures}
      />
    </>
  );
}

export default SignPageContainer;
