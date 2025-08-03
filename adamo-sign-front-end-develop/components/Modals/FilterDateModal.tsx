"use client";
import { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { Input } from "../ui/Input";
import { CalendarIcon, CancelFilledIcon /* CloseIcon */ } from "../icon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

// Define filter options type
interface Filter {
  id: string;
  label: string;
}

// Define the props for the modal
interface FilterDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (
    filterId: string | null,
    range: { startDate: Date; endDate: Date },
  ) => void;
}

// List of predefined filters
const filters: Filter[] = [
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
  { id: "lastMonth", label: "Mes pasado" },
  { id: "year", label: "Este año" },
  { id: "custom", label: "Personalizado" },
];

export const FilterDateModal = ({
  isOpen,
  onClose,
  onFilter,
}: FilterDateModalProps) => {
  const tg = useTranslations();
  // State for selected filter
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // State for custom date range
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  // State for managing popovers
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Handle date selection for the calendar
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setCustomDateRange({
      startDate: range?.from || null,
      endDate: range?.to || null,
    });
  };

  // Generate the date range based on the selected filter
  const getDateRange = (
    filterId: string | null,
  ): { startDate: Date; endDate: Date } => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (filterId) {
      case "week": // This week
        const dayOfWeek = now.getDay(); // 0 = Sunday
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
        startDate.setDate(now.getDate() - diffToMonday);
        break;

      case "month": // This month
        startDate.setDate(1); // Start at the first day of the month
        break;

      case "lastMonth": // Last month
        startDate.setMonth(now.getMonth() - 1);
        startDate.setDate(1);
        endDate.setMonth(now.getMonth() - 1);
        endDate.setDate(
          new Date(now.getFullYear(), now.getMonth(), 0).getDate(),
        );
        break;

      case "year": // This year
        startDate.setMonth(0); // Start at January
        startDate.setDate(1);
        break;

      case "custom": // Custom date range
        if (customDateRange?.startDate && customDateRange?.endDate) {
          return {
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate,
          };
        }
        break;

      default:
        break;
    }

    return { startDate, endDate };
  };

  // Dynamically update the popover value
  const popoverValue = (() => {
    if (
      selectedFilter === "custom" &&
      customDateRange.startDate &&
      customDateRange.endDate
    ) {
      return `${format(customDateRange.startDate, "dd/MM/yy")} al ${format(
        customDateRange.endDate,
        "dd/MM/yy",
      )}`;
    }
    return selectedFilter
      ? filters.find((filter) => filter.id === selectedFilter)?.label
      : "Último mes";
  })();

  // Handle applying the filter
  const handleFilter = () => {
    const range = getDateRange(selectedFilter);
    onFilter(selectedFilter, range);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            Filtrar documentos
          </DialogTitle>
          <DialogDescription>
            Filtra los documentos por fecha de interés:
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {/* Popover for selecting predefined filters */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Input
                type="button"
                iconRight={
                  selectedFilter === "custom" &&
                  customDateRange.startDate &&
                  customDateRange.endDate ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDateRange({ startDate: null, endDate: null });
                        setIsPopoverOpen(true);
                      }}
                    >
                      <CancelFilledIcon />
                    </button>
                  ) : (
                    <CalendarIcon />
                  )
                }
                value={popoverValue}
              />
            </PopoverTrigger>
            <PopoverContent>
              {filters.map((filter) => (
                <button
                  className="block w-full px-5 py-3 text-left hover:bg-neutral-50"
                  key={filter.id}
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setSelectedFilter(filter.id); // Use `id` instead of `label`
                    if (filter.id === "custom") setIsCalendarOpen(true);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Calendar for custom date selection */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger className="w-full"></PopoverTrigger>
            <PopoverContent className="-mt-5 w-min">
              <Calendar
                mode="range"
                defaultMonth={customDateRange.startDate || undefined}
                selected={{
                  from: customDateRange.startDate || undefined,
                  to: customDateRange.endDate || undefined,
                }}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {tg("cancel")}
          </Button>
          <Button onClick={handleFilter}>Filtrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
