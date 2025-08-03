import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva("badge", {
  variants: {
    variant: {
      success: "badge-success",
      process: "badge-process",
      error: "badge-error",
      neutral: "badge-neutral",
    },
    type: {
      filled: "badge-filled",
      text: "badge-text",
      negative: "badge-negative",
    },
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  iconLess?: boolean;
}

export const Badge = (props: BadgeProps) => {
  const { variant = "neutral", type = "filled", className, ...rest } = props;

  return (
    <div
      className={cn(badgeVariants({ variant, type }), className)}
      {...rest}
    />
  );
};
