"use client";

import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import DocumentsUseCase from "@/api/useCases/DocumentUseCase";
import { Participant, Signature } from "@/types";
import AWS from "aws-sdk";

import React, { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { TableWrapper } from "@/components/DocumentsTable";
import { TableDraft } from "@/components/DocumentsTable/TableDraft";
import { UploadDocForm } from "@/components/Form/UploadDocForm/UploadDocForm";
import { DeleteDocModal } from "@/components/Modals/DeleteDocModal";
import { RefreshIcon, SearchIcon, TrashIcon } from "@/components/icon";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/pagination";

import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 9;

export const TableContainer: React.FC = () => {
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

  const [selectedDraft, setSelectedDraft] =
    useState<DocumentsListResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(0),
    endDate: new Date(),
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [documents, setDocuments] = useState<DocumentsListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const abortController = new AbortController();
      const response = await DocumentsUseCase.listDocuments({
        page: 1,
        limit: 1000,
        status: "draft",
        signal: abortController.signal,
      });
      if (response && response.data) {
        setDocuments(response.data);
      } else {
        setError(response.message || t("errorLoading"));
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || t("errorLoading"));
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDocumentsClient = (): DocumentsListResponse[] => {
    const { startDate, endDate } = dateRange;

    return documents.filter((doc) => {
      const docDate = doc.createdAt ? new Date(doc.createdAt) : null;
      const filename = doc.filename || "";

      const matchesSearch =
        !searchTerm ||
        (() => {
          const filenameLower = filename.toLowerCase();
          const termLower = searchTerm.trim().toLowerCase();
          return filenameLower.includes(termLower);
        })();

      const matchesStatus =
        checkedValues.length === 0 || checkedValues.includes(doc.status);

      const matchesDate =
        !docDate || (docDate >= startDate && docDate <= endDate);

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredDocuments = filterDocumentsClient();
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const effectivePage = Math.min(currentPage, totalPages || 1);
  const paginatedDocuments = filteredDocuments.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE,
  );
  const hasSelectedRows = selectedIds.length > 0;

  const handleDelete = (ids: string[]) => {
    setDeleteTargetIds(ids);
    setIsDeleteModalOpen(true);
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetIds.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      const abortController = new AbortController();
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
        setSelectedIds((prev) =>
          prev.filter((id) => !deleteTargetIds.includes(id)),
        );
        toast({
          title: t("deletedSuccess"),
        });
        await fetchDocuments();
        // Reset
        setDeleteTargetIds([]);
        setIsDeleteModalOpen(false);
        setCurrentPage(1);
      } else {
        toast({
          title: t("deleteError"),
          variant: "error",
        });
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast({
          title: t("deleteError"),
          variant: "error",
        });
      }
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCheckedValues([]);
    setDateRange({ startDate: new Date(0), endDate: new Date() });
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  AWS.config.update({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  });

  const toArrayBuffer = (input: ArrayBufferLike): ArrayBuffer => {
    if (input instanceof ArrayBuffer) {
      return input;
    }
    if (
      typeof SharedArrayBuffer !== "undefined" &&
      input instanceof SharedArrayBuffer
    ) {
      return new Uint8Array(input).slice().buffer;
    }
    if (ArrayBuffer.isView(input)) {
      const view = input as ArrayBufferView;
      return new Uint8Array(
        view.buffer,
        view.byteOffset,
        view.byteLength,
      ).slice().buffer;
    }
    throw new Error("Tipo no soportado para conversión a ArrayBuffer");
  };

  const handleDocumentClick = async (doc: DocumentsListResponse) => {
    setPdfLink(doc.metadata.url);
    setDocumentName(doc.filename);

    const participians: Participant[] = doc.participants.map((p) => {
      const color =
        p.signatures && p.signatures[0] && p.signatures[0].color
          ? p.signatures[0].color
          : "#000000";
      console.log("🚀 ~ color:", color);

      return {
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        color,
        listContact: false,
        status: "send" as unknown as Participant["status"],
        docUrl: doc.metadata.url,
      };
    });
    setParticipants(participians);

    const allSignatures: Signature[] = [];
    doc.participants.forEach((participant) => {
      if (participant.signatures && Array.isArray(participant.signatures)) {
        participant.signatures.forEach((sig) => {
          allSignatures.push({
            id: sig.id || sig._id || `signature-${Date.now()}-${Math.random()}`,
            left: sig.left || 0,
            top: sig.top || 0,
            position: undefined,
            color: sig.color || "#B1DAB0",
            width: sig.width || 150,
            height: sig.height || 75,
            rotation: sig.rotation || 0,
            slideIndex: sig.slideIndex || 0,
            signatureText: sig.signatureText || "",
            recipientsName:
              sig.recipientsName ||
              participant.first_name + " " + participant.last_name,
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
      }
    });

    setSignatures(allSignatures);

    if (doc.metadata.s3Key) {
      try {
        const s3 = new AWS.S3({
          region: process.env.NEXT_PUBLIC_REGION,
          credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_ACCESSKEYID!,
            secretAccessKey: process.env.NEXT_PUBLIC_SECRETACCESSKEY!,
          },
        });
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET!;
        const key = doc.metadata.s3Key;
        const params = { Bucket: bucketName, Key: key };
        const data = await s3.getObject(params).promise();
        const body = data.Body as unknown;
        if (!body) {
          throw new Error("No se obtuvo Body en getObject");
        }

        let arrayBuffer: ArrayBuffer;
        if (body instanceof ArrayBuffer) {
          arrayBuffer = body;
        } else if (
          typeof SharedArrayBuffer !== "undefined" &&
          body instanceof SharedArrayBuffer
        ) {
          arrayBuffer = toArrayBuffer(body);
        } else if (body instanceof Blob) {
          arrayBuffer = await body.arrayBuffer();
        } else if (ArrayBuffer.isView(body as ArrayBufferLike)) {
          arrayBuffer = toArrayBuffer(body as ArrayBufferLike);
        } else {
          const maybeBuffer = body as any;
          if (
            maybeBuffer &&
            typeof maybeBuffer === "object" &&
            maybeBuffer.buffer instanceof ArrayBuffer
          ) {
            arrayBuffer = toArrayBuffer((maybeBuffer as Uint8Array).buffer);
          } else {
            throw new Error(
              "Tipo de Body no soportado para conversión a ArrayBuffer",
            );
          }
        }

        const mimeType = doc.metadata.mimetype || "application/pdf";
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const name = doc.filename || key.split("/").pop()!;
        const pdfFile = new File([blob], name, { type: mimeType });
        setFile(pdfFile);
        setFileName(name);
      } catch (err) {
        console.error(
          "Error al descargar PDF del draft desde S3 con SDK en cliente:",
          err,
        );
        if (doc.metadata.url) {
          try {
            const res = await fetch(doc.metadata.url);
            if (res.ok) {
              const buf = await res.arrayBuffer();
              const mimeType = doc.metadata.mimetype || "application/pdf";
              const blob = new Blob([buf], { type: mimeType });
              let name =
                doc.metadata.filename || doc.metadata.url.split("/").pop()!;
              if (!name.toLowerCase().endsWith(".pdf")) name += ".pdf";
              const pdfFile = new File([blob], name, { type: mimeType });
              setFile(pdfFile);
              setFileName(name);
            } else {
              console.error(
                `Error al descargar PDF vía presigned URL: ${res.status}`,
              );
            }
          } catch (e2) {
            console.error(
              "Error al descargar vía presigned URL de fallback:",
              e2,
            );
          }
        }
      }
    } else if (doc.metadata.url) {
      try {
        const res = await fetch(doc.metadata.url);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          const mimeType = doc.metadata.mimetype || "application/pdf";
          const blob = new Blob([buf], { type: mimeType });
          let name =
            doc.metadata.filename || doc.metadata.url.split("/").pop()!;
          if (!name.toLowerCase().endsWith(".pdf")) name += ".pdf";
          const pdfFile = new File([blob], name, { type: mimeType });
          setFile(pdfFile);
          setFileName(name);
        } else {
          console.error(
            `Error al descargar PDF vía presigned URL: ${res.status}`,
          );
        }
      } catch (err) {
        console.error(
          "Error al descargar PDF del draft vía presigned URL:",
          err,
        );
      }
    }

    setSelectedDraft(doc);
  };

  if (selectedDraft) {
    return (
      <div className="space-y-4 ml-3">
        <UploadDocForm
          isDraftMode={true}
          onBack={() => {
            setSelectedDraft(null);
            resetContext();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AppHeader
        href="/"
        heading={t("title", { count: filteredDocuments.length })}
        onSearch={handleSearch}
        value={searchTerm}
      />

      <Container>
        <TableWrapper>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-x-6 gap-y-4 md:flex-row md:items-center">
              <div className="flex items-center gap-6">
                {!hasSelectedRows && (
                  <Button variant="secondary" onClick={resetFilters}>
                    <RefreshIcon />
                  </Button>
                )}
                <h4 className="py-3 font-semibold text-neutral-800">
                  {t("title", { count: filteredDocuments.length })}
                </h4>
              </div>

              {!hasSelectedRows && (
                <div className="flex max-w-[550px] flex-auto items-center gap-6 md:ml-auto">
                  <div className="hidden w-full xl:block">
                    <Input
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      iconLeft={<SearchIcon />}
                      placeholder={t("searchPlaceholder")}
                    />
                  </div>
                </div>
              )}

              {hasSelectedRows && (
                <Button
                  variant="secondaryError"
                  className="self-start"
                  onClick={() => handleDelete(selectedIds)}
                >
                  <TrashIcon />
                  {t("deleteSelected")}
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-neutral-600">{t("loading")}</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">
                {error || t("errorLoading")}
              </p>
            </div>
          ) : paginatedDocuments.length > 0 ? (
            <TableDraft
              documents={paginatedDocuments}
              withCheckbox
              selectedIds={selectedIds}
              onSelectRows={setSelectedIds}
              onDeleteRow={(id) => handleDelete([id])}
              onDocumentClick={handleDocumentClick}
            />
          ) : (
            <p className="p-4 text-center">
              {t("noDocuments")}
              <Button variant="link" onClick={resetFilters} className="ml-2">
                {t("resetFilters")}
              </Button>
            </p>
          )}

          <div className="mt-6">
            {!loading && !error && totalPages > 1 && (
              <Pagination
                total={filteredDocuments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setSelectedIds([]);
                  setCurrentPage(page);
                }}
              />
            )}
          </div>
        </TableWrapper>
      </Container>

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
    </div>
  );
};
