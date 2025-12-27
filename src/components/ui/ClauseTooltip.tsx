import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClauseAnalysis } from "@/lib/fileProcessor";

const CLAUSE_EXPLANATIONS: Record<ClauseAnalysis['category'], { title: string; explanation: string }> = {
  compensation: {
    title: "Compensation Clause",
    explanation: "Defines your salary, wages, bonuses, and other forms of payment. Review for clear payment terms, frequency, and any conditions."
  },
  termination: {
    title: "Termination Clause",
    explanation: "Outlines how the employment relationship can be ended, including notice periods, grounds for dismissal, and severance terms."
  },
  confidentiality: {
    title: "Confidentiality Clause",
    explanation: "Restricts disclosure of company information. Check what information is considered confidential and the duration of this obligation."
  },
  "non-compete": {
    title: "Non-Compete Clause",
    explanation: "Limits your ability to work for competitors after leaving. Pay attention to duration, geographic scope, and industry restrictions."
  },
  benefits: {
    title: "Benefits Clause",
    explanation: "Covers insurance, vacation, retirement plans, and other perks. Verify when benefits begin and any eligibility requirements."
  },
  "non-solicitation": {
    title: "Non-Solicitation Clause",
    explanation: "Prevents you from recruiting employees or clients after leaving. Review the scope and time period of these restrictions."
  },
  relocation: {
    title: "Relocation Clause",
    explanation: "Addresses potential job transfers or work location changes. Check if relocation is mandatory and what assistance is provided."
  },
  "dispute-resolution": {
    title: "Dispute Resolution Clause",
    explanation: "Specifies how conflicts will be resolved—through arbitration, mediation, or courts. Understand your rights and the process."
  },
  "intellectual-property": {
    title: "Intellectual Property Clause",
    explanation: "Determines ownership of work created during employment. Review if personal projects are affected and assignment scope."
  },
  probation: {
    title: "Probation Period Clause",
    explanation: "Defines a trial period with potentially different terms. Check benefits during probation and termination conditions."
  },
  overtime: {
    title: "Overtime Clause",
    explanation: "Covers extra work hours and compensation. Verify if you're exempt from overtime pay and expected work hours."
  },
  other: {
    title: "General Clause",
    explanation: "Contains terms that don't fit standard categories. Review carefully for any unique conditions or obligations."
  }
};

interface ClauseTooltipProps {
  category: ClauseAnalysis['category'];
}

export const ClauseTooltip = ({ category }: ClauseTooltipProps) => {
  const info = CLAUSE_EXPLANATIONS[category];
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Learn about ${info.title}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <p className="font-medium text-sm mb-1">{info.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{info.explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClauseTooltip;
