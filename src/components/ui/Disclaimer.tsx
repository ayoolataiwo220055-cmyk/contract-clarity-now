import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
}

export const Disclaimer = ({ className }: DisclaimerProps) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md",
        className
      )}
    >
      <Scale className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-amber-800 mb-1">Legal Disclaimer</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          This tool does not provide legal advice. The analysis is automated and for informational purposes only. 
          For legal matters, consult a qualified attorney.
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
