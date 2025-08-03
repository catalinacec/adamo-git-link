"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FileManagerFolder, FileManagerDocument } from "@/types/FileManagerTypes";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { PlusIcon, DraggerIcon, CheckCircleIcon, CancelIcon, MoreIcon } from "@/components/icon";
import { DocumentMenu } from "./DocumentMenu";

interface FolderCardProps {
  folder: FileManagerFolder;
  documents: FileManagerDocument[];
  onToggle: (folderId: string) => void;
  onDrop: (folderId: string, documentIds: string[]) => void;
  searchQuery?: string;
  selectedDocumentIds: string[];
  onSelectDocument: (documentId: string, isSelected: boolean) => void;
  folders: FileManagerFolder[];
  onMoveToFolder: (documentId: string, folderId: string) => void;
  onRemoveFromFolder: (documentId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  documents,
  onToggle,
  onDrop,
  searchQuery = "",
  selectedDocumentIds,
  onSelectDocument,
  folders,
  onMoveToFolder,
  onRemoveFromFolder,
}) => {
  const t = useTranslations("fileManager.folders");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const folderDocuments = documents.filter(doc => doc.folderId === folder.id);
  
  // Filter documents that match the search query when there's an active search
  const displayDocuments = searchQuery 
    ? folderDocuments.filter(doc => 
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : folderDocuments;
  
  // Function to highlight search text in filename
  const highlightSearchText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 text-yellow-800">{part}</span>
      ) : part
    );
  };

  const handleDocumentDragStart = (e: React.DragEvent, document: FileManagerDocument) => {
    const isDocumentSelected = selectedDocumentIds.includes(document.id);
    const dragIds = isDocumentSelected ? selectedDocumentIds : [document.id];
    e.dataTransfer.setData('text/plain', JSON.stringify(dragIds));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <CancelIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if any of the dragged documents are already in this folder
    try {
      const documentIds = JSON.parse(e.dataTransfer.getData('text/plain') || '[]');
      const hasDocumentsToMove = documentIds.some((docId: string) => {
        const doc = documents.find(d => d.id === docId);
        return doc && doc.folderId !== folder.id;
      });
      
      if (hasDocumentsToMove) {
        e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
      } else {
        e.currentTarget.classList.add('bg-yellow-50', 'border-yellow-300');
      }
    } catch {
      e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300', 'bg-yellow-50', 'border-yellow-300');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300', 'bg-yellow-50', 'border-yellow-300');
    
    const documentIds = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Filter out documents that are already in this folder
    const documentsToMove = documentIds.filter((docId: string) => {
      const doc = documents.find(d => d.id === docId);
      return doc && doc.folderId !== folder.id;
    });
    
    if (documentsToMove.length > 0) {
      onDrop(folder.id, documentsToMove);
    }
  };

  const handleDocumentMenuClick = (e: React.MouseEvent, documentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 256; // w-64 = 16rem = 256px
    const menuHeight = 200; // Estimated height
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Calculate x position (align to right edge of button, but don't go off screen)
    let x = rect.right - menuWidth;
    if (x < 10) {
      x = rect.left; // If it would go off the left edge, align to left instead
    }
    if (x + menuWidth > viewport.width - 10) {
      x = viewport.width - menuWidth - 10; // Keep some margin from right edge
    }
    
    // Calculate y position (below button, but don't go off bottom of screen)
    let y = rect.bottom + 5;
    if (y + menuHeight > viewport.height - 10) {
      y = rect.top - menuHeight - 5; // Show above button if needed
    }
    
    // Ensure minimum margins from screen edges
    x = Math.max(10, Math.min(x, viewport.width - menuWidth - 10));
    y = Math.max(10, Math.min(y, viewport.height - menuHeight - 10));
    
    setMenuPosition({ x, y });
    setMenuOpen(documentId);
  };

  const handleMenuClose = () => {
    setMenuOpen(null);
  };

  const handleMoveToFolderFromMenu = (targetFolderId: string) => {
    if (menuOpen) {
      onMoveToFolder(menuOpen, targetFolderId);
      setMenuOpen(null);
    }
  };

  const handleRemoveFromFolderFromMenu = () => {
    if (menuOpen) {
      onRemoveFromFolder(menuOpen);
      setMenuOpen(null);
    }
  };

  return (
    <div
      className="rounded-2xl border border-neutral-200 flex flex-col justify-start items-start overflow-hidden transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-full h-16 bg-gray-50 border-b border-neutral-50 flex justify-start items-center px-2 sm:px-4">
        <div className="flex-1 flex justify-start items-center gap-2 sm:gap-4">
          <div className="flex-1 text-gray-500 text-xs font-semibold font-['Open_Sans'] leading-tight uppercase truncate">
            {highlightSearchText(folder.name, searchQuery)}
          </div>
        </div>
        <div className="w-20 sm:w-32 md:w-64 flex justify-start items-center gap-2 px-2 sm:px-4">
          <div className="flex-1 text-gray-500 text-xs font-semibold font-['Open_Sans'] leading-tight">
            <span className="hidden sm:inline">
              {searchQuery ? `${displayDocuments.length}/${folderDocuments.length}` : folderDocuments.length} {t("documentsCount")}
            </span>
            <span className="sm:hidden">
              {searchQuery ? `${displayDocuments.length}/${folderDocuments.length}` : folderDocuments.length}
            </span>
          </div>
        </div>
        <div className="flex justify-start items-center gap-2 px-2 sm:px-4">
          <Button
            variant="link"
            size="medium"
            onClick={() => onToggle(folder.id)}
            className="w-6 h-6 p-0 min-h-0 text-gray-500 hover:text-gray-700"
          >
            <PlusIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {folder.isExpanded && (
        <div className="w-full bg-white">
          {displayDocuments.length === 0 ? (
            <div className="p-4 text-gray-400 italic text-center">
              {searchQuery ? t("noSearchResults") : t("emptyFolder")}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 flex flex-col justify-start items-start overflow-hidden">
              {/* Document Rows - No headers as per Figma */}
              {displayDocuments.map((document) => (
                <div
                  key={document.id}
                  className="w-full h-16 bg-white border-b border-neutral-50 flex justify-start items-center hover:bg-gray-50 cursor-move"
                  draggable
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                >
                  <div className="flex-1 px-4 flex justify-start items-center gap-4">
                    <DraggerIcon className="w-6 h-6 text-zinc-400" />
                    
                    {/* Checkbox for selection */}
                    <Checkbox
                      checked={selectedDocumentIds.includes(document.id)}
                      onCheckedChange={(checked) => onSelectDocument(document.id, !!checked)}
                      className="w-5 h-5"
                    />
                    
                    <div className="flex-1 text-gray-500 text-sm sm:text-base font-normal font-['Open_Sans'] leading-normal truncate">
                      {highlightSearchText(document.filename, searchQuery)}
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex w-20 md:w-44 px-4 justify-start items-center">
                    <div className="flex-1 text-gray-500 text-sm md:text-base font-normal font-['Open_Sans'] leading-normal">
                      {formatDate(document.createdAt)}
                    </div>
                  </div>
                  
                  <div className="hidden md:flex w-24 lg:w-44 px-4 justify-start items-center">
                    <div className="flex-1 text-gray-500 text-sm lg:text-base font-normal font-['Open_Sans'] leading-normal">
                      {document.participants} participantes
                    </div>
                  </div>
                  
                  <div className="w-14 px-4 flex justify-end items-center">
                    <div className="flex justify-start items-center gap-2">
                      {document.status && (
                        <div className="w-6 h-6 relative overflow-hidden flex justify-center items-center">
                          {getStatusIcon(document.status)}
                        </div>
                      )}
                      <Button
                        variant="link"
                        size="medium"
                        onClick={(e) => handleDocumentMenuClick(e, document.id)}
                        className="w-6 h-6 p-0 min-h-0 text-gray-400 hover:text-gray-600"
                      >
                        <MoreIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Document Menu */}
      <DocumentMenu
        isOpen={!!menuOpen}
        onClose={handleMenuClose}
        onMoveToFolder={handleMoveToFolderFromMenu}
        onRemoveFromFolder={handleRemoveFromFolderFromMenu}
        folders={folders}
        position={menuPosition}
        isInsideFolder={true}
        currentFolderId={folder.id}
      />
    </div>
  );
};
