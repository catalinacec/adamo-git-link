"use client";

import React from "react";
import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import { Checkbox } from "../ui/Checkbox";
import { ChevronIcon, TrashIcon } from "../icon";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface TableDraftProps extends React.HTMLAttributes<HTMLDivElement> {
  documents: DocumentsListResponse[];
  withCheckbox?: boolean;
  selectedIds?: string[];
  onSelectRows?: (selectedIds: string[]) => void;
  onDeleteRow?: (id: string) => void;
  /** Llamada cuando el usuario hace click en un documento */
  onDocumentClick?: (doc: DocumentsListResponse) => void;
}

export const TableDraft = (props: TableDraftProps) => {
  const {
    documents,
    withCheckbox,
    selectedIds = [],
    onSelectRows,
    onDeleteRow,
    onDocumentClick,
  } = props;

  const t = useTranslations("AppDocuments.Stats.DraftDocuments");

  const toggleSelectAll = () => {
    if (onSelectRows) {
      const allIds = documents.map((doc) => doc.documentId);
      const allSelected =
        selectedIds.length === documents.length && documents.length > 0;
      onSelectRows(allSelected ? [] : allIds);
    }
  };

  const toggleSelectRow = (id: string) => {
    if (onSelectRows) {
      const updatedSelection = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      onSelectRows(updatedSelection);
    }
  };

  const isAllSelected =
    documents.length > 0 && selectedIds.length === documents.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < documents.length;
  const checkboxState = isAllSelected
    ? true
    : isIndeterminate
    ? "indeterminate"
    : false;

  const handleClickDocument = (doc: DocumentsListResponse) => {
    if (onDocumentClick) {
      onDocumentClick(doc);
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Mobile table */}
      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 lg:hidden">
        {documents.map((doc) => (
          <div key={doc.documentId} className="relative space-y-4 px-4 py-5">
            <div className="flex items-center gap-x-4 pb-5">
              {withCheckbox && (
                <Checkbox
                  className="relative z-30"
                  checked={selectedIds.includes(doc.documentId)}
                  onCheckedChange={() => toggleSelectRow(doc.documentId)}
                />
              )}
              <strong>{doc.filename}</strong>
            </div>

            <div className="flex items-center">
              <p className="mr-4 xs:mr-8">
                {doc.createdAt
                  ? format(new Date(doc.createdAt), "dd/MM/yy")
                  : t("invalidDate")}
              </p>

              <div className="ml-auto flex items-center gap-4 xs:gap-8">
                <button
                  type="button"
                  className="relative z-20"
                  onClick={() => onDeleteRow?.(doc.documentId)}
                >
                  <TrashIcon className="text-error-500" />
                </button>

                <ChevronIcon className="-rotate-90 text-neutral-300" />

                {/* Área clickable para abrir el documento */}
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => handleClickDocument(doc)}
                  aria-label={t("openDocument", { filename: doc.filename })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 lg:block">
        <table className="min-w-full divide-y divide-neutral-50">
          <thead className="bg-neutral-50">
            <tr className="text-left text-xs font-semibold uppercase">
              <th
                scope="col"
                className="flex items-center gap-4 px-4 py-[22px]"
              >
                {withCheckbox && (
                  <Checkbox
                    checked={checkboxState}
                    onCheckedChange={toggleSelectAll}
                  />
                )}
                {t("columnDocumentName")}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {t("columnDate")}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {t("columnParticipants")}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {t("columnStatus")}
              </th>
              <th scope="col" className="relative px-4 py-[22px]">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 bg-white">
            {documents.map((doc) => (
              <tr key={doc.documentId} className="relative">
                <td className="flex items-center gap-4 whitespace-nowrap px-4 py-5">
                  {withCheckbox && (
                    <Checkbox
                      className="relative z-30"
                      checked={selectedIds.includes(doc.documentId)}
                      onCheckedChange={() => toggleSelectRow(doc.documentId)}
                    />
                  )}
                  {doc.filename}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  {doc.createdAt
                    ? format(new Date(doc.createdAt), "dd/MM/yy")
                    : t("invalidDate")}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  {doc.participants?.length || 0}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  {/* Estado con traducción y estilo */}
                  {(() => {
                    const statusKey = doc.status as
                      | "completed"
                      | "pending"
                      | "rejected";
                    const bgClasses =
                      doc.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : doc.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : doc.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800";
                    const label =
                      t(`status.${statusKey}`) || t("status.default");
                    return (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgClasses}`}
                      >
                        {label}
                      </span>
                    );
                  })()}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  <div className="flex items-center gap-8 relative">
                    <button
                      type="button"
                      className="relative z-30"
                      onClick={() => onDeleteRow?.(doc.documentId)}
                    >
                      <TrashIcon className="text-error-500" />
                    </button>

                    <ChevronIcon className="-rotate-90 text-neutral-300" />

                    {/* Botón invisible por encima de la fila para capturar click */}
                    <button
                      type="button"
                      className="absolute inset-0"
                      onClick={() => handleClickDocument(doc)}
                      aria-label={t("openDocument", { filename: doc.filename })}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
