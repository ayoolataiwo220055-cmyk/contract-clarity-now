import { FileCheck, AlertCircle } from 'lucide-react';
import { ContractTypeResult, getContractTypeLabel, getContractTypeDescription } from '@/lib/clauseCategories';
import { cn } from '@/lib/utils';

interface ContractTypeCardProps {
  contractType: ContractTypeResult;
}

export default function ContractTypeCard({ contractType }: ContractTypeCardProps) {
  const confidenceColors = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <FileCheck className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {getContractTypeLabel(contractType.type)}
            </h3>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium",
              confidenceColors[contractType.confidence]
            )}>
              {contractType.confidence} confidence
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {getContractTypeDescription(contractType.type)}
          </p>
          {contractType.indicators.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Detected keywords:</span>
              {contractType.indicators.slice(0, 5).map((indicator, idx) => (
                <span key={idx} className="text-xs bg-background border border-border px-1.5 py-0.5 rounded">
                  {indicator}
                </span>
              ))}
            </div>
          )}
          {contractType.type === 'unknown' && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>Contract type could not be determined from the document.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
