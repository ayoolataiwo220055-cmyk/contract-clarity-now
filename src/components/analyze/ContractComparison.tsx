import { useState, useCallback } from "react";
import { Upload, FileText, X, GitCompare, ChevronDown, ChevronUp, Plus, Minus, Equal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { validateFile, processFile, ProcessingResult, ClauseAnalysis } from "@/lib/fileProcessor";
import { cn } from "@/lib/utils";
import ClauseTooltip from "@/components/ui/ClauseTooltip";
import ConfidenceIndicator from "@/components/ui/ConfidenceIndicator";
import Disclaimer from "@/components/ui/Disclaimer";

interface ComparisonContract {
  file: File | null;
  result: ProcessingResult | null;
  isProcessing: boolean;
  error: string | null;
}

const getCategoryLabel = (category: ClauseAnalysis['category']) => {
  const labels: Record<ClauseAnalysis['category'], string> = {
    compensation: 'Compensation',
    termination: 'Termination',
    confidentiality: 'Confidentiality',
    'non-compete': 'Non-Compete',
    benefits: 'Benefits',
    'non-solicitation': 'Non-Solicitation',
    relocation: 'Relocation',
    'dispute-resolution': 'Dispute Resolution',
    'intellectual-property': 'Intellectual Property',
    probation: 'Probation',
    overtime: 'Overtime',
    other: 'Other'
  };
  return labels[category] || 'Other';
};

const getCategoryColor = (category: ClauseAnalysis['category']) => {
  const colors: Record<ClauseAnalysis['category'], string> = {
    compensation: 'bg-emerald-100 text-emerald-700',
    termination: 'bg-rose-100 text-rose-700',
    confidentiality: 'bg-blue-100 text-blue-700',
    'non-compete': 'bg-purple-100 text-purple-700',
    benefits: 'bg-cyan-100 text-cyan-700',
    'non-solicitation': 'bg-orange-100 text-orange-700',
    relocation: 'bg-amber-100 text-amber-700',
    'dispute-resolution': 'bg-slate-100 text-slate-700',
    'intellectual-property': 'bg-indigo-100 text-indigo-700',
    probation: 'bg-teal-100 text-teal-700',
    overtime: 'bg-lime-100 text-lime-700',
    other: 'bg-muted text-muted-foreground'
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export const ContractComparison = () => {
  const [contracts, setContracts] = useState<ComparisonContract[]>([
    { file: null, result: null, isProcessing: false, error: null },
    { file: null, result: null, isProcessing: false, error: null }
  ]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleFileSelect = useCallback((index: number, selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setContracts(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], error: validation.error || 'Invalid file' };
        return updated;
      });
      return;
    }
    setContracts(prev => {
      const updated = [...prev];
      updated[index] = { file: selectedFile, result: null, isProcessing: false, error: null };
      return updated;
    });
  }, []);

  const handleAnalyze = async (index: number) => {
    const contract = contracts[index];
    if (!contract.file) return;

    setContracts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isProcessing: true, error: null };
      return updated;
    });

    try {
      const result = await processFile(contract.file);
      setContracts(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], result, isProcessing: false };
        return updated;
      });
    } catch {
      setContracts(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], error: 'Processing failed', isProcessing: false };
        return updated;
      });
    }
  };

  const handleRemove = (index: number) => {
    setContracts(prev => {
      const updated = [...prev];
      updated[index] = { file: null, result: null, isProcessing: false, error: null };
      return updated;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const bothAnalyzed = contracts[0].result && contracts[1].result;

  // Get all unique categories from both contracts
  const allCategories = bothAnalyzed ? Array.from(new Set([
    ...contracts[0].result!.clauses.map(c => c.category),
    ...contracts[1].result!.clauses.map(c => c.category)
  ])) : [];

  const getClauseDifference = (category: ClauseAnalysis['category']) => {
    const clause1 = contracts[0].result?.clauses.find(c => c.category === category);
    const clause2 = contracts[1].result?.clauses.find(c => c.category === category);

    if (clause1 && clause2) {
      return { type: 'both', clause1, clause2 };
    } else if (clause1) {
      return { type: 'only-first', clause1, clause2: null };
    } else if (clause2) {
      return { type: 'only-second', clause1: null, clause2 };
    }
    return { type: 'none', clause1: null, clause2: null };
  };

  return (
    <div className="space-y-8">
      {/* Upload Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts.map((contract, index) => (
          <div key={index} className="card-professional">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
              Contract {index + 1}
            </h3>
            
            {!contract.file ? (
              <div className="relative border-2 border-dashed rounded-md p-6 text-center transition-all duration-200 hover:border-accent/50 hover:bg-accent/5">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(index, file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label={`Upload contract ${index + 1}`}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Drop file here or click to upload
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-accent" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{contract.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(contract.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {contract.error && (
                  <p className="text-sm text-destructive">{contract.error}</p>
                )}

                {!contract.result && (
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleAnalyze(index)}
                    disabled={contract.isProcessing}
                    className="w-full"
                  >
                    {contract.isProcessing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                )}

                {contract.result && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    <p className="text-sm text-emerald-700 font-medium">
                      ✓ Analyzed: {contract.result.clauses.length} clauses found
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Risk Score: {contract.result.riskScore.score}/100
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Results */}
      {bothAnalyzed && (
        <div className="space-y-6 animate-fade-in-up">
          <Disclaimer />

          <div className="card-professional">
            <div className="flex items-center gap-3 mb-6">
              <GitCompare className="h-5 w-5 text-accent" />
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Comparison Results
              </h2>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted/50 rounded-md text-center">
                <p className="text-lg font-semibold text-foreground">{contracts[0].result!.clauses.length}</p>
                <p className="text-xs text-muted-foreground">Contract 1 Clauses</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-md text-center">
                <p className="text-lg font-semibold text-foreground">{contracts[1].result!.clauses.length}</p>
                <p className="text-xs text-muted-foreground">Contract 2 Clauses</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-md text-center">
                <p className="text-lg font-semibold text-accent">{allCategories.length}</p>
                <p className="text-xs text-muted-foreground">Total Unique Categories</p>
              </div>
            </div>

            {/* Clause Comparison */}
            <div className="space-y-3">
              {allCategories.map((category) => {
                const diff = getClauseDifference(category);
                const DiffIcon = diff.type === 'both' ? Equal : diff.type === 'only-first' ? Minus : Plus;
                const diffColor = diff.type === 'both' 
                  ? 'bg-blue-50 border-blue-200' 
                  : diff.type === 'only-first' 
                    ? 'bg-rose-50 border-rose-200' 
                    : 'bg-emerald-50 border-emerald-200';

                return (
                  <Collapsible
                    key={category}
                    open={expandedCategories.has(category)}
                    onOpenChange={() => toggleCategory(category)}
                    className={cn("border rounded-md overflow-hidden", diffColor)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <DiffIcon className={cn(
                            "h-4 w-4",
                            diff.type === 'both' ? 'text-blue-600' : diff.type === 'only-first' ? 'text-rose-600' : 'text-emerald-600'
                          )} />
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getCategoryColor(category))}>
                            {getCategoryLabel(category)}
                          </span>
                          <ClauseTooltip category={category} />
                          <span className="text-xs text-muted-foreground">
                            {diff.type === 'both' && 'In both contracts'}
                            {diff.type === 'only-first' && 'Only in Contract 1'}
                            {diff.type === 'only-second' && 'Only in Contract 2'}
                          </span>
                        </div>
                        {expandedCategories.has(category) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="animate-accordion-down">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border-t">
                        {/* Contract 1 */}
                        <div className={cn("p-3 rounded-md", diff.clause1 ? "bg-card border" : "bg-muted/30")}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Contract 1</p>
                            {diff.clause1 && <ConfidenceIndicator matchCount={diff.clause1.sentences.length} />}
                          </div>
                          {diff.clause1 ? (
                            <div className="space-y-2">
                              {diff.clause1.sentences.map((s, i) => (
                                <p key={i} className="text-sm text-foreground leading-relaxed italic">
                                  "{s}"
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Not found</p>
                          )}
                        </div>

                        {/* Contract 2 */}
                        <div className={cn("p-3 rounded-md", diff.clause2 ? "bg-card border" : "bg-muted/30")}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Contract 2</p>
                            {diff.clause2 && <ConfidenceIndicator matchCount={diff.clause2.sentences.length} />}
                          </div>
                          {diff.clause2 ? (
                            <div className="space-y-2">
                              {diff.clause2.sentences.map((s, i) => (
                                <p key={i} className="text-sm text-foreground leading-relaxed italic">
                                  "{s}"
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Not found</p>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>

          {/* Risk Comparison */}
          <div className="card-professional">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Risk Score Comparison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contracts.map((contract, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "p-4 rounded-md border-2",
                    contract.result!.riskScore.level === 'critical' && "bg-destructive/10 border-destructive",
                    contract.result!.riskScore.level === 'high' && "bg-rose-50 border-rose-300",
                    contract.result!.riskScore.level === 'moderate' && "bg-amber-50 border-amber-300",
                    contract.result!.riskScore.level === 'low' && "bg-emerald-50 border-emerald-300"
                  )}
                >
                  <p className="text-xs text-muted-foreground mb-1">Contract {index + 1}</p>
                  <p className="text-2xl font-bold text-foreground">{contract.result!.riskScore.score}/100</p>
                  <p className="text-sm font-medium capitalize">{contract.result!.riskScore.level} Risk</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractComparison;
