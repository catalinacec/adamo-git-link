"use client";

import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import DocumentsUseCase from "@/api/useCases/DocumentUseCase";
import AWS from "aws-sdk";

import React, { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { TableWrapper } from "@/components/DocumentsTable";
import { Table } from "@/components/DocumentsTable/Table";
import { UploadDocForm } from "@/components/Form/UploadDocForm/UploadDocForm";

import { useToast } from "@/hooks/use-toast";

import { Button } from "../ui/Button";

// Modal para eliminar
const DeleteDocModal = dynamic(
  () =>
    import("@/components/Modals/DeleteDocModal").then(
      (mod) => mod.DeleteDocModal,
    ),
  { ssr: false },
);
export interface TableContainerProps {
  fetchDocuments?: typeof DocumentsUseCase.listDocuments;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  fetchDocuments,
}) => {
  const { toast } = useToast();
  const {
    setPdfLink,
    setDocumentName,
    setSignatures,
    setParticipants,
    resetContext,
  } = useSignatureData();
  const { setFile, setFileName } = useFile();
  const t = useTranslations("AppDocuments.Stats.DraftDocuments");

  const [documents, setDocuments] = useState<DocumentsListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [selectedDoc, setSelectedDoc] = useState<DocumentsListResponse | null>(
    null,
  );

  useEffect(() => {
    fetchDocumentsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const fetchDocumentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const abortController = new AbortController();
      const fnFetch = fetchDocuments ?? DocumentsUseCase.listDocuments;

      // Llamada con la misma firma que DocumentUseCase.listDocuments
      const response = await fnFetch({
        page: 1,
        limit: 5,
        status: "",
        signal: abortController.signal,
      });

      // response.data puede ser DocumentsListResponse[] o null
      const arr: DocumentsListResponse[] = Array.isArray(response.data)
        ? response.data
        : [];

      const sorted = arr
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setDocuments(sorted);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || t("errorLoading"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (ids: string[]) => {
    setDeleteTargetIds(ids);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetIds.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleting(true);
    const abortController = new AbortController();
    try {
      let response;
      if (deleteTargetIds.length === 1) {
        response = await DocumentsUseCase.deleteDocument(
          deleteTargetIds[0],
          abortController.signal,
        );
      } else {
        response = await DocumentsUseCase.bulkDeleteDocument(
          { ids: deleteTargetIds },
          abortController.signal,
        );
      }

      if (response && response.data) {
        setDocuments((prev) =>
          prev.filter((doc) => !deleteTargetIds.includes(doc._id)),
        );
        toast({ title: t("deletedSuccess") || "Eliminado exitosamente" });
        await fetchDocumentsData();
      } else {
        toast({
          title: t("deleteError") || "Error al eliminar",
          variant: "error",
        });
      }
    } catch {
      toast({
        title: t("deleteError") || "Error al eliminar",
        variant: "error",
      });
    } finally {
      setDeleteTargetIds([]);
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };

  const handleDocumentClick = async (doc: DocumentsListResponse) => {
    setPdfLink(doc.metadata.url);
    setDocumentName(doc.filename);
    setSelectedDoc(doc);

    const participians = doc.participants.map((p, index) => ({
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      color: p.signatures?.[index]?.color || "#000000",
      listContact: false,
      status: "send",
      docUrl: doc.metadata.url,
    }));
    setParticipants(participians);

    const allSignatures: any[] = [];
    doc.participants.forEach((participant) => {
      participant.signatures?.forEach((sig) => {
        allSignatures.push({
          id: sig.id || sig._id || `signature-${Date.now()}-${Math.random()}`,
          left: sig.left || 0,
          top: sig.top || 0,
          position: undefined,
          color: sig.color || "#FEAD23",
          width: sig.width || 150,
          height: sig.height || 75,
          rotation: sig.rotation || 0,
          slideIndex: sig.slideIndex || 0,
          signatureText: sig.signatureText || "",
          recipientsName:
            sig.recipientsName ||
            `${participant.first_name} ${participant.last_name}`,
          recipientEmail: sig.recipientEmail || participant.email,
          slideElement:
            typeof sig.slideElement === "string"
              ? document.getElementById(sig.slideElement) || undefined
              : sig.slideElement,
          signature: undefined,
          signatureContentFixed: sig.signatureContentFixed || false,
          signatureDelete: sig.signatureDelete || false,
          signatureIsEdit: sig.signatureIsEdit || false,
        });
      });
    });
    setSignatures(allSignatures);

    try {
      if (doc.metadata.s3Key) {
        const s3 = new AWS.S3({
          region: process.env.NEXT_PUBLIC_REGION,
          credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_ACCESSKEYID!,
            secretAccessKey: process.env.NEXT_PUBLIC_SECRETACCESSKEY!,
          },
        });

        const data = await s3
          .getObject({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
            Key: doc.metadata.s3Key,
          })
          .promise();

        const buffer = await (data.Body as Blob)?.arrayBuffer?.();
        const blob = new Blob([buffer], {
          type: doc.metadata.mimetype || "application/pdf",
        });
        const file = new File([blob], doc.filename, { type: blob.type });
        setFile(file);
        setFileName(doc.filename);
      } else if (doc.metadata.url) {
        const res = await fetch(doc.metadata.url);
        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], {
          type: doc.metadata.mimetype || "application/pdf",
        });
        const file = new File([blob], doc.filename, { type: blob.type });
        setFile(file);
        setFileName(doc.filename);
      }
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
    }

    setSelectedDoc(doc);
  };

  const handleBackFromUpload = () => {
    setSelectedDoc(null);
    resetContext();
    fetchDocumentsData();
  };

  if (selectedDoc) {
    return (
      <div className="space-y-4 ml-3">
        <UploadDocForm
          key={selectedDoc?.documentId}
          isDraftMode={true}
          onBack={handleBackFromUpload}
          initialStep={4}
        />
      </div>
    );
  }

  return (
    <TableWrapper>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-neutral-800">
          {t("latestDocuments") || "Últimos documentos"}
        </h3>
        <Button variant="link" asChild>
          <Link href="/documents/list">{t("viewAll") || "Ver todos"}</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-neutral-600">{t("loading") || "Cargando..."}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : documents.length > 0 ? (
        <Table
          documents={documents}
          onDeleteRow={(id: string) => handleDelete([id])}
          onRowClick={(doc: DocumentsListResponse) => handleDocumentClick(doc)}
        />
      ) : (
        <p className="text-neutral-600 p-4">
          {t("noDocuments") || "No hay documentos."}
        </p>
      )}

      <DeleteDocModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetIds([]);
        }}
        onDelete={handleConfirmDelete}
        isLoading={isDeleting}
        deleteCount={deleteTargetIds.length}
      />
    </TableWrapper>
  );
};
