import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Award, CheckCircle2, Mic, Building2 } from "lucide-react";

interface TrustBadgeProps {
  type: "digilocker" | "aadhaar" | "peer_verified" | "voice_verified" | "master" | "level_3";
  className?: string;
}

export function TrustBadge({ type, className }: TrustBadgeProps) {
  switch (type) {
    case "digilocker":
      return (
        <Badge variant="verified" className={className}>
          <Building2 className="h-3 w-3 text-forest" />
          <span>DigiLocker Linked</span>
        </Badge>
      );
    case "aadhaar":
      return (
        <Badge variant="verified" className={className}>
          <CheckCircle2 className="h-3 w-3 text-forest" />
          <span>Aadhaar Verified</span>
        </Badge>
      );
    case "peer_verified":
      return (
        <Badge variant="sand" className={className}>
          <Award className="h-3 w-3 text-sand-800" />
          <span>Peer Endorsed</span>
        </Badge>
      );
    case "voice_verified":
      return (
        <Badge variant="outline" className={className}>
          <Mic className="h-3 w-3 text-forest" />
          <span>Voice Attestation</span>
        </Badge>
      );
    case "master":
      return (
        <Badge variant="sovereign" className={className}>
          <ShieldCheck className="h-3 w-3 text-sand" />
          <span>Sovereign Master</span>
        </Badge>
      );
    case "level_3":
      return (
        <Badge variant="verified" className={className}>
          <ShieldCheck className="h-3 w-3 text-forest" />
          <span>Verified Level 3</span>
        </Badge>
      );
    default:
      return null;
  }
}
