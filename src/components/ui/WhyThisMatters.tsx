import { Info } from 'lucide-react';

interface WhyThisMattersProps {
  matters: string;
  impact: string;
}

export default function WhyThisMatters({ matters, impact }: WhyThisMattersProps) {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Why This Clause Matters</p>
          <p className="text-sm text-foreground/90">{matters}</p>
          <p className="text-xs text-muted-foreground"><strong>Impact:</strong> {impact}</p>
        </div>
      </div>
    </div>
  );
}
