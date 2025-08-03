"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { FolderIcon } from "@/components/icon";

export const MyFilesCard: React.FC = () => {
  const t = useTranslations("fileManager.card");

  return (
    <div className="w-full max-w-none px-6 py-8 md:px-8 md:py-10 bg-white rounded-2xl border border-neutral-200 flex flex-col justify-start items-start gap-8 md:gap-10">
      <div className="w-full flex flex-col justify-start items-start gap-4">
        <div className="p-3 md:p-4 bg-slate-50 rounded-[40px] inline-flex justify-start items-start gap-2">
          <FolderIcon size={20} color="#363F72" className="md:w-6 md:h-6" />
        </div>
        <div className="w-full text-indigo-900 text-lg md:text-xl font-bold font-['Open_Sans'] leading-7">
          {t("title")}
        </div>
        <div className="w-full text-gray-700 text-sm md:text-base font-normal font-['Open_Sans'] leading-normal">
          {t("description")}
        </div>
      </div>
      
      <Button asChild variant="primary" size="large" className="w-full md:w-auto">
        <Link href="/documents/files">{t("buttonText")}</Link>
      </Button>
    </div>
  );
};
