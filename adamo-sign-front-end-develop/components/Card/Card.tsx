import { cn } from "@/lib/utils";

export const Card = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200 bg-white p-4 py-8 xs:px-6 md:p-8",
        className,
      )}
      {...rest}
    />
  );
};
