import { useState, useRef } from 'react';
import { LayoutList, FileText, Eye, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ClauseGroupSection from './ClauseGroupSection';
import ExtractedTextPreview, { ExtractedTextPreviewHandle } from './ExtractedTextPreview';
import ContractTypeCard from './ContractTypeCard';
import { ProcessingResult, ClauseAnalysis, RiskArea } from '@/lib/fileProcessor';
import { groupClausesByCategory, detectContractType, clauseGroups } from '@/lib/clauseCategories';
import { cn } from '@/lib/utils';

interface SectionedOutputProps {
  result: ProcessingResult;
  onGenerateReport: () => void;
  getCategoryColor: (category: ClauseAnalysis['category']) => string;
  getCategoryLabel: (category: ClauseAnalysis['category']) => string;
  getSeverityColor: (severity: RiskArea['severity']) => string;
  getRiskScoreColor: (level: 'low' | 'moderate' | 'high' | 'critical') => string;
  getRiskScoreLabel: (level: 'low' | 'moderate' | 'high' | 'critical') => string;
}

export default function SectionedOutput({
  result,
  onGenerateReport,
  getCategoryColor,
  getCategoryLabel,
  getSeverityColor,
  getRiskScoreColor,
  getRiskScoreLabel,
}: SectionedOutputProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());
  const [highlightedSentence, setHighlightedSentence] = useState<string | null>(null);
  const extractedTextRef = useRef<ExtractedTextPreviewHandle>(null);
  
  const groupedClauses = groupClausesByCategory(result.clauses);
  const contractType = detectContractType(result.text);

  const toggleClause = (id: string) => {
    setExpandedClauses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAllClauses = () => {
    const allIds: string[] = [];
    groupedClauses.forEach((clauses, group) => {
      clauses.forEach((_, idx) => allIds.push(`${group.id}-${idx}`));
    });
    setExpandedClauses(new Set(allIds));
  };

  const collapseAllClauses = () => {
    setExpandedClauses(new Set());
  };

  const handleScrollToSentence = (sentence: string) => {
    setHighlightedSentence(sentence);
    extractedTextRef.current?.scrollToSentence(sentence);
  };

  const highlightKeywords = (sentence: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return sentence;
    
    const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = sentence.split(regex);
    
    return parts.map((part, i) => {
      const isKeyword = keywords.some(kw => part.toLowerCase() === kw.toLowerCase());
      if (isKeyword) {
        return <mark key={i} className="bg-accent/20 text-accent-foreground px-0.5 rounded font-medium not-italic">{part}</mark>;
      }
      return part;
    });
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="overview" className="gap-2">
          <Eye className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="clauses" className="gap-2">
          <LayoutList className="h-4 w-4" />
          Identified Clauses
        </TabsTrigger>
        <TabsTrigger value="text" className="gap-2">
          <FileText className="h-4 w-4" />
          Extracted Text
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6 animate-fade-in">
        {/* Contract Type Detection */}
        <ContractTypeCard contractType={contractType} />
        
        {/* Risk Score Summary */}
        <div className={cn("card-professional border-2", getRiskScoreColor(result.riskScore.level))}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold",
                getRiskScoreColor(result.riskScore.level)
              )}>
                {result.riskScore.score}
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">{getRiskScoreLabel(result.riskScore.level)}</h2>
                <p className="text-sm text-muted-foreground">Overall Risk Score</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700">0-19 Low</span>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">20-44 Moderate</span>
              <span className="px-2 py-1 rounded bg-rose-100 text-rose-700">45-69 High</span>
              <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">70+ Critical</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{result.riskScore.summary}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{result.fileType}</p>
            <p className="text-xs text-muted-foreground">File Type</p>
          </div>
          {result.pageCount && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">{result.pageCount}</p>
              <p className="text-xs text-muted-foreground">Pages</p>
            </div>
          )}
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{result.wordCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{result.clauses.length}</p>
            <p className="text-xs text-muted-foreground">Clauses Found</p>
          </div>
        </div>

        {/* Risk Areas */}
        {result.riskAreas.length > 0 && (
          <div className="card-professional">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-heading text-xl font-semibold text-foreground">Potential Risk Areas</h2>
            </div>
            <div className="space-y-3">
              {result.riskAreas.map((risk, index) => (
                <div
                  key={index}
                  className={cn("p-4 border rounded-md", getSeverityColor(risk.severity))}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide">{risk.severity} risk</span>
                  </div>
                  <h3 className="font-medium mb-1">{risk.title}</h3>
                  <p className="text-sm opacity-90 mb-2">{risk.description}</p>
                  <p className="text-sm font-medium">Recommendation: {risk.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Report */}
        <div className="card-professional border-accent/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-1">Download Analysis Report</h2>
              <p className="text-sm text-muted-foreground">Save a complete PDF report of this analysis.</p>
            </div>
            <Button variant="hero" size="lg" onClick={onGenerateReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* Identified Clauses Tab */}
      <TabsContent value="clauses" className="space-y-4 animate-fade-in">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Click on a sentence to scroll to it in the Extracted Text tab
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={expandAllClauses} className="text-xs">Expand All</Button>
            <Button variant="ghost" size="sm" onClick={collapseAllClauses} className="text-xs">Collapse All</Button>
          </div>
        </div>

        {/* Grouped Clauses */}
        <div className="space-y-4">
          {Array.from(groupedClauses.entries()).map(([group, clauses]) => (
            <ClauseGroupSection
              key={group.id}
              group={group}
              clauses={clauses}
              expandedClauses={expandedClauses}
              onToggleClause={toggleClause}
              onScrollToSentence={handleScrollToSentence}
              getCategoryColor={getCategoryColor}
              getCategoryLabel={getCategoryLabel}
              highlightKeywords={highlightKeywords}
            />
          ))}
        </div>
      </TabsContent>

      {/* Extracted Text Tab */}
      <TabsContent value="text" className="animate-fade-in">
        <ExtractedTextPreview
          ref={extractedTextRef}
          text={result.text}
          highlightedSentence={highlightedSentence}
        />
      </TabsContent>
    </Tabs>
  );
}
