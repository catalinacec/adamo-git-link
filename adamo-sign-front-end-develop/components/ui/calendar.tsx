"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/Button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full rounded-lg bg-white p-4", className)}
      classNames={{
        months: "w-full",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center relative items-center",
        caption_label: "text-sm text-neutral-700 font-semibold py-2.5",
        nav: "flex items-start ",
        button_previous: cn(
          buttonVariants({ variant: "secondary" }),
          "py-2 px-2.5 bg-adamo-sign-100 rounded-xl absolute left-4 z-10",
        ),
        button_next: cn(
          buttonVariants({ variant: "secondary" }),
          "py-2 px-2.5 bg-adamo-sign-100 rounded-xl absolute right-4 z-10",
        ),
        month_grid: "w-full border-collapse space-y-4",
        weekdays: "",
        weekday:
          "text-neutral-700 text-sm rounded-md w-[34px] h-[34px] font-normal",
        week: "w-full",
        day_button:
          "h-[34px] w-[34px] text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-adamo-sign-100 [&:has([aria-selected])]:bg-adamo-sign-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "w-[34px] h-[34px] p-0 font-semibold aria-selected:opacity-100",
        ),

        selected:
          "bg-adamo-sign-600 rounded-md text-white hover:bg-adamo-sign-600 hover:text-white focus:bg-adamo-sign-600 focus:text-white",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-neutral-300 aria-selected:bg-accent/50 aria-selected:text-neutral-300",
        disabled: "text-neutral-300 opacity-50",
        range_end: "day-range-end  ",
        range_middle:
          "aria-selected:bg-adamo-sign-100 aria-selected:text-neutral-700 rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-6 w-6 text-neutral-600" />;
          }
          return <ChevronRight className="h-6 w-6 text-neutral-600" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
