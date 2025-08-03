import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const alertVariants = cva("rounded-2xl p-4", {
  variants: {
    variant: {
      sign: "bg-adamo-sign-100 text-adamo-sign-800",
      success: "bg-success-50 text-success-600",
      danger: "bg-error-50 text-error-500",
    },
  },
});

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export const Alert = ({ variant = "sign", className, ...rest }: AlertProps) => {
  return (
    <div className={cn(alertVariants({ variant, className }))} {...rest} />
  );
};
