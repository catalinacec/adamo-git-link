"use client";

import { Participant as ApiParticipant } from "@/api/types/DocumentsTypes";
import DocumentsUseCase from "@/api/useCases/DocumentUseCase";
import { Participant as FrontParticipant, Signature } from "@/types";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { useSignatureData } from "@/context/SignatureContext";

import { Card, CardParticipant } from "@/components/Card";
import { RegisterDocModal } from "@/components/Modals/RegisterDocModal";
import {
  CancelIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  SendIcon,
} from "@/components/icon";
import { AppHeader } from "@/components/ui/AppHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

import { useToast } from "@/hooks/use-toast";

export const DocumentContainer = ({ id }: { id: string }) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const {
    setParticipants,
    setSignatures,
    setDocumentName,
    setPdfLink,
    setDocumentId,
  } = useSignatureData();
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("DocumentStatus");
  /*   if (!document) {
      return null;
    } */

  const formatCreatedAt = (dateString?: string, withLabel: boolean = true) => {
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

      if (withLabel) {
        return `${t("createdAt")} ${day}/${month}/${year} ${t("at")} ${displayHours}:${minutes} ${period}`;
      }
      return `${day}/${month}/${year} ${t("at")} ${displayHours}:${minutes} ${period}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await DocumentsUseCase.getDocumentById(id);
      const doc = response.data;
      setDocument(doc);

      if (doc?.isBlockchainRegistered) {
        setIsRegistered(true);
      }

      const participantsList: FrontParticipant[] = (
        doc?.participants ?? []
      ).map((p: any) => ({
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        email: p.email || "",
        color: p.color || "",
        signerId: p.uuid || "",
        listContact: false,
        rejectionReason: p.historySignatures?.rejectionReason || "",
        timestamp: p.historySignatures?.signedAt
          ? formatCreatedAt(p.historySignatures.signedAt, true)
          : p.historySignatures?.rejectedAt
            ? formatCreatedAt(p.historySignatures.rejectedAt, true)
            : "",
        status: p.status,
        docUrl: doc?.metadata?.url || "",
        photo: p.photo || "",
        id: p._id,
      }));
      setParticipants(participantsList);

      const allSignatures: Signature[] = [];
      doc?.participants?.forEach((participant: any) => {
        participant.signatures?.forEach((sig: any) => {
          allSignatures.push({
            ...sig,
            recipientEmail: participant.email,
            recipientsName:
              `${participant.first_name || ""} ${participant.last_name || ""}`.trim(),
            signatureIsEdit: false,
            id: sig._id || sig.id,
            left: sig.left,
            top: sig.top,
            slideIndex: sig.slideIndex,
            signatureContentFixed: !!sig.signatureContentFixed,
          });
        });
      });
      setSignatures(allSignatures);

      setDocumentName(doc?.filename || "");
      setPdfLink(doc?.metadata?.url || "");
      setDocumentId(doc?._id || "");
    } catch (error) {
      console.error("Error fetching document:", error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    setParticipants,
    setSignatures,
    setDocumentName,
    setPdfLink,
    setDocumentId,
  ]);

  if (loading) return <div className="p-4">{t("loading")}</div>;
  if (!document)
    return <div className="p-4 text-red-500">{t("noDocuments")}</div>;

  // Map participants to FrontParticipant type
  const mappedParticipants: FrontParticipant[] = (
    document?.participants ?? []
  ).map((p: ApiParticipant) => ({
    firstName: p.first_name,
    lastName: p.last_name,
    email: p.email,
    signerId: p.uuid || "",
    listContact: false,
    timestamp: p.historySignatures?.signedAt
      ? formatCreatedAt(p.historySignatures.signedAt, false)
      : p.historySignatures?.rejectedAt
        ? formatCreatedAt(p.historySignatures.rejectedAt, false)
        : "",
    rejectionReason: p.historySignatures?.rejectionReason || "",
    status:
      typeof p.status === "string"
        ? { id: p.status, timestamp: "", helperText: "" }
        : p.status,
    docUrl: document?.metadata?.url || "",
    id: p._id,
  }));

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: t("copyLink"),
      });
    });
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success">
            <CheckCircleIcon className="text-success-500" />
            {t(status)}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="error">
            <CancelIcon className="text-error-500" />
            {t(status)}
          </Badge>
        );
      case "inProgress":
        return (
          <Badge variant="process">
            <ClockIcon className="text-warning-400" />
            {t(status)}
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="neutral">
            <SendIcon className="text-neutral-400" />
            {t(status)}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getLatestSignedVersionUrl = () => {
    const versions = document?.metadata?.versions;
    if (!versions || versions.length === 0) return null;
    // get latest url document version
    return versions[versions.length - 1].url;
  };

  const handleViewDocument = () => {
    const docURL = document.metadata?.url;
    if (docURL) {
      window.open(docURL, "_blank");
    } else {
      toast({
        title: t("noDocumentUrl"),
      });
    }
  };

  const handleRegisterBlockchain = async () => {
    try {
      const response = await DocumentsUseCase.registerBlockchain(
        document.documentId,
      );
      if (response.message === "blockchain actions.updated successfully") {
        setIsRegistered(true);
        setIsOpen(false);
        setTimeout(() => {
          fetchDocument();
        }, 1000);
        toast({
          title: t("registerBlockchainSuccess"),
        });
      } else {
        toast({
          title: t("registerBlockchainError"),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error registering document on blockchain:", error);
      toast({
        title: t("registerBlockchainError"),
        variant: "error",
      });
    }
  };

  // const signedCount = document.participants.filter(
  //   (p: ApiParticipant) => p.status === "signed" || p.status === "rejected",
  // ).length;

  const signedCount = document.participants.filter(
    (p: ApiParticipant) => p.status,
  ).length;

  return (
    <>
      <div className="space-y-4">
        <AppHeader href="/documents/list" heading="Documentos" />

        <Container className="space-y-6">
          <Card>
            <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <h1 className="font-bold text-adamo-sign-700">
                  {document?.filename || ""}
                </h1>
                <p className="text-neutral-700">
                  {formatCreatedAt(document?.createdAt)}
                </p>
              </div>

              <div className="flex gap-4">
                <Badge>
                  {signedCount}/{document.participants.length} {t("signatures")}
                </Badge>

                {renderBadge(document.status)}
              </div>
            </div>

            <div className="mt-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center">
              <Button variant="secondary" onClick={handleViewDocument}>
                {t("viewDocument")}
              </Button>
              {document.status === "completed" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const url = getLatestSignedVersionUrl();
                      if (url) {
                        window.open(url, "_blank");
                      } else {
                        toast({
                          title: t("noSignedVersion"),
                        });
                      }
                    }}
                  >
                    {t("viewSignedDocument")}
                  </Button>

                  {isRegistered ? (
                    <Badge>{t("registeredBlockchain")}</Badge>
                  ) : (
                    <Button
                      onClick={() => setIsOpen(true)}
                      disabled={isRegistered}
                      className="w-full justify-start xs:w-min"
                    >
                      <span className="truncate">
                        {t("registerBlockchain")}
                      </span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          {isRegistered && document.blockchain && (
            <Card className="flex flex-col gap-4 md:flex-row">
              <Input
                label={t("smartContractId")}
                iconRight={
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(document.blockchain.contractId || "")
                    }
                  >
                    <CopyIcon />
                  </button>
                }
                value={document.blockchain.contractId || ""}
                readOnly
              />
              <Input
                label={t("hash")}
                iconRight={
                  <button
                    type="button"
                    onClick={() => handleCopy(document.blockchain.hash || "")}
                  >
                    <CopyIcon />
                  </button>
                }
                value={document.blockchain.hash || ""}
                readOnly
              />
              <Input
                label={t("transactionId")}
                iconRight={
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(document.blockchain.transactionId || "")
                    }
                  >
                    <CopyIcon />
                  </button>
                }
                value={document.blockchain.transactionId || ""}
                readOnly
              />
            </Card>
          )}

          <Card>
            <h2 className="font-bold text-adamo-sign-700">
              {t("participantsDocument")}
            </h2>
            <div className="mt-4 space-y-4">
              {mappedParticipants.map((participant, index) => (
                <CardParticipant
                  key={participant.email}
                  index={index}
                  {...participant}
                  variant="notification"
                  // documentId={document.documentId}
                />
              ))}
            </div>
          </Card>
        </Container>
      </div>

      <RegisterDocModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpload={() => {
          setIsRegistered(true);
          setIsOpen(false);
        }}
        onRegister={handleRegisterBlockchain}
      />
    </>
  );
};
