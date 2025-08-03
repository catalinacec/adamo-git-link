"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState("");
  const t = useTranslations("fileManager.modal.createFolder");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName("");
      onClose();
    }
  };

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 bg-white rounded-2xl p-4 sm:p-8 w-full max-w-[808px] mx-4 flex flex-col justify-start items-start gap-8 sm:gap-14">
        <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-8">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-center text-gray-700 text-base font-bold font-['Open_Sans'] leading-normal">
              {t("title")}
            </div>
            <div className="self-stretch justify-center text-gray-500 text-base font-normal font-['Open_Sans'] leading-normal">
              {t("description")}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch h-12 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-2">
              <div className="flex-1 flex justify-start items-center gap-2">
                <div className="flex-1 flex justify-start items-start gap-1">
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder={t("placeholder")}
                    className="w-full bg-transparent border-none outline-none text-gray-900 text-base font-normal font-['Open_Sans'] placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-6 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 px-5 py-3 bg-violet-100 rounded-xl flex justify-center items-center gap-2 overflow-hidden w-full sm:w-auto"
          >
            <div className="text-center justify-center text-indigo-900 text-base font-semibold font-['Open_Sans'] leading-normal">
              {t("cancel")}
            </div>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!folderName.trim()}
            className="h-12 px-5 py-3 bg-indigo-900 rounded-xl flex justify-center items-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <div className="text-center justify-center text-white text-base font-semibold font-['Open_Sans'] leading-normal">
              {t("create")}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
