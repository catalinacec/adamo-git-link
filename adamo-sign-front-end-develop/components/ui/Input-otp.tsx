"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & {
    isError?: boolean;
    variant?: "light" | "dark";
    helperText?: string;
  }
>(
  (
    {
      className,
      containerClassName,
      isError = false,

      helperText,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("input-wrapper", isError && "error")}>
        <OTPInput
          ref={ref}
          containerClassName={cn(
            "flex items-center justify-center gap-2 has-[:disabled]:opacity-50",
            containerClassName,
          )}
          className={cn("disabled:cursor-not-allowed", className)}
          {...props}
        />
        <p className="input-helper">{helperText}</p>
      </div>
    );
  },
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full items-center justify-between gap-4", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number; isError?: boolean }
>(({ index, isError = false, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-[53px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-white text-base text-neutral-700 transition-all",
        isActive &&
          !isError &&
          "z-10 ring-[4px] ring-adamo-sign-300/25 ring-offset-2 ring-offset-adamo-sign-200",
        isActive &&
          isError &&
          "z-10 border-error-500 ring-[4px] ring-error-500/25 ring-offset-2 ring-offset-error-500",
        isError && "border-error-500 ring-error-500/25 ring-offset-error-500",

        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground h-4 w-px animate-caret-blink duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPGroup, InputOTPSlot };
