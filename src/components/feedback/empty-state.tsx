import * as React from "react";
import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-md border border-forest/10 bg-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-sand/20 border border-sand/30 text-forest mb-4">
        {icon || <FolderSearch className="h-7 w-7 text-forest" />}
      </div>
      <h3 className="text-lg font-bold text-forest-700 tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-sm text-charcoal-muted max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="default" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
