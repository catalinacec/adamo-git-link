"use client";

/* import { useProfile } from "@/context/ProfileContext"; */
import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import DocumentUseCase from "@/api/useCases/DocumentUseCase";
/* import { UploadDocForm } from "@/components/Form/UploadDocForm/UploadDocForm"; */
import { Participant, Signature } from "@/types";
import AWS from "aws-sdk";

import { useCallback, useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { TableWrapper } from "@/components/DocumentsTable";
import { TablePending } from "@/components/DocumentsTable/TablePending";
import { RefreshIcon, SearchIcon } from "@/components/icon";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/pagination";
import { Toaster } from "@/components/ui/toaster";

import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 15;

export const TableContainer = () => {
  const t = useTranslations("AppDocuments");
  const { toast } = useToast();
  const router = useRouter();

  const {
    setPdfLink,
    setDocumentName,
    setSignatures,
    setParticipants,
    setDocumentId,
    setUuid,
    /* resetContext, */
  } = useSignatureData();

  const { setFile, setFileName } = useFile();

  const [_selectedPending, setSelectedPending] =
    useState<DocumentsListResponse | null>(null);

  //User data in session

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentsListResponse[]>([]);

  const handleSearch = (term: string) => {
    setCurrentPage(1);
    setSearchTerm(term);
  };

  const filterDocuments = () => {
    const search = searchTerm.toLowerCase().trim();
    let filteredDocuments = documents;

    if (search) {
      const searchWords = search.split(/\s+/);
      filteredDocuments = documents.filter((doc) => {
        const fullString = [doc.filename]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchWords.every((word) => fullString.includes(word));
      });
    }

    return filteredDocuments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Sort by created_at descending
    });
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await DocumentUseCase.getPendingSignatureDocuments();
      if (Array.isArray(res.data)) {
        setDocuments(
          res.data.map((doc) => ({
            ...doc,
            id: doc._id,
          })),
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

  /* 
    Using polling to fetch documents every 10 seconds when the component mounts.
    - Waiting to implement websocket for real-time updates.
  */
  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(() => {
      fetchDocuments();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedIds([]);
    setCurrentPage(1);
    fetchDocuments();
  };

  const filteredDocuments = filterDocuments();
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const effectivePage = Math.min(currentPage, totalPages || 1);

  const paginatedDocuments = filteredDocuments.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE,
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
    setDocumentId(doc.documentId);

    const participants: Participant[] = doc.participants.map((p, index) => {
      const color =
        p.signatures && p.signatures[index] && p.signatures[index].color
          ? p.signatures[index].color
          : "#000000";

      setUuid(p.uuid || "");
      return {
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        uuid: p.uuid || "",
        color,
        listContact: false,
        status: p.status || {
          id: "unknown",
          timestamp: new Date().toISOString(),
          helperText: "No status",
        },
        signedAt: p.historySignatures?.signedAt || "",
        rejectedAt: p.historySignatures?.rejectedAt || "",
        docUrl: doc.metadata.url,
      };
    });
    setParticipants(participants);

    //Set signatures
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
    setSelectedPending(doc);
    router.push(`/documents/${doc.documentId}/sign`);
  };

  /* if (selectedPending) {
        return (
          <div className="space-y-4 ml-3">
            <Button
              variant="link"
              onClick={() => {
                setSelectedPending(null);
                resetContext();
              }}
              className="ml-4"
            >
            </Button>
            <UploadDocForm initialStep={4}/>
          </div>
        );
      } */

  return (
    <div className="space-y-4">
      <AppHeader
        href="/"
        heading={t("TableContainer.heading")}
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
                  {filteredDocuments.length} {t("TableContainer.pending")}
                </h4>
              </div>

              {!hasSelectedRows && (
                <div className="flex items-center gap-6 md:ml-auto">
                  <Input
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    iconLeft={<SearchIcon />}
                    placeholder={t("TableContainer.searchPlaceholder")}
                  />
                </div>
              )}
            </div>
          </div>

          {paginatedDocuments.length > 0 ? (
            <TablePending
              documents={paginatedDocuments.map((doc) => ({
                ...doc,
                id: String(doc._id),
              }))}
              selectedIds={selectedIds}
              onSelectRows={setSelectedIds}
              onDocumentClick={handleDocumentClick}
            />
          ) : (
            <p className="p-4 text-center">
              {t("TablePending.noResults")}
              <Button variant="link" onClick={resetFilters} className="ml-2">
                {t("TablePending.resetFilter")}
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
    </div>
  );
};
