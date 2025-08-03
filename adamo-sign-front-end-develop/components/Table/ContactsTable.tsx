import type { ContactType } from "@/schemas/contactSchema";

import { useTranslations } from "next-intl";

import { MoreIcon } from "../icon";
import { Checkbox } from "../ui/Checkbox";
import {
  Popover,
  PopoverContent,
  PopoverContentItem,
  PopoverTrigger,
} from "../ui/popover";

// Reusable Row Actions Component
const RowActions = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const t = useTranslations();
  return (
    <Popover>
      <PopoverTrigger onClick={(e) => e.stopPropagation()}>
        <MoreIcon />
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverContentItem asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            {t("editContact")}
          </button>
        </PopoverContentItem>
        <PopoverContentItem asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            {t("deleteContact")}
          </button>
        </PopoverContentItem>
      </PopoverContent>
    </Popover>
  );
};

interface ContactsTableProps {
  contacts: ContactType[];
  selectedIds?: string[];
  onSelectRows?: (selectedIds: string[]) => void;
  onDeleteRow?: (id: string) => void;
  onEdit?: (contact: ContactType, mode: "view" | "edit") => void;
}

export const ContactsTable = ({
  contacts = [],
  selectedIds = [],
  onSelectRows,
  onDeleteRow,
  onEdit,
}: ContactsTableProps) => {
  const t = useTranslations();

  // Selection logic
  const toggleSelectRow = (id: string) => {
    if (onSelectRows) {
      const updatedSelection = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      onSelectRows(updatedSelection);
    }
  };

  const toggleSelectAll = () => {
    if (onSelectRows) {
      const allIds = contacts.map((item) => item.id);
      onSelectRows(selectedIds.length === contacts.length ? [] : allIds);
    }
  };

  // Reusable Table Row
  const renderRow = (item: ContactType) => {
    const { id, firstName, lastName, email } = item;

    return (
      <tr
        key={id}
        className="relative cursor-pointer hover:bg-neutral-50"
        onClick={() => onEdit?.(item, "view")}
      >
        <td className="flex items-center gap-4 whitespace-nowrap px-4 py-5">
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            checked={selectedIds.includes(id)}
            onCheckedChange={() => toggleSelectRow(id)}
          />
          {firstName} {lastName}
        </td>
        <td className="whitespace-nowrap px-4 py-5">{email}</td>
        <td className="whitespace-nowrap px-4 py-5">
          <div className="flex justify-end">
            <RowActions
              onEdit={() => onEdit?.(item, "edit")}
              onDelete={() => onDeleteRow?.(id)}
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {/* Mobile table */}
      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 lg:hidden">
        {contacts.map((item) => (
          <div
            key={item.id}
            className="relative space-y-4 px-4 py-5"
            onClick={() => onEdit?.(item, "view")}
          >
            <div className="flex items-center gap-x-4 pb-5">
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => toggleSelectRow(item.id)}
              />
              <strong>
                {item.firstName} {item.lastName}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <p>{item.email}</p>
              <RowActions
                onEdit={() => onEdit?.(item, "edit")}
                onDelete={() => onDeleteRow?.(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 lg:block">
        <table className="min-w-full divide-y divide-neutral-50">
          <thead className="bg-neutral-50">
            <tr className="text-left text-xs font-semibold uppercase">
              <th
                scope="col"
                className="flex items-center gap-4 px-4 py-[22px]"
              >
                <Checkbox
                  checked={selectedIds.length === contacts.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span>{t("name")}</span>
              </th>
              <th scope="col" className="px-4 py-[22px]">
                {t("email")}
              </th>
              <th scope="col" className="relative px-4 py-[22px]">
                <span className="sr-only">{t("actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 bg-white">
            {contacts.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
