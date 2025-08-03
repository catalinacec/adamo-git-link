"use client";

import React, { useState } from "react";
import { FileManagerDocument, FileManagerFolder } from "@/types/FileManagerTypes";
import { DraggerIcon, CheckCircleIcon, CancelIcon, MoreIcon } from "@/components/icon";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { DocumentMenu } from "./DocumentMenu";

interface DocumentRowProps {
  document: FileManagerDocument;
  isSelected: boolean;
  onSelect: (documentId: string, isSelected: boolean) => void;
  onDragStart: (e: React.DragEvent, documentIds: string[]) => void;
  selectedDocumentIds: string[];
  folders: FileManagerFolder[];
  onMoveToFolder: (documentId: string, folderId: string) => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  isSelected,
  onSelect,
  onDragStart,
  selectedDocumentIds,
  folders,
  onMoveToFolder,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const getStatusIcon = () => {
    switch (document.status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <CancelIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    const dragIds = isSelected ? selectedDocumentIds : [document.id];
    onDragStart(e, dragIds);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.right - 256, // Menu width is 256px (w-64)
      y: rect.bottom + 4
    });
    setMenuOpen(true);
  };

  const handleMoveToFolder = (folderId: string) => {
    onMoveToFolder(document.id, folderId);
  };

  return (
    <div
      className="w-full h-16 bg-white border-b border-neutral-50 flex justify-start items-center cursor-move hover:bg-gray-50"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex-1 px-2 sm:px-4 flex justify-start items-center gap-2 sm:gap-4">
        {/* Document Icon */}
        <DraggerIcon className="w-6 h-6 text-zinc-400" />
        
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(document.id, !!checked)}
          className="w-5 h-5"
        />
        
        {/* Document Name */}
        <div className="flex-1 text-gray-500 text-sm sm:text-base font-normal font-['Open_Sans'] leading-normal truncate">
          {document.filename}
        </div>
      </div>
      
      {/* Date - Hidden on small screens */}
      <div className="hidden sm:flex w-20 md:w-36 px-2 md:px-4 justify-start items-center">
        <div className="flex-1 text-gray-500 text-sm md:text-base font-normal font-['Open_Sans'] leading-normal">
          {formatDate(document.createdAt)}
        </div>
      </div>
      
      {/* Participants - Hidden on small and medium screens */}
      <div className="hidden md:flex w-24 lg:w-36 px-2 lg:px-4 justify-start items-center">
        <div className="flex-1 text-gray-500 text-sm lg:text-base font-normal font-['Open_Sans'] leading-normal">
          {document.participants}
        </div>
      </div>
      
      {/* Status */}
      <div className="w-16 sm:w-32 md:w-56 px-2 sm:px-4 flex justify-start items-center">
        {document.status && (
          <div className="h-8 px-2 py-1 rounded-xl flex justify-start items-center gap-2">
            <div className="w-6 h-6 relative overflow-hidden flex justify-center items-center">
              {getStatusIcon()}
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="w-14 px-2 sm:px-4 flex justify-center items-center">
        <Button
          variant="link"
          size="medium"
          onClick={handleMoreClick}
          className="w-6 h-6 p-0 min-h-0 text-gray-400 hover:text-gray-600"
        >
          <MoreIcon className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Document Menu */}
      <DocumentMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onMoveToFolder={handleMoveToFolder}
        folders={folders}
        position={menuPosition}
        isInsideFolder={false}
        currentFolderId={document.folderId}
      />
    </div>
  );
};
