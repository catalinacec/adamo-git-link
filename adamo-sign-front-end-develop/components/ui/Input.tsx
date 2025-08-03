import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variants for styling the Input component
const inputVariants = cva("input", {
  variants: {
    variant: {
      light: "input-light",
      dark: "input-dark",
      error: "input-error",
    },
  },
});

interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  /** Whether the input is in an error state */
  isError?: boolean;

  /** The label for the input */
  label?: string | React.ReactNode;

  /** Helper text displayed below the input */
  helperText?: string;

  /** Optional icon displayed on the left side of the input */
  iconLeft?: React.ReactNode;

  /** Optional icon displayed on the right side of the input */
  iconRight?: React.ReactNode;
}

/**
 * Input component with support for labels, helper text, icons, and various styles.
 * Designed for accessibility and reusability.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    id,
    className,
    type = "text",
    iconLeft,
    iconRight,
    isError,
    label,
    helperText,
    variant = "light",
    disabled,
    ...rest
  } = props;

  // Determine the applied variant

  return (
    <div className={cn("input-wrapper", variant, isError && "error")}>
      {/* Label */}
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icon Left */}
        {iconLeft && (
          <div
            className={cn(
              "absolute left-3 top-1/2 flex -translate-y-1/2 items-center",
              !disabled ? "text-neutral-500" : "text-neutral-400",
            )}
          >
            {iconLeft}
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          type={type}
          disabled={disabled}
          className={cn(
            inputVariants({ variant }),
            iconLeft && "pl-11",
            iconRight && "pr-11",
            className,
          )}
          ref={ref}
          {...rest}
        />

        {/* Icon Right */}
        {iconRight && (
          <div
            className={cn(
              "absolute right-3 top-1/2 flex -translate-y-1/2 items-center",
              !disabled ? "text-neutral-500" : "text-neutral-400",
            )}
          >
            {iconRight}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
      <p className={cn("text-sm mt-1", isError ? "!text-red-600" : "text-gray-500")}>
        {helperText}
      </p>
)}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
