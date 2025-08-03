import { cn } from "@/lib/utils";

export const CardGroup = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 md:flex-row",
        className,
      )}
      {...rest}
    />
  );
};
