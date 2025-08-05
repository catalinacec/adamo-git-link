import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

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
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        large: "h-12 px-5 py-3 text-base",
        medium: "h-10 px-2.5 py-2 text-sm",
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [{ variant: ["link", "linkError"], className: "px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
