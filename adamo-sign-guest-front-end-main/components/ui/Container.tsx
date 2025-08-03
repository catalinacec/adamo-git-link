import { Slot } from "@radix-ui/react-slot";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        className={cn("mx-auto w-full px-4 md:px-8 xl:px-[104px]", className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Container.displayName = "Container";
