"use client";

import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import ContactUseCase from "../../api/useCases/ContactUseCase";
import { SearchIcon } from "../icon";
import { Input } from "../ui/Input";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

interface SearchContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (participant: any) => void;
}

export const SearchContactModal = ({
  isOpen,
  onClose,
  onConfirm,
}: SearchContactModalProps) => {
  const t = useTranslations();

  const [participants, setParticipants] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("participants");
    if (stored) {
      try {
        const parsed: any[] = JSON.parse(stored);
        setParticipants(parsed);
      } catch (e) {
        console.error("Failed to parse participants from localStorage:", e);
        setParticipants([]);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const texto = query.trim();
    if (texto === "") {
      setParticipants([]);
      setLoading(false);
      setError(null);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);
      setError(null);

      ContactUseCase.searchContacts(texto, controller.signal)
        .then((resp) => {
          console.log("Lista final de contactos:", resp);
          const lista: any[] = Array.isArray(resp) ? resp : (resp.data ?? []);
          setParticipants(lista);
        })
        .catch((err) => {
          if ((err as any).name === "AbortError") {
            return;
          }
          console.error("Error buscando contactos:", err);
          setError(
            t("searchContactModal.errorSearch") || "Error al buscar contactos",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, t]);

  useEffect(() => {
    if (!isOpen) {
      setIsListOpen(false);
      setSelectedContact(null);
      setQuery("");
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSelect = (participant: any) => {
    setQuery(`${participant.firstName} ${participant.lastName}`);
    setIsListOpen(false);
    setSelectedContact(participant);
  };

  const open = isListOpen && query !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("searchContactModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("searchContactModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8">
          <Command className="relative" data-command={open}>
            <CommandInput asChild>
              <Input
                value={query}
                onChange={(e) => {
                  setIsListOpen(true);
                  setQuery(e.target.value);
                }}
                placeholder={t("inputSearchContactPlaceholder")}
                iconLeft={<SearchIcon />}
              />
            </CommandInput>

            {open && (
              <CommandList
                className={cn(
                  "absolute left-0 top-[54px] w-full bg-white shadow-lg rounded-md z-50",
                )}
              >
                {loading && (
                  <div className="p-2 text-center text-sm text-neutral-500">
                    {t("searchContactModal.loading") || "Buscando contactos..."}
                  </div>
                )}
                {error && !loading && (
                  <div className="p-2 text-center text-sm text-red-500">
                    {error}
                  </div>
                )}
                {!loading && !error && participants.length === 0 && (
                  <CommandEmpty>
                    {t("searchContactModal.noResults")}
                  </CommandEmpty>
                )}
                {participants.map((participant) => (
                  <CommandItem
                    key={
                      participant.id ??
                      participant.email /* Ajusta key según tu entidad */
                    }
                    value={`${participant.firstName} ${participant.lastName} ${participant.email}`.toLowerCase()}
                    onSelect={() => handleSelect(participant)}
                  >
                    {/* {participant.color && ( */}
                    <span
                      className="ml-2 h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: participant.color }}
                    ></span>
                    {/* )} */}
                    <span className="ml-2 inline-flex shrink-0 text-neutral-700">
                      {participant.firstName} {participant.lastName}
                    </span>
                    <span className="ml-2 truncate text-neutral-400">
                      {participant.email}
                    </span>
                  </CommandItem>
                ))}
              </CommandList>
            )}
          </Command>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          {query && selectedContact && (
            <Button onClick={() => onConfirm(selectedContact)}>
              {t("continue")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
