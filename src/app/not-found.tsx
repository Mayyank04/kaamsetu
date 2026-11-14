import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-md border border-forest/15 bg-card p-8 shadow-sovereign-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-sand/20 border border-sand/40 text-forest mb-5">
          <FileQuestion className="h-7 w-7 text-forest" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-sand-800">
            Error 404 • Not Located
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-forest">
            Registry Document Not Found
          </h1>
          <p className="text-sm text-charcoal-muted max-w-sm mx-auto leading-relaxed">
            The credential, registry profile, or pathway you requested does not exist or has been relocated to another sovereign block.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="default" asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Platform Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Explore Verified Crafts
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
