"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import AWS from "aws-sdk";
import { useTranslations } from "next-intl";
import { useSignatureData } from "@/context/SignatureContext";
import { useFile } from "@/context/FileContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

import {
  CancelFilledIcon,
  ChevronIcon,
  FilterIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "../icon";
import { AppHeader } from "../ui/AppHeader";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Container } from "../ui/Container";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Pagination } from "../ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Table, TableWrapper } from "./Table";

import DocumentsUseCase from "@/api/useCases/DocumentUseCase";
import type { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import { UploadDocForm } from "@/components/Form/UploadDocForm/UploadDocForm";

const DeleteDocModal = dynamic(
  () => import("../Modals/DeleteDocModal").then((mod) => mod.DeleteDocModal),
  { ssr: false }
);
const FilterDateModal = dynamic(
  () => import("../Modals/FilterDateModal").then((mod) => mod.FilterDateModal),
  { ssr: false }
);

const ITEMS_PER_PAGE = 15;

export const TableListContainer: React.FC = () => {
  const t = useTranslations("DocumentStatus");
  const { setLoading, setPdfLink, setDocumentName, setParticipants, setSignatures, resetContext } =
    useSignatureData();
  const { setFile, setFileName } = useFile();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Estado local de documentos
  const [documents, setDocuments] = useState<DocumentsListResponse[]>([]);
  const [loadingLocal, setLoadingLocal] = useState<boolean>(false);
 

  // Filtros y paginación local
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterDateModalOpen, setIsFilterDateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(0),
    endDate: new Date(),
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Estado para documento seleccionado (abrir UploadDocForm)
  const [selectedDoc, setSelectedDoc] = useState<DocumentsListResponse | null>(null);

  // Estados para eliminación bulk/individual
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Definimos los estados con IDs que coincidan con la API
  const statusOptions = [
    { id: "all", label: t("all") },
    { id: "completed", label: t("completed") },
    { id: "in_progress", label: t("inProgress") },
    { id: "draft", label: t("draft") },
    { id: "recycler", label: t("recycler") },
    { id: "rejected", label: t("rejected") },
  ];

  // Leer parámetro URL al montar
  useEffect(() => {
    const statusParam = searchParams.get("filter[status]");
    if (statusParam && statusOptions.some(o => o.id === statusParam)) {
      setCheckedValues(statusParam === "all" ? [] : [statusParam]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para fetch en lotes, reutilizable para recarga
  const fetchAllDocuments = useCallback(async () => {
    const controller = new AbortController();
    setLoadingLocal(true);
    setLoading?.(true);


    try {
      const BATCH_SIZE = 1000;
      let allDocs: DocumentsListResponse[] = [];

      // Primera página
      const res1 = await DocumentsUseCase.listDocuments({
        page: 1,
        limit: BATCH_SIZE,
        status: "",
      });
      if (
        !res1.pagination?.totalItems ||
        typeof res1.pagination.totalItems !== "number"
      ) {
        if (res1.data && Array.isArray(res1.data)) {
          allDocs = res1.data;
        }
      } else {
        const totalItems = res1.pagination.totalItems;
        if (res1.data && Array.isArray(res1.data)) {
          allDocs = res1.data;
        }
        const totalPages = Math.ceil(totalItems / BATCH_SIZE);
        for (let page = 2; page <= totalPages; page++) {
          if (controller.signal.aborted) break;
          try {
            const resPage = await DocumentsUseCase.listDocuments({
              page,
              limit: BATCH_SIZE,
              status: "",
            });
            if (resPage.data && Array.isArray(resPage.data)) {
              allDocs = allDocs.concat(resPage.data);
            }
          } catch (errPage) {
            console.warn(`Fallo al cargar página ${page}`, errPage);
          }
        }
      }

      // Filtrar activos y no eliminados
      const docsFiltrados: DocumentsListResponse[] = allDocs.filter(
        (doc) => doc.isActive && !doc.isDeleted
      );
      setDocuments(docsFiltrados);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast({
          title: t("errorLoading") || "Error cargando documentos",
          description: err?.message || "",
          variant: "error",
        });
      }
    } finally {
      setLoadingLocal(false);
      setLoading?.(false);
    }

    return () => controller.abort();
  }, [setLoading, t, toast]);

  // Inicial fetch
  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  // Handlers de filtros (sin cambios)
  const handleCheckboxChange = (statusId: string) => {
    setSelectedFilter(null);
    setCheckedValues((prev) =>
      prev.includes(statusId) ? prev.filter((id) => id !== statusId) : [...prev, statusId]
    );
    setCurrentPage(1);
  };
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  const handleFilter = (filterId: string | null, range: { startDate: Date; endDate: Date }) => {
    setSelectedFilter(filterId);
    setDateRange(range);
    setCheckedValues([]);
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setCheckedValues([]);
    setSelectedFilter(null);
    setDateRange({ startDate: new Date(0), endDate: new Date() });
    setCurrentPage(1);
  };

  // Filtrar documentos localmente
  const filterDocuments = (): DocumentsListResponse[] => {
    const { startDate, endDate } = dateRange;
    return documents.filter((doc) => {
      const docDate = new Date(doc.createdAt);
      const matchesSearch =
        !searchTerm || doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        !checkedValues.length || checkedValues.includes(doc.status);
      const matchesDate =
        selectedFilter === "custom"
          ? docDate >= startDate && docDate <= endDate
          : true;
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredDocuments = filterDocuments();
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const effectivePage = Math.min(currentPage, totalPages || 1);
  const paginatedDocuments = filteredDocuments.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE
  );

  const draftIds = paginatedDocuments
    .filter((doc) => doc.status?.toLowerCase() === "draft")
    .map((doc) => doc.documentId);

  // Solo permitir seleccionar drafts
  const handleSelectRows = (ids: string[]) => {
    const filtered = ids.filter((id) => draftIds.includes(id));
    setSelectedIds(filtered);
  };

  // Handler de clic en fila: abre UploadDocForm con carga de PDF, participantes y firmas
  const handleDocumentClick = async (doc: DocumentsListResponse) => {
    // Cargar en contexto signature
    setPdfLink(doc.metadata.url);
    setDocumentName(doc.filename);

    // Preparar participantes
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

    // Preparar firmas existentes
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
          recipientsName: sig.recipientsName || `${participant.first_name} ${participant.last_name}`,
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

    // Descargar PDF desde S3 o URL
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
          .getObject({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!, Key: doc.metadata.s3Key })
          .promise();
        const buffer = await (data.Body as Blob)?.arrayBuffer?.();
        const blob = new Blob([buffer], { type: doc.metadata.mimetype || "application/pdf" });
        const file = new File([blob], doc.filename, { type: blob.type });
        setFile(file);
        setFileName(doc.filename);
      } else if (doc.metadata.url) {
        const res = await fetch(doc.metadata.url);
        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], { type: doc.metadata.mimetype || "application/pdf" });
        const file = new File([blob], doc.filename, { type: blob.type });
        setFile(file);
        setFileName(doc.filename);
      }
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
      toast({
        title: t("downloadError") || "Error al descargar",
        variant: "error",
      });
    }

    setSelectedDoc(doc);
  };

  // Handler para volver desde UploadDocForm
  const handleBackFromUpload = () => {
    setSelectedDoc(null);
    resetContext();
    fetchAllDocuments();
  };

  // Handlers de eliminación (se mantienen como estaban)
  const handleDelete = (ids: string[]) => {
    // Solo drafts
    const onlyDrafts = ids.filter((id) => draftIds.includes(id));
    setDeleteTargetIds(onlyDrafts);
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
      let response;
      if (deleteTargetIds.length === 1) {
        response = await DocumentsUseCase.deleteDocument(deleteTargetIds[0]);
      } else {
        response = await DocumentsUseCase.bulkDeleteDocument({ ids: deleteTargetIds });
      }
      if (response && response.data) {
        setDocuments((prev) =>
          prev.filter((doc) => !deleteTargetIds.includes(doc.documentId))
        );
        setSelectedIds((prev) =>
          prev.filter((id) => !deleteTargetIds.includes(id))
        );
        toast({
          title: t("deletedSuccess") || "Draft(s) eliminado(s) exitosamente.",
        });
        await fetchAllDocuments();
        setDeleteTargetIds([]);
        setIsDeleteModalOpen(false);
        setCurrentPage(1);
      } else {
        toast({
          title: t("deleteError") || "Error al eliminar draft(s)",
          variant: "error",
        });
        setIsDeleteModalOpen(false);
      }
    } catch {
      toast({
        title: t("deleteError") || "Error al eliminar draft(s)",
        variant: "error",
      });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para mostrar texto en Popover del filtro de estado
  function getPopoverValue(selected: string[]) {
    if (selected.length === 0) return t("all");
    if (selected.length === 1) {
      const opt = statusOptions.find(o => o.id === selected[0]);
      return opt ? opt.label : t("all");
    }
    return "Personalizado";
  }
  const hasSelectedRows = selectedIds.length > 0;
  const popoverValue = getPopoverValue(checkedValues);

  // Si hay documento seleccionado, mostramos UploadDocForm
  if (selectedDoc) {
    return (
      <div className="space-y-4 ml-3">
        <UploadDocForm isDraftMode={true} onBack={handleBackFromUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AppHeader
        href="/documents"
        heading={t("heading") || "Documentos"}
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
                  {hasSelectedRows
                    ? `${selectedIds.length} Documento${selectedIds.length !== 1 ? "s" : ""} seleccionado${selectedIds.length !== 1 ? "s" : ""}`
                    : `${filteredDocuments.length} Documento${filteredDocuments.length !== 1 ? "s" : ""}`}
                </h4>
              </div>

              {!hasSelectedRows && (
                <div className="lg:ml- flex max-w-[840px] flex-auto items-center gap-6 md:ml-auto">
                  <Button
                    variant="secondary"
                    onClick={() => setIsFilterDateModalOpen(true)}
                  >
                    <FilterIcon />
                  </Button>

                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Input
                        iconRight={<ChevronIcon />}
                        value={popoverValue}
                        type="button"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      {statusOptions.map(({ id, label }) => {
                        if (id === "all") {
                          return (
                            <button
                              key={id}
                              type="button"
                              className="w-full px-5 py-3 text-left hover:bg-neutral-50"
                              onClick={() => {
                                setCheckedValues([]);
                                setIsPopoverOpen(false);
                              }}
                            >
                              {label}
                            </button>
                          );
                        }
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50"
                          >
                            <Checkbox
                              checked={checkedValues.includes(id)}
                              onCheckedChange={() => handleCheckboxChange(id)}
                              id={id}
                            />
                            <Label htmlFor={id} className="w-full">
                              {label}
                            </Label>
                          </div>
                        );
                      })}
                    </PopoverContent>
                  </Popover>

                  <div className="hidden w-full xl:block">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      iconLeft={<SearchIcon />}
                      placeholder={t("searchPlaceholder") || "Buscar documentos..."}
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
                  {t("deleteSelected") || "Eliminar seleccionados"}
                </Button>
              )}
            </div>

            {!hasSelectedRows &&
              selectedFilter === "custom" &&
              dateRange.startDate &&
              dateRange.endDate && (
                <div className="inline-flex items-center gap-2 self-start rounded-lg bg-neutral-100 px-2.5 py-2 text-sm font-semibold text-neutral-500">
                  {`Personalizado: ${dateRange.startDate.toLocaleDateString()} al ${dateRange.endDate.toLocaleDateString()}`}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilter(null);
                      setDateRange({ startDate: new Date(0), endDate: new Date() });
                    }}
                  >
                    <CancelFilledIcon />
                  </button>
                </div>
              )}
          </div>

          {documents.length > 0 ? (
            <Table
              documents={paginatedDocuments}
              withCheckbox
              selectedIds={selectedIds}
              onSelectRows={handleSelectRows}
              onDeleteRow={(id) => handleDelete([String(id)])}
              onRowClick={(doc) => handleDocumentClick(doc)}
            />
          ) : loadingLocal ? (
            <p className="p-4 text-center">{t("loading") || "Cargando documentos..."}</p>
          ) : (
            <p className="p-4 text-center">
              {t("noDocuments") || "No hay documentos para mostrar."}
              <Button variant="link" onClick={resetFilters} className="ml-2">
                {t("resetFilters") || "Restablecer filtros"}
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

      <FilterDateModal
        isOpen={isFilterDateModalOpen}
        onClose={() => setIsFilterDateModalOpen(false)}
        onFilter={handleFilter}
      />
    </div>
  );
};
