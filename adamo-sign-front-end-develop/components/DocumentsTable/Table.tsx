"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { useSignatureData } from "@/context/SignatureContext";
import { Checkbox } from "../ui/Checkbox";
import { Badge } from "../ui/Badge";
import {
  CancelIcon,
  CheckCircleIcon,
  ChevronIcon,
  ClockIcon,
  SendIcon,
  TrashIcon,
} from "../icon";
import { DocumentsListResponse } from "@/api/types/DocumentsTypes";

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  documents: DocumentsListResponse[];
  withCheckbox?: boolean;
  selectedIds?: string[];
  onSelectRows?: (selectedIds: string[]) => void;
  onDeleteRow?: (id: string) => void;
  onRowClick?: (doc: DocumentsListResponse) => void;
}

export const Table: React.FC<TableProps> = (props) => {
  const t = useTranslations("DocumentStatus");
  const tDraft = useTranslations("AppDocuments.Stats.DraftDocuments");
  const {
    documents,
    withCheckbox,
    selectedIds = [],
    onSelectRows,
    onDeleteRow,
    onRowClick,
    ...rest
  } = props;
  const { setDownLoadCheck } = useSignatureData();

  // Lógica para determinar estado del checkbox de "seleccionar todo"
  // Solo drafts pueden ser seleccionados
  const draftDocs = documents.filter((doc) => doc.status?.toLowerCase() === "draft");
  const isAllSelected = draftDocs.length > 0 && draftDocs.every((doc) => selectedIds.includes(doc.documentId));
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected && draftDocs.some((doc) => selectedIds.includes(doc.documentId));
  // Asumimos que Checkbox acepta checked = boolean | "indeterminate"
  const checkboxState: boolean | "indeterminate" = isAllSelected
    ? true
    : isIndeterminate
      ? "indeterminate"
      : false;

  const toggleSelectAll = () => {
    if (onSelectRows) {
      if (draftDocs.length === 0) return;
      const allDraftIds = draftDocs.map((doc) => doc.documentId);
      onSelectRows(isAllSelected ? [] : allDraftIds);
    }
  };

  const toggleSelectRow = (id: string, status: string) => {
    if (onSelectRows && status?.toLowerCase() === "draft") {
      const updatedSelection = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      onSelectRows(updatedSelection);
    }
  };

  const renderBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
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
      case "in_progress":
      case "inprogress":
      case "in process":
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
      case "draft":
        return (
          <Badge variant="neutral">
            {t(status)}
          </Badge>
        );
      case "recycler":
        return (
          <Badge variant="error">
            {t(status)}
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral">
            {t(status) ?? status}
          </Badge>
        );
    }
  };

  // Ícono de registro según estado
  const getRegisterIcon = (status: string, isBlockchainRegistered: boolean, onDeleteRow?: () => void) => {
    const s = status?.toLowerCase();
    if (s === "draft") {
      return (
        <button
          type="button"
          className="relative z-20"
          onClick={onDeleteRow}
          title={t("delete") || "Eliminar"}
        >
          <TrashIcon className="text-error-500" />
        </button>
      );
    }
    if (isBlockchainRegistered || s === "completed") {
      return (
        <Badge variant="success" type="text">
          <CheckCircleIcon className="text-success-500" />
        </Badge>
      );
    }
    if (s === "in_progress" || s === "inprogress" || s === "in process") {
      return (
        <Badge variant="process" type="text">
          <ClockIcon className="text-warning-400" />
        </Badge>
      );
    }
    return null;
  };

  return (
    <div {...rest}>
      {/* Mobile table */}
      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 lg:hidden">
        {documents.length === 0 && (
          <div className="p-4 text-center text-neutral-500">
            {tDraft("noDocuments") || t("noDocuments") || "No hay registros."}
          </div>
        )}
        {documents.map((doc) => {
          const statusLower = doc.status?.toLowerCase() ?? "";
          // const normalizedStatus = statusLower.replace(/[\s_]/g, "");
          const isDraft = statusLower === "draft";
          return (
            <div key={doc.documentId} className="relative space-y-4 px-4 py-5">
              <div className="flex items-center gap-x-4 pb-5">
                {withCheckbox && (
                  <Checkbox
                    className="relative z-20"
                    checked={selectedIds.includes(doc.documentId)}
                    onCheckedChange={() => isDraft && toggleSelectRow(doc.documentId, doc.status)}
                    disabled={!isDraft}
                  />
                )}
                <strong>{doc.filename}</strong>
              </div>

              <div className="flex items-center">
                <p className="mr-4 xs:mr-8 whitespace-nowrap">
                  {doc.createdAt
                    ? format(new Date(doc.createdAt), "dd/MM/yy")
                    : tDraft("invalidDate") || t("invalidDate") || "Invalid date"}
                </p>

                {renderBadge(doc.status)}

                <div className="ml-auto flex flex-col items-center gap-2 xs:gap-2">
                  {/* Icono de registro */}
                  <div>
                    {getRegisterIcon(doc.status, doc.isBlockchainRegistered)}
                  </div>
                  {/* Botón de eliminar solo para draft */}
                  {isDraft && (
                    <button
                      type="button"
                      className="relative z-20 mt-2"
                      onClick={() => onDeleteRow?.(doc.documentId)}
                      title={t("delete") || "Eliminar"}
                    >
                      <TrashIcon className="text-error-500" />
                    </button>
                  )}
                  <ChevronIcon className="-rotate-90 text-neutral-300 mt-2" />

                  {onRowClick ? (
                    <button
                      type="button"
                      className="absolute inset-0"
                      onClick={(e) => {
                        e.preventDefault();
                        setDownLoadCheck(true);
                        onRowClick(doc);
                      }}
                      aria-label={t("open") || "Abrir documento"}
                    />
                  ) : (
                    <Link
                      className="absolute inset-0"
                      href={`/documents/${doc._id}`}
                      onClick={() => setDownLoadCheck(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 lg:block">
        <table className="min-w-full divide-y divide-neutral-50">
          <thead className="bg-neutral-50">
            <tr className="text-left text-xs font-semibold uppercase">
              <th
                scope="col"
                className="px-4 py-[22px]"
                style={{ width: 0 }}
              >
                {withCheckbox && (
                  <Checkbox
                    checked={checkboxState}
                    onCheckedChange={toggleSelectAll}
                  />
                )}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {tDraft("columnDocumentName") || "NOMBRE DEL DOCUMENTO"}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {tDraft("columnDate") || "FECHA"}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {tDraft("columnParticipants") || "PARTICIPANTES"}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {tDraft("columnStatus") || "ESTADO"}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {tDraft("columnRegister") || "REGISTRO"}
              </th>
              <th scope="col" className="relative px-4 py-[22px]">
                <span className="sr-only">{tDraft("actions") || "Actions"}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 bg-white">
            {documents.length === 0 && (
              <tr>
                <td
                  colSpan={withCheckbox ? 7 : 6}
                  className="p-4 text-center text-neutral-500"
                >
                  {tDraft("noDocuments") || t("noDocuments") || "No hay registros."}
                </td>
              </tr>
            )}
            {documents.map((doc) => {
              const statusLower = doc.status?.toLowerCase() ?? "";
              const isDraft = statusLower === "draft";
              return (
                <tr key={doc.documentId} className="relative align-middle">
                  <td className="whitespace-nowrap px-4 py-5 align-middle" style={{ width: 0 }}>
                    {withCheckbox && (
                      <Checkbox
                        checked={selectedIds.includes(doc.documentId)}
                        onCheckedChange={() => isDraft && toggleSelectRow(doc.documentId, doc.status)}
                        disabled={!isDraft}
                      />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-middle">
                    {doc.filename}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-middle">
                    {doc.createdAt
                      ? format(new Date(doc.createdAt), "dd/MM/yy")
                      : tDraft("invalidDate") || t("invalidDate") || "Invalid date"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-middle">
                    {Array.isArray(doc.participants) ? doc.participants.length : 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-middle">
                    {renderBadge(doc.status)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-middle">
                    {getRegisterIcon(
                      doc.status,
                      doc.isBlockchainRegistered,
                      isDraft ? () => onDeleteRow?.(doc.documentId) : undefined
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-middle">
                    <div className="flex flex-col items-center gap-2 relative">
                      <Link href={`/documents/${doc._id}`}>
                        <ChevronIcon className="-rotate-90 text-neutral-300" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TableWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "space-y-4 rounded-3xl border border-neutral-200 bg-white p-4",
        className
      )}
      {...rest}
    />
  );
};
