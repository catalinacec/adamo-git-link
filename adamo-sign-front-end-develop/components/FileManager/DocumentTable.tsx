"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FileManagerDocument, FileManagerFolder } from "@/types/FileManagerTypes";
import { DocumentRow } from "./DocumentRow";
import { Checkbox } from "@/components/ui/Checkbox";
import { Pagination } from "@/components/ui/pagination";

interface DocumentTableProps {
  documents: FileManagerDocument[];
  selectedDocumentIds: string[];
  onSelectDocument: (documentId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  searchQuery: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  folders: FileManagerFolder[];
  onMoveToFolder: (documentId: string, folderId: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedDocumentIds,
  onSelectDocument,
  onSelectAll,
  searchQuery,
  currentPage,
  onPageChange,
  folders,
  onMoveToFolder,
}) => {
  const t = useTranslations("fileManager.documents");
  const ITEMS_PER_PAGE = 15;
  
  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  const isAllSelected = paginatedDocuments.length > 0 && 
    paginatedDocuments.every(doc => selectedDocumentIds.includes(doc.id));

  const handleDragStart = (e: React.DragEvent, documentIds: string[]) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(documentIds));
  };

  return (
    <div className="rounded-2xl border border-neutral-200 flex flex-col justify-start items-start overflow-hidden">
      {/* Table Header */}
      <div className="w-full h-16 bg-gray-50 border-b border-neutral-50 flex justify-start items-center">
        <div className="flex-1 px-2 sm:px-4 flex justify-start items-center gap-2 sm:gap-4">
          {/* Invisible spacer for document icon */}
          <div className="w-6 h-6"></div>
          
          {/* Master Checkbox */}
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            className="w-5 h-5"
          />
          
          <div className="flex-1 text-gray-500 text-xs font-semibold font-['Open_Sans'] leading-tight">
            {t("table.documentName")}
          </div>
        </div>
        
        <div className="hidden sm:flex w-20 md:w-36 px-2 md:px-4 justify-start items-center">
          <div className="flex-1 text-gray-500 text-xs font-semibold font-['Open_Sans'] leading-tight">
            {t("table.date")}
          </div>
        </div>
        
        <div className="hidden md:flex w-24 lg:w-36 px-2 lg:px-4 justify-start items-center">
          <div className="flex-1 text-gray-500 text-xs font-semibold font-['Open_Sans'] leading-tight">
            {t("table.participants")}
          </div>
        </div>
        
        <div className="w-16 sm:w-32 md:w-56 px-2 sm:px-4 flex justify-between items-center">
          <div className="flex-1 text-gray-500 text-xs font-semibold font-['Open_Sans'] leading-tight">
            {t("table.status")}
          </div>
        </div>
        
        <div className="w-14 px-2 sm:px-4 flex justify-center items-center">
          {/* Actions column header - empty */}
        </div>
      </div>

      {/* Document Rows */}
      {paginatedDocuments.length > 0 ? (
        paginatedDocuments.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            isSelected={selectedDocumentIds.includes(document.id)}
            onSelect={onSelectDocument}
            onDragStart={handleDragStart}
            selectedDocumentIds={selectedDocumentIds}
            folders={folders}
            onMoveToFolder={onMoveToFolder}
          />
        ))
      ) : (
        <div className="w-full h-32 flex justify-center items-center">
          <div className="text-gray-500 text-base">
            {searchQuery ? t("noResults") : t("noDocuments")}
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {filteredDocuments.length > ITEMS_PER_PAGE && (
        <div className="w-full flex justify-center mt-6">
          <Pagination
            total={filteredDocuments.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={safePage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
