import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({
  title = "System Verification Notice",
  message,
  onRetry,
  className = "",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={`rounded-sm border border-terracotta/30 bg-terracotta/5 p-4 text-terracotta-dark shadow-xs flex items-start gap-3.5 ${className}`}
    >
      <AlertCircle className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-bold text-terracotta-dark tracking-wide">
          {title}
        </h4>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 text-xs border-terracotta/30 text-terracotta-dark hover:bg-terracotta/10"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
