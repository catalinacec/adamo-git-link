"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useDocMenu } from "@/context/DocMenuContext";
import { cn } from "@/lib/utils";

import { SidebarOpen } from "../Sidebar/Sidebar";
import {
  CancelFilledIcon,
  ChevronIcon,
  DraggerIcon,
  SearchIcon,
} from "../icon";
import { Container } from "./Container";

interface AppHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  heading: string;
  value?: string;
  disableSidebarTrigger?: boolean;
  transparent?: boolean;
  isDocMenu?: boolean;
  onSearch?: (searchTerm: string) => void;
  onClick?: () => void; 
}

export const AppHeader = ({
  href,
  heading,
  value = "",
  disableSidebarTrigger = false,
  transparent = false,
  isDocMenu = false,
  onSearch,
  onClick,
  className,
  ...rest
}: AppHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleResize = useCallback(() => {
    if (isOpen) setIsOpen(false);
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const { setOpen } = useDocMenu();

  return (
    <div
      className={cn(
        "sticky top-0 z-40 text-white xl:relative",
        transparent
          ? "bg-transparent"
          : "bg-primary xl:bg-transparent xl:text-neutral-800",
        className,
      )}
      {...rest}
    >
      <Container className="flex items-center justify-between py-4">
        {isOpen ? (
          <div className="relative flex w-full items-center gap-4 xl:hidden">
            <SearchIcon aria-hidden="true" />
            <input
              autoFocus
              type="text"
              placeholder="Busca un documento..."
              className="bg-transparent outline-none focus:outline-none"
              onChange={(e) => onSearch?.(e.target.value)}
              value={value}
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-0 text-neutral-400"
              aria-label="Close search"
            >
              <CancelFilledIcon />
            </button>
          </div>
        ) : (
            <>
            {href && !onClick ? (
              <Link 
              href={href} 
              className="inline-flex items-center space-x-4 cursor-pointer py-3 px-2 -ml-1 min-w-0 flex-1 xl:flex-initial"
              style={{ minHeight: 40 }}
              >
              <ChevronIcon className="rotate-90 flex-shrink-0" />
              <span className="font-semibold truncate">{heading}</span>
              </Link>
            ) : onClick ? (
              <button
              type="button"
              onClick={onClick}
              className="inline-flex items-center space-x-4 cursor-pointer bg-transparent py-3 px-2 -ml-1 min-w-0 flex-1 xl:flex-initial"
              style={{ minHeight: 40 }}
              >
              <ChevronIcon className="rotate-90 flex-shrink-0" />
              <span className="font-semibold truncate">{heading}</span>
              </button>
            ) : (
              <p className="font-semibold py-3 px-2 -ml-1" style={{ minHeight: 40 }}>{heading}</p>
            )}
            {!disableSidebarTrigger && (
              <div className="flex items-center gap-6 xl:hidden">
              {onSearch && (
                <button type="button" onClick={() => setIsOpen(true)} className="p-2">
                <SearchIcon aria-hidden="true" aria-label="Open search" />
                </button>
              )}
              {isDocMenu && (
                <button
                className={cn("text-white p-2", className)}
                onClick={() => setOpen(true)}
                >
                <DraggerIcon />
                <span className="sr-only">Open Doc menu</span>
                </button>
              )}
              <SidebarOpen />
              </div>
            )}
            </>
        )}
      </Container>
    </div>
  );
};
