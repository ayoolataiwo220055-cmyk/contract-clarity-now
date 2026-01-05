import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  matchCount: number;
  className?: string;
}

export const ConfidenceIndicator = ({ matchCount, className }: ConfidenceIndicatorProps) => {
  const getConfidence = () => {
    if (matchCount >= 3) {
      return { label: "Strong Match", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    } else if (matchCount >= 2) {
      return { label: "Moderate Match", color: "bg-amber-100 text-amber-700 border-amber-200" };
    } else {
      return { label: "Weak Match", color: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  const confidence = getConfidence();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border",
        confidence.color,
        className
      )}
    >
      {confidence.label}
    </span>
  );
};

export default ConfidenceIndicator;
