import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xs bg-forest-900/10 dark:bg-sand-100/10",
        className
      )}
      {...props}
    />
  );
}
