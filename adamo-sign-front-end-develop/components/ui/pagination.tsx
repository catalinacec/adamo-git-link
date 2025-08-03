"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronIcon } from "../icon";
import { useTranslations } from "next-intl";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  total: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = (props: PaginationProps) => {
  const { total, itemsPerPage, currentPage, onPageChange, className } = props;
  const totalPages = Math.ceil(total / itemsPerPage);

  const t = useTranslations("AppDocuments.Stats.DraftDocuments");

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm text-neutral-600",
              i === currentPage && "bg-neutral-100"
            )}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={i} className="text-sm text-neutral-600">
            ...
          </span>
        );
      }
    }

    return pages;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        className={cn(
          "inline-flex items-center gap-3 rounded-lg",
          currentPage === 1 && "hidden"
        )}
      >
        <ChevronIcon className="rotate-90" />
        <span className="text-sm text-neutral-600">
          {t("previousPage")}
        </span>
      </button>

      {renderPageNumbers()}

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        className={cn(
          "inline-flex items-center gap-3 rounded-lg",
          currentPage === totalPages && "hidden"
        )}
      >
        <span className="text-sm text-neutral-600">
          {t("nextPage")}
        </span>
        <ChevronIcon className="-rotate-90" />
      </button>
    </div>
  );
};
