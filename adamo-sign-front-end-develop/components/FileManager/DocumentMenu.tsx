"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { FileManagerFolder } from "@/types/FileManagerTypes";
import { SearchIcon, ChevronIcon } from "@/components/icon";

interface DocumentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMoveToFolder: (folderId: string) => void;
  onRemoveFromFolder?: () => void;
  folders: FileManagerFolder[];
  position: { x: number; y: number };
  isInsideFolder?: boolean;
  currentFolderId?: string | null;
}

export const DocumentMenu: React.FC<DocumentMenuProps> = ({
  isOpen,
  onClose,
  onMoveToFolder,
  onRemoveFromFolder,
  folders,
  position,
  isInsideFolder = false,
  currentFolderId = null,
}) => {
  const t = useTranslations("fileManager.documentMenu");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoveToSubmenu, setShowMoveToSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    folder.id !== currentFolderId // Don't show current folder
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset submenu when menu opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowMoveToSubmenu(false);
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const menuStyle = {
    position: 'fixed' as const,
    top: position.y,
    left: position.x,
    zIndex: 1000,
  };

  const menuContent = (
    <div
      ref={menuRef}
      style={menuStyle}
      className="w-64 bg-white rounded-lg shadow-[0px_2px_12px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start overflow-hidden"
    >
      {isInsideFolder ? (
        // Menu for documents inside folders
        <>
          {!showMoveToSubmenu ? (
            // Main menu
            <>
              {onRemoveFromFolder && (
                <button
                  onClick={() => {
                    onRemoveFromFolder();
                    onClose();
                  }}
                  className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                    {t("removeFromFolder")}
                  </div>
                </button>
              )}
              <button
                className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3 hover:bg-gray-50 transition-colors group"
                onClick={() => setShowMoveToSubmenu(true)}
              >
                <div className="flex-1 text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                  {t("moveTo")}
                </div>
                <div className="w-6 h-6 relative">
                  <ChevronIcon className="w-1.5 h-2.5 text-gray-600 transform -rotate-90" />
                </div>
              </button>
            </>
          ) : (
            // Move to submenu - same as main table menu
            <>
              {/* Back button */}
              <button
                onClick={() => setShowMoveToSubmenu(false)}
                className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-6 h-6 relative">
                  <ChevronIcon className="w-1.5 h-2.5 text-gray-600 transform rotate-90" />
                </div>
                <div className="text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                  {t("moveTo")}
                </div>
              </button>
              
              {/* Search input */}
              <div className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3">
                <div className="w-5 h-5 relative overflow-hidden">
                  <SearchIcon className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <input
                  type="text"
                  placeholder={t("searchFolder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal bg-transparent border-none outline-none placeholder-gray-400"
                  autoFocus
                />
              </div>
              
              {/* Folder list */}
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onMoveToFolder(folder.id);
                    onClose();
                  }}
                  className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                    {folder.name}
                  </div>
                </button>
              ))}
              
              {filteredFolders.length === 0 && searchQuery && (
                <div className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3">
                  <div className="text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal">
                    {t("noFoldersFound")}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        // Menu for documents in main table
        <>
          {/* Search input */}
          <div className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3">
            <div className="w-5 h-5 relative overflow-hidden">
              <SearchIcon className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <input
              type="text"
              placeholder={t("searchFolder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal bg-transparent border-none outline-none placeholder-gray-400"
              autoFocus
            />
          </div>
          
          {/* Folder list */}
          {filteredFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => {
                onMoveToFolder(folder.id);
                onClose();
              }}
              className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                {folder.name}
              </div>
            </button>
          ))}
          
          {filteredFolders.length === 0 && searchQuery && (
            <div className="self-stretch px-5 py-3 border-b border-gray-100 flex justify-start items-center gap-3">
              <div className="text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal">
                {t("noFoldersFound")}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Use portal to render menu outside of any containers that might affect positioning
  return typeof document !== 'undefined' ? createPortal(menuContent, document.body) : null;
};
