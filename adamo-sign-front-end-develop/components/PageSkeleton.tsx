import { Container } from "./ui/Container";
import { Skeleton } from "./ui/Skeleton";

export const PageSkeleton = () => {
  return (
    <Container className="py-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-12" />
        <Skeleton className="h-24" />
        <Skeleton className="min-h-[320px]" />
      </div>
    </Container>
  );
};
