import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-2 border-forest/15 border-t-forest animate-spin" />
        <div className="absolute flex h-8 w-8 items-center justify-center rounded-xs bg-forest text-sand font-bold text-xs">
          <Shield className="h-4 w-4 text-sand animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-forest">
          Synchronizing Sovereign Registry
        </p>
        <p className="text-[11px] text-charcoal-muted">
          Loading verified workforce credentials...
        </p>
      </div>
    </div>
  );
}
