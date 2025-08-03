import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import * as React from "react";

import { cn } from "@/lib/utils";

import { SpinnerIcon } from "../icon";

/**
 * Button component with configurable variants, sizes, and error states.
 * Supports primary, secondary, and link variants with additional error styling when `isError` is true.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-adamo-sign-600 hover:bg-adamo-sign-700 active:bg-adamo-sign-800 disabled:bg-neutral-400 text-white hover:text-adamo-sign-100 active:text-adamo-sign-200 disabled:text-adamo-sign-200",
        primaryError:
          "bg-error-500 hover:bg-error-600 active:bg-error-700 text-white",
        secondary:
          "bg-adamo-sign-100 hover:bg-adamo-sign-200 active:bg-adamo-sign-200 disabled:bg-neutral-50 text-adamo-sign-700 hover:text-adamo-sign-700 active:text-adamo-sign-900 disabled:text-neutral-300",
        secondaryError:
          "bg-error-50 hover:bg-error-100 active:bg-error-200 text-error-500",
        link: "bg-transparent text-adamo-sign-700 hover:text-adamo-sign-800 active:text-adamo-sign-900 disabled:text-neutral-300",
        linkError:
          "bg-transparent text-error-500 hover:text-error-600 active:text-error-700",
      },
      size: {
        large: "h-12 px-5 py-3 text-base",
        medium: "h-10 px-2.5 py-2 text-sm",
      },
    },
    compoundVariants: [{ variant: ["link", "linkError"], className: "px-0" }],
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render the button as a child component (useful for complex components like links).
   */
  asChild?: boolean;

  /**
   * Flag to apply error-specific styling.
   */
  isError?: boolean;

  /**
   * Flag to apply loading-specific styling.
   */
  isLoading?: boolean;
}

/**
 * Button component for consistent design across the application.
 * Supports variants, sizes, and error states.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "large",
      isError,
      asChild = false,
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    // Dynamically apply the error-specific variant when isError is true
    const appliedVariant = isError
      ? (`${variant}Error` as "primaryError" | "secondaryError" | "linkError")
      : variant;

    if (isLoading) {
      return (
        <Comp
          className={cn(
            buttonVariants({
              variant: appliedVariant,
              size,
              className,
            }),
          )}
          ref={ref}
          {...props}
        >
          <span className="inline-flex items-center gap-2">
            {isLoading && <SpinnerIcon />}
            {children}
          </span>
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: appliedVariant,
            size,
            className,
          }),
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
