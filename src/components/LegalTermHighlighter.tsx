import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTermDefinition, getAllTerms, LegalTerm } from '@/lib/legalGlossary';
import { cn } from '@/lib/utils';

interface LegalTermHighlighterProps {
  text: string;
  className?: string;
}

export const LegalTermHighlighter = ({ text, className }: LegalTermHighlighterProps) => {
  const terms = getAllTerms();
  
  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = terms.sort((a, b) => b.length - a.length);

  // Create regex pattern that matches whole words only
  const termPattern = sortedTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  const regex = new RegExp(`\\b(${termPattern})\\b`, 'gi');

  const parts: (string | { term: string; definition: LegalTerm })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the term
    const termText = match[0];
    const definition = getTermDefinition(termText);
    if (definition) {
      parts.push({ term: termText, definition });
    } else {
      parts.push(termText);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <TooltipProvider>
      <span className={className}>
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={index}>{part}</span>;
          }
          return (
            <TermTooltip key={index} term={part.definition} originalText={part.term} />
          );
        })}
      </span>
    </TooltipProvider>
  );
};

interface TermTooltipProps {
  term: LegalTerm;
  originalText: string;
}

const TermTooltip = ({ term, originalText }: TermTooltipProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employment':
        return 'bg-blue-100 text-blue-900';
      case 'contract':
        return 'bg-purple-100 text-purple-900';
      case 'rights':
        return 'bg-red-100 text-red-900';
      case 'termination':
        return 'bg-orange-100 text-orange-900';
      case 'compensation':
        return 'bg-green-100 text-green-900';
      case 'compliance':
        return 'bg-indigo-100 text-indigo-900';
      case 'dispute':
        return 'bg-yellow-100 text-yellow-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(
          'cursor-help underline decoration-dashed decoration-2 transition-colors hover:opacity-80',
          getCategoryColor(term.category)
        )}>
          {originalText}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">{term.term}</p>
            <span className="text-xs px-2 py-1 bg-muted rounded capitalize">
              {term.category}
            </span>
          </div>
          <p className="text-sm text-foreground/90">{term.definition}</p>
          {term.example && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Example:</p>
              <p className="text-xs italic text-foreground/80">"{term.example}"</p>
            </div>
          )}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Related Terms:</p>
              <div className="flex flex-wrap gap-1">
                {term.relatedTerms.map((relatedTerm) => (
                  <span key={relatedTerm} className="text-xs px-2 py-0.5 bg-muted rounded">
                    {relatedTerm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default LegalTermHighlighter;
