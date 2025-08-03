"use client";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
// import { useTranslations } from "next-intl";

import {
  RefreshIcon,
  RestoreIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icon";
import { DeleteDocModal } from "@/components/Modals/DeleteDocModal";
import { RestoreModal } from "@/components/Modals/RestoreModal";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/pagination";
import { TableWrapper } from "@/components/DocumentsTable";
import { TableTrash } from "@/components/DocumentsTable/TableTrash";
import { useTranslations } from "next-intl";
import { Toaster } from "@/components/ui/toaster";
import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import { UploadDocForm } from "@/components/Form/UploadDocForm/UploadDocForm";
import { useSignatureData } from "@/context/SignatureContext";
import { Participant, Signature } from "@/types";
import { useFile } from "@/context/FileContext";

import DocumentUseCase from "@/api/useCases/DocumentUseCase";
//import { documents } from "@/const/documents";

import AWS from "aws-sdk";

const ITEMS_PER_PAGE = 15;

export const TableContainer = () => {
  const t = useTranslations("AppDocuments");
  const { toast } = useToast();

  const {
    setPdfLink,
    setDocumentName,
    setSignatures,
    setParticipants,
    resetContext,
  } = useSignatureData();
  const { setFile, setFileName } = useFile();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Selected document IDs for deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentsListResponse[]>([]);

  const [selectedTrashed, setSelectedTrashed] = useState<DocumentsListResponse | null>(null);
  

  // Filter documents based on status and date range
  const filterDocuments = () => {
    const search = searchTerm.toLowerCase().trim();
    let filteredDocuments = documents;

    if (search) {
      const searchWords = search.split(/\s+/);  
      filteredDocuments = documents.filter((doc) => {
        const fullString = [
          doc.filename,
          doc.documentId,
          doc.createdAt
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
        
        return searchWords.every((word) => fullString.includes(word));
      });
    }

    return filteredDocuments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  };

  const fetchDocuments = useCallback(async () => {
    const abortController = new AbortController();
    try {
      const res = await DocumentUseCase.listDocuments({
        page: 1,
        limit: 1000,
        status: "recycler",
        signal: abortController.signal,
      });
      if (Array.isArray(res.data)) {
        setDocuments(
          res.data.map((doc) => ({
            ...doc,
            id: doc._id,
            documentId: doc.documentId || doc._id
          }))
        );
        if (res.data.length === 0) {
          toast({
            title: t("TableContainer.noDocuments"),
          });
        }
      }
    } catch (error: any) {
      setDocuments([]);
      if (error?.response?.status === 403) {
        toast({
          title: t("TableContainer.NoAuthDocuments"),
          variant: "error",
        });
      } else {
        toast({
          title: t("TableContainer.error"),
          variant: "error",
        });
      }
    }
  }, [t, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Confirm deletion
  const handleDeleted = async () => {

    if (selectedIds.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }
    setIsDeleting(true);
    const abortController = new AbortController();
    try {
      if (selectedIds.length > 1) {
        await DocumentUseCase.bulkDeleteDocument({ ids: selectedIds }, abortController.signal);
      } else if (selectedIds.length === 1) {
        await DocumentUseCase.deleteDocument(selectedIds[0], abortController.signal);
      }
      toast({
        title: t("TrashTable.deleteConfirmation"),
      });
      await fetchDocuments();
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: t("Stats.DraftDocuments.deleteError"),
          variant: "error",
        });
      }
    } finally {
      setSelectedIds([]); // Clear selected IDs
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle deletion of selected documents
  const handleDelete = (ids: string[]) => {
    setSelectedIds(ids);
    setIsDeleteModalOpen(true);
    setCurrentPage(1);
  };

  // Handle restoration of selected documents
  const handleRestore = (ids: string[]) => {
    setSelectedIds(ids);
    setIsRestoreModalOpen(true);
    setCurrentPage(1);
  };

  const handleRestored = async () => {
    if (selectedIds.length === 0) {
      setIsRestoreModalOpen(false);
      return;
    }
    const abortController = new AbortController();
    try {
      await DocumentUseCase.restoreDocument(selectedIds[0], abortController.signal);
      
      toast({
        title: t("TrashTable.restoreConfirmation"),
      });
    } catch (error) {
      if (error) {
        toast({
          title: t("TrashTable.restoreError"),
          variant: "error",
        });
        setIsRestoreModalOpen(false);
      }
    } finally {
      await fetchDocuments();
      setIsRestoreModalOpen(false);
      setSelectedIds([]); // Clear selected IDs
      setCurrentPage(1);
    }

  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedIds([]);
    fetchDocuments();
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setCurrentPage(1);
    setSearchTerm(term);
    // Reset to first page on search
  };

  // Ensure currentPage doesn't exceed totalPages
  const filteredDocuments = filterDocuments();
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const effectivePage = Math.min(currentPage, totalPages || 1);

  const paginatedDocuments = filteredDocuments.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE
  );

  const hasSelectedRows = selectedIds.length > 0;

  AWS.config.update({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  });

  const toArrayBuffer = (input: ArrayBufferLike): ArrayBuffer => {
    if (input instanceof ArrayBuffer) {
      return input;
    }
    if (typeof SharedArrayBuffer !== "undefined" && input instanceof SharedArrayBuffer) {
      return new Uint8Array(input).slice().buffer;
    }
    if (ArrayBuffer.isView(input)) {
      const view = input as ArrayBufferView;
      return new Uint8Array(view.buffer, view.byteOffset, view.byteLength).slice().buffer;
    }
    throw new Error("Tipo no soportado para conversión a ArrayBuffer");
  };

  const handleDocumentClick = async (doc: DocumentsListResponse) => {
      setPdfLink(doc.metadata.url);
      setDocumentName(doc.filename);
  
      const participians: Participant[] = doc.participants.map((p, index) => {
        const color =
          p.signatures && p.signatures[index] && p.signatures[index].color
            ? p.signatures[index].color
            : "#000000";
  
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
              color: sig.color || "#FEAD23",
              width: sig.width || 150,
              height: sig.height || 75,
              rotation: sig.rotation || 0,
              slideIndex: sig.slideIndex || 0,
              signatureText: sig.signatureText || "",
              recipientsName:
                sig.recipientsName || participant.first_name + " " + participant.last_name,
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
              throw new Error("Tipo de Body no soportado para conversión a ArrayBuffer");
            }
          }
  
          const mimeType = doc.metadata.mimetype || "application/pdf";
          const blob = new Blob([arrayBuffer], { type: mimeType });
          const name = doc.filename || key.split("/").pop()!;
          const pdfFile = new File([blob], name, { type: mimeType });
          setFile(pdfFile);
          setFileName(name);
        } catch (err) {
          console.error("Error al descargar PDF del draft desde S3 con SDK en cliente:", err);
          if (doc.metadata.url) {
            try {
              const res = await fetch(doc.metadata.url);
              if (res.ok) {
                const buf = await res.arrayBuffer();
                const mimeType = doc.metadata.mimetype || "application/pdf";
                const blob = new Blob([buf], { type: mimeType });
                let name = doc.metadata.filename || doc.metadata.url.split("/").pop()!;
                if (!name.toLowerCase().endsWith(".pdf")) name += ".pdf";
                const pdfFile = new File([blob], name, { type: mimeType });
                setFile(pdfFile);
                setFileName(name);
              } else {
                console.error(`Error al descargar PDF vía presigned URL: ${res.status}`);
              }
            } catch (e2) {
              console.error("Error al descargar vía presigned URL de fallback:", e2);
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
            let name = doc.metadata.filename || doc.metadata.url.split("/").pop()!;
            if (!name.toLowerCase().endsWith(".pdf")) name += ".pdf";
            const pdfFile = new File([blob], name, { type: mimeType });
            setFile(pdfFile);
            setFileName(name);
          } else {
            console.error(`Error al descargar PDF vía presigned URL: ${res.status}`);
          }
        } catch (err) {
          console.error("Error al descargar PDF del draft vía presigned URL:", err);
        }
      }
  
      setSelectedTrashed(doc);
    };

      if (selectedTrashed) {
        return (
          <div className="space-y-4 ml-3">
            <Button
              variant="link"
              onClick={() => {
                setSelectedTrashed(null);
                resetContext();
              }}
              className="ml-4"
            >
            </Button>
            <UploadDocForm />
          </div>
        );
      }

  return (
    <div className="space-y-4">
      <AppHeader
        href="/"
        heading="Papelera"
        onSearch={handleSearch}
        value={searchTerm}
      />

      <Container>
        <TableWrapper>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-x-6 gap-y-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-6">
                {!hasSelectedRows && (
                  <Button variant="secondary" onClick={resetFilters}>
                    <RefreshIcon />
                  </Button>
                )}
                <h4 className="py-3 font-semibold text-neutral-800">
                  {t("TrashTable.documentsDeleted", { count: filteredDocuments.length })}
                </h4>
              </div>

              {!hasSelectedRows && (
                <div className="flex max-w-[550px] flex-auto items-center gap-6 md:ml-auto">
                  <div className="hidden w-full xl:block">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      iconLeft={<SearchIcon />}
                      placeholder={t("TrashTable.searchPlaceholder")}
                    />
                  </div>
                </div>
              )}

              {hasSelectedRows && (
                <div className="flex flex-col gap-4 lg:flex-row">
                  <Button
                    variant="secondaryError"
                    className="self-start"
                    onClick={() => handleDelete(selectedIds)}
                    disabled={isDeleting}
                    isLoading={isDeleting}
                  >
                    <TrashIcon />
                    {t("TrashTable.deleteSelected")}
                  </Button>

                  <Button
                    variant="secondary"
                    className="self-start"
                    onClick={() => handleRestore(selectedIds)}
                    disabled={selectedIds.length !== 1}
                  >
                    <RestoreIcon />
                    {t("TrashTable.restoreSelected")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start justify-center gap-x-4 gap-y-2 rounded-lg bg-neutral-100 px-4 py-3 md:flex-row md:items-center">
            <p className="text-sm">{t("TrashTable.autoDeleteInfo")}</p>

            <Button
              variant="link"
              size="medium"
              onClick={() => handleDelete(selectedIds)}
            >
              {t("TrashTable.deleteNow")}
            </Button>
          </div>

          {paginatedDocuments.length > 0 ? (
            <TableTrash
              documents={paginatedDocuments}
              withCheckbox
              selectedIds={selectedIds}
              onSelectRows={setSelectedIds}
              onDeleteRow={(id) => handleDelete([id])}
              onRestoreRow={(id) => handleRestore([id])}
              isDeleting={isDeleting}
              onDocumentClick={handleDocumentClick}
            />
          ) : (
            <p className="p-4 text-center">
              {t("TrashTable.noDocuments")}
              <Button variant="link" onClick={resetFilters} className="ml-2">
                {t("TrashTable.resetFilters")}
              </Button>
            </p>
          )}

          <div className="mt-6">
            {totalPages > 1 && (
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
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="flex items-start justify-center p-4 pointer-events-auto">
            <Toaster />
          </div>
        </div>
      </Container>

      <DeleteDocModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleted}
        isLoading={isDeleting}
        deleteCount={selectedIds.length}
      />

      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onRestore={handleRestored}
      />
    </div>
  );
};
