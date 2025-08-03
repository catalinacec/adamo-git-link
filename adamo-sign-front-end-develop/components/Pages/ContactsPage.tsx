"use client";

import { ContactResponse } from "@/api/types/ContactTypes";
import ContactUseCase from "@/api/useCases/ContactUseCase";
import type { Mode } from "@/types";

import { useEffect, useState, useCallback } from "react";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { useToast } from "@/hooks/use-toast";

import { TableWrapper } from "../DocumentsTable";
import { ContactsTable } from "../Table/ContactsTable";
import { PersonAddIcon, RefreshIcon, SearchIcon, TrashIcon } from "../icon";
import { AppHeader } from "../ui/AppHeader";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Input } from "../ui/Input";
import { Pagination } from "../ui/pagination";


import { Toaster } from "../ui/toaster";


const DeleteContactModal = dynamic(() =>
  import("../Modals/DeleteContactModal").then((mod) => mod.DeleteContactModal),
);

const EditContactModal = dynamic(() =>
  import("../Modals/EditContactModal").then((mod) => mod.EditContactModal),
);

const AddContactModal = dynamic(() =>
  import("../Modals/AddContactModal").then((mod) => mod.AddContactModal),
);

const ITEMS_PER_PAGE = 15;

export const ContactsPage = () => {
  const { toast } = useToast();
  const t = useTranslations();
  const abortController = new AbortController();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("view");
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [contact, setContact] = useState<ContactResponse | null>(null);

  // Handle search functionality
  const handleSearch = async (term: string) => {
    setCurrentPage(1);
    setSearchTerm(term);
  };

  const handleDelete = (ids: number[] | string[]) => {
    // Convierte a string por si acaso
    const stringIds = ids.map((id) => String(id));
    setIdsToDelete(stringIds);
    setCurrentPage(1);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion
  const handleDeleted = async () => {
    if (idsToDelete.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }
    setIsDeleting(true);

    try {
      if (idsToDelete.length > 1) {
        await ContactUseCase.bulkDeleteContacts({ ids: idsToDelete }, abortController.signal);
      } else if (idsToDelete.length === 1) {
        await ContactUseCase.deleteContact(idsToDelete[0], abortController.signal);
      }
      setIsDeleteModalOpen(false);
      setSelectedIds([]); // Clear selected ids
      fetchContacts();
      toast({
        title: t("toasts.deletedContacts"),
      });
    } catch (error) {
      if (error) {
        toast({
          title: t("contactPage.deleteError"),
          variant: "error",
        });
      }
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (contact: ContactResponse, mode: Mode) => {
    setMode(mode);
    setContact(contact);
    setIsEditModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchContacts();
  };

  const filterContacts = () => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return contacts;

    // Divide by words
    const searchWords = search.split(/\s+/);

    return contacts.filter((contact) => {
      // Relevant fields to a single string
      const fullString = [contact.firstName, contact.lastName, contact.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchWords.every((word) => fullString.includes(word));
    });
  };

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ContactUseCase.getContactInfo();
      if (!Array.isArray(res.data)) return;
      const mappedContacts = res.data.map((contact: any) => ({
        ...contact,
        id: contact._id,
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: t("contactPage.fetchError"),
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = filterContacts();

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

  const effectivePage = Math.min(currentPage, totalPages || 1);

  const paginatedDocuments = filteredContacts.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE,
  );

  const hasSelectedRows = selectedIds.length > 0;

  return (
    <>
      <div className="space-y-4">
        <AppHeader
          heading={t("contacts")}
          onSearch={handleSearch}
          value={searchTerm}
        />

        <Container>
          <TableWrapper>
            <div className="flex justify-between gap-x-6 gap-y-4">
              <div className="flex items-center gap-6">
                {!hasSelectedRows && (
                  <Button variant="secondary" onClick={resetFilters}>
                    <RefreshIcon />
                  </Button>
                )}
                <h4 className="py-3 font-semibold text-neutral-800">
                  {filteredContacts.length} {t("contacts")}
                </h4>
              </div>

              {!hasSelectedRows && (
                <div className="flex items-center gap-6">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <PersonAddIcon />
                    <span className="hidden md:inline">{t("addContact")}</span>
                  </Button>
                  <div className="hidden w-full xl:block">
                    <Input
                      className="w-[330px]"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      iconLeft={<SearchIcon />}
                      placeholder={t("inputSearchContactPlaceholder")}
                    />
                  </div>
                </div>
              )}
            </div>

            {hasSelectedRows && (
              <Button
                variant="secondaryError"
                className="self-start"
                onClick={() => handleDelete(selectedIds)}
              >
                <TrashIcon />
                <span className="hidden md:inline">{t("deleteSelected")}</span>
              </Button>
            )}

            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-neutral-600">{t("contactPage.loading")}</p>
              </div>
            ) : paginatedDocuments.length > 0 ? (
              <ContactsTable
                contacts={paginatedDocuments.map((contact) => ({
                  ...contact,
                  id: String(contact.id),
                }))}
                selectedIds={selectedIds}
                onSelectRows={setSelectedIds}
                onDeleteRow={(id) => handleDelete([id])}
                onEdit={(contact, mode) =>
                  handleEdit(
                    {
                      ...contact,
                      id: String(contact.id),
                    },
                    mode,
                  )
                }
              />
            ) : (
              <p className="p-4 text-center">
                {t("noResults")}
                <Button variant="link" onClick={resetFilters} className="ml-2">
                  {t("resetFilter")}
                </Button>
              </p>
            )}
            <div className="mt-6">
              {totalPages > 1 && (
                <Pagination
                  total={filteredContacts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={currentPage}
                  onPageChange={(page) => {
                    setSelectedIds([]);
                    setCurrentPage(page);
                  }}
                />
              )}
            </div>
          </TableWrapper>
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="flex items-start justify-center p-4 pointer-events-auto">
              <Toaster />
            </div>
          </div>
        </Container>
      </div>

      <DeleteContactModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleted}
        isLoading={isDeleting}
      />

      <EditContactModal
        isOpen={isEditModalOpen}
        mode={mode}
        contact={contact ? { ...contact, id: String(contact.id) } : null}
        onClose={() => setIsEditModalOpen(false)}
        onChangeMode={(mode: Mode) => setMode(mode)}
        onSuccess={() => {
          fetchContacts();
          toast({
            title: t("toasts.updatedContact"),
          });
        }}
      />

      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
          toast({
            title: t("toasts.addedContact"),
          });
        }}
      />
    </>
  );
};
