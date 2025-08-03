"use client";
import React from "react";
/* import Link from "next/link"; */

import { Checkbox } from "../ui/Checkbox";
import { ChevronIcon, RestoreIcon, TrashIcon } from "../icon";
import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import { useTranslations } from "next-intl";

import { format } from "date-fns";

interface TableTrashProps extends React.HTMLAttributes<HTMLDivElement> {
  documents: DocumentsListResponse[];
  withCheckbox?: boolean;
  isDeleting?: boolean;
  selectedIds?: string[]; // Controlled selected IDs
  onSelectRows?: (selectedIds: string[]) => void; // Callback for selection changes
  onDeleteRow?: (id: string) => void; // Callback for deleting a single row
  onRestoreRow?: (id: string) => void;
  onDocumentClick?: (doc: DocumentsListResponse) => void; // Callback to redirect the user to the selected docuiment
}

export const TableTrash = ({
  documents = [],
  withCheckbox,
  isDeleting = false,
  selectedIds = [],
  onSelectRows,
  onDeleteRow,
  onRestoreRow,
  onDocumentClick
}: TableTrashProps) => {

  const t = useTranslations("AppDocuments");

  if (!documents || documents.length === 0) {
    return <div>{t("TablePending.noDocuments")}</div>;
  }
  const toggleSelectAll = () => {
    if (onSelectRows) {
      const allIds = documents.map((doc) => doc.documentId);
      onSelectRows(selectedIds.length === documents.length ? [] : allIds);
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

  const handleClickDocument = (doc: DocumentsListResponse) => {
    if (onDocumentClick) {
      onDocumentClick(doc);
    }
  };

  if (!documents.length) return <div>{t("TablePending.loading")}</div>;

  return (
    <div>
      {/* Mobile table */}
      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 lg:hidden">
        {documents.map((doc) => (
          <div key={doc.documentId} className="relative space-y-4 px-4 py-5">
            <div className="flex items-center gap-x-4 pb-5">
              {withCheckbox && (
                <Checkbox
                  className="relative z-20"
                  checked={selectedIds.includes(doc.documentId)}
                  onCheckedChange={() => toggleSelectRow(doc.documentId)}
                />
              )}

              <strong>{doc.filename || t("TablePending.untitled")}</strong>
            </div>

            <div className="flex items-center">
              <p className="mr-4 xs:mr-8">
                {doc.createdAt ? format(new Date(doc.createdAt), "dd/MM/yy")
                  : t("TablePending.invalidDate")}
              </p>

              <div className="ml-auto flex items-center gap-4 xs:gap-8">
                <button
                  type="button"
                  className="relative z-20"
                  onClick={() => onRestoreRow?.(doc.documentId)}
                >
                  <RestoreIcon />
                </button>

                <button
                  type="button"
                  className="relative z-20"
                  onClick={() => onDeleteRow?.(doc.documentId)}
                  disabled={isDeleting}
                >
                  <TrashIcon className="text-error-500" />
                </button>

                <ChevronIcon className="-rotate-90 text-neutral-300" />
                {/* <Link
                  className="absolute inset-0"
                  href={`/documents/${doc.documentId}`}
                  onClick={() => handleClickDocument(doc)}
                ></Link> */}
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => handleClickDocument(doc)}
                  aria-label={t("Stats.DraftDocuments.openDocument", { filename: doc.filename })}
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
                    className="relative z-20"
                    onClick={(e) => e.stopPropagation()}
                    checked={selectedIds.length === documents.length}
                    onCheckedChange={toggleSelectAll}
                  />
                )}
                {t("TablePending.documentName")}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {t("TablePending.date")}
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {t("TablePending.participants")}
              </th>
              <th scope="col" className="relative px-4 py-[22px]">
                <span className="sr-only">{t("TablePending.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 bg-white">
            {documents.map((doc) => (
              <tr key={doc.documentId} className="relative">
                <td className="flex items-center gap-4 whitespace-nowrap px-4 py-5">
                  {withCheckbox && (
                    <Checkbox
                      className="relative z-20"
                      onClick={(e) => e.stopPropagation()}
                      checked={selectedIds.includes(doc.documentId)}
                      onCheckedChange={() => toggleSelectRow(doc.documentId)}
                    />
                  )}

                  {doc.filename || t("TablePending.untitled")}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  {doc.createdAt ? format(new Date(doc.createdAt), "dd/MM/yy")
                    : t("TablePending.invalidDate")}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  {doc.participants?.length ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  <div className="flex items-center gap-8">
                    <button
                      type="button"
                      className="relative z-20"
                      onClick={() => onRestoreRow?.(doc.documentId)}
                    >
                      <RestoreIcon />
                    </button>

                    <button
                      type="button"
                      className="relative z-20"
                      onClick={() => onDeleteRow?.(doc.documentId)}
                      disabled={isDeleting}
                    >
                      <TrashIcon className="text-error-500" />
                    </button>

                    <ChevronIcon className="-rotate-90 text-neutral-300" />
                    {/* <Link
                      className="absolute inset-0"
                      href={`/documents/${doc.documentId}`}
                    ></Link> */}
                    <button
                      type="button"
                      className="absolute inset-0"
                      onClick={() => handleClickDocument(doc)}
                      aria-label={t("Stats.DraftDocuments.openDocument", { filename: doc.filename })}
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
