import { useState } from "react";
import { X, Wrench } from "lucide-react";

export default function MaintenanceBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative w-full bg-amber-500 text-amber-950 dark:bg-amber-600 dark:text-amber-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-sm font-medium text-center">
        <Wrench className="h-4 w-4 shrink-0" />
        <span>
          We're going down for ~15 minutes for an upgrade to make FitTrack faster. Thanks for your patience!
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover-elevate"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
