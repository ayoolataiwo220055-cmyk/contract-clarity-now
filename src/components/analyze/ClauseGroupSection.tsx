import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Briefcase, UserCheck, Building, Scale, MousePointerClick } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import ClauseTooltip from '@/components/ui/ClauseTooltip';
import ConfidenceIndicator from '@/components/ui/ConfidenceIndicator';
import LegalTermHighlighter from '@/components/LegalTermHighlighter';
import WhyThisMatters from '@/components/ui/WhyThisMatters';
import { ClauseGroup, clauseImportance } from '@/lib/clauseCategories';
import { ClauseAnalysis } from '@/lib/fileProcessor';
import { cn } from '@/lib/utils';

interface ClauseGroupSectionProps {
  group: ClauseGroup;
  clauses: ClauseAnalysis[];
  expandedClauses: Set<string>;
  onToggleClause: (id: string) => void;
  onScrollToSentence?: (sentence: string) => void;
  getCategoryColor: (category: ClauseAnalysis['category']) => string;
  getCategoryLabel: (category: ClauseAnalysis['category']) => string;
  highlightKeywords: (sentence: string, keywords: string[]) => React.ReactNode;
}

const iconMap = {
  Briefcase,
  UserCheck,
  Building,
  Scale,
};

export default function ClauseGroupSection({
  group,
  clauses,
  expandedClauses,
  onToggleClause,
  onScrollToSentence,
  getCategoryColor,
  getCategoryLabel,
  highlightKeywords,
}: ClauseGroupSectionProps) {
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);
  const IconComponent = iconMap[group.icon as keyof typeof iconMap] || Briefcase;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Group Header */}
      <Collapsible open={isGroupExpanded} onOpenChange={setIsGroupExpanded}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-3">
              <IconComponent className="h-5 w-5 text-accent" />
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{group.title}</h3>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">{clauses.length} clause(s)</span>
              {isGroupExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 space-y-3">
            {clauses.map((clause, index) => {
              const clauseId = `${group.id}-${index}`;
              const isExpanded = expandedClauses.has(clauseId);
              const importance = clauseImportance[clause.category];
              
              return (
                <Collapsible
                  key={clauseId}
                  open={isExpanded}
                  onOpenChange={() => onToggleClause(clauseId)}
                  className="border border-border/50 rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full px-3 py-2 bg-background hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getCategoryColor(clause.category))}>
                          {getCategoryLabel(clause.category)}
                        </span>
                        <ClauseTooltip category={clause.category} />
                        <h4 className="font-medium text-sm text-foreground">{clause.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ConfidenceIndicator matchCount={clause.sentences?.length || 0} />
                        <span className="text-xs">{(clause.sentences || []).length}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="animate-accordion-down">
                    <div className="px-3 py-3 bg-muted/10">
                      {/* Why This Clause Matters */}
                      <WhyThisMatters
                        matters={importance.matters}
                        impact={importance.impact}
                      />
                      
                      {/* Matched Sentences */}
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-3">
                        Matched Sentences:
                      </p>
                      <div className="space-y-2">
                        {(clause.sentences || []).map((sentence, sIndex) => (
                          <div key={sIndex} className="group relative">
                            <blockquote
                              className="pl-3 border-l-2 border-accent/40 text-sm text-foreground/90 leading-relaxed italic bg-accent/5 py-2 pr-8 rounded-r cursor-pointer hover:bg-accent/10 transition-colors"
                              onClick={() => onScrollToSentence?.(sentence)}
                              title="Click to scroll to this sentence in the extracted text"
                            >
                              "
                              <LegalTermHighlighter text={sentence} className="contents" />
                              "
                            </blockquote>
                            {onScrollToSentence && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onScrollToSentence(sentence)}
                                title="Scroll to sentence in extracted text"
                              >
                                <MousePointerClick className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
