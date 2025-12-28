import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, X, Shield, Download, ChevronDown, ChevronUp, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedPage from "@/components/layout/AnimatedPage";
import AnalysisSkeleton from "@/components/ui/AnalysisSkeleton";
import ClauseTooltip from "@/components/ui/ClauseTooltip";
import ConfidenceIndicator from "@/components/ui/ConfidenceIndicator";
import Disclaimer from "@/components/ui/Disclaimer";
import ContractComparison from "@/components/analyze/ContractComparison";
import KeyDatesCalendar from "@/components/KeyDatesCalendar";
import LegalTermHighlighter from "@/components/LegalTermHighlighter";
import { validateFile, processFile, ProcessingResult, ClauseAnalysis, RiskArea, RiskScore } from "@/lib/fileProcessor";
import { extractDatesFromText, ContractDate, saveDates } from "@/lib/dateExtractor";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

const Analyze = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("single");
  const [contractDates, setContractDates] = useState<ContractDate[]>([]);

  // Clear data on page reload (automatic data reset)
  useEffect(() => {
    const handleBeforeUnload = () => {
      setFile(null);
      setResult(null);
      setError(null);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const toggleClause = (index: number) => {
    setExpandedClauses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAllClauses = () => {
    if (result) {
      setExpandedClauses(new Set(result.clauses.map((_, i) => i)));
    }
  };

  const collapseAllClauses = () => {
    setExpandedClauses(new Set());
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

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const processingResult = await processFile(file);
      
      if (!processingResult.success) {
        setError('Failed to process the document. The file may be corrupted or in an unsupported format.');
      } else {
        setResult(processingResult);
        // Extract dates from the contract text
        const extractedDates = extractDatesFromText(processingResult.text);
        setContractDates(extractedDates);
        // Save dates to localStorage
        saveDates(extractedDates);
      }
    } catch {
      setError('An unexpected error occurred. Please try again with a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: RiskArea['severity']) => {
    switch (severity) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getCategoryColor = (category: ClauseAnalysis['category']) => {
    switch (category) {
      case 'compensation': return 'bg-emerald-100 text-emerald-700';
      case 'termination': return 'bg-rose-100 text-rose-700';
      case 'confidentiality': return 'bg-blue-100 text-blue-700';
      case 'non-compete': return 'bg-purple-100 text-purple-700';
      case 'benefits': return 'bg-cyan-100 text-cyan-700';
      case 'non-solicitation': return 'bg-orange-100 text-orange-700';
      case 'relocation': return 'bg-amber-100 text-amber-700';
      case 'dispute-resolution': return 'bg-slate-100 text-slate-700';
      case 'intellectual-property': return 'bg-indigo-100 text-indigo-700';
      case 'probation': return 'bg-teal-100 text-teal-700';
      case 'overtime': return 'bg-lime-100 text-lime-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryLabel = (category: ClauseAnalysis['category']) => {
    switch (category) {
      case 'compensation': return 'Compensation';
      case 'termination': return 'Termination';
      case 'confidentiality': return 'Confidentiality';
      case 'non-compete': return 'Non-Compete';
      case 'benefits': return 'Benefits';
      case 'non-solicitation': return 'Non-Solicitation';
      case 'relocation': return 'Relocation';
      case 'dispute-resolution': return 'Dispute Resolution';
      case 'intellectual-property': return 'Intellectual Property';
      case 'probation': return 'Probation';
      case 'overtime': return 'Overtime';
      default: return 'Other';
    }
  };

  const getRiskScoreColor = (level: RiskScore['level']) => {
    switch (level) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive';
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-300';
      case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-300';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    }
  };

  const getRiskScoreLabel = (level: RiskScore['level']) => {
    switch (level) {
      case 'critical': return 'Critical Risk';
      case 'high': return 'High Risk';
      case 'moderate': return 'Moderate Risk';
      case 'low': return 'Low Risk';
    }
  };

  const generateReport = useCallback(() => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, contentWidth);
      
      if (y + lines.length * (fontSize * 0.4) > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(lines, margin, y);
      y += lines.length * (fontSize * 0.4) + 4;
    };

    const addSection = (title: string) => {
      y += 6;
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 42, 68);
      doc.text(title, margin, y);
      y += 8;
      doc.setDrawColor(45, 122, 123);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);
    };

    // Header
    doc.setFillColor(15, 42, 68);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOY KNOW', margin, 18);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Contract Analysis Report', margin, 28);
    y = 45;
    doc.setTextColor(0, 0, 0);

    addText(`Generated: ${new Date().toLocaleString()}`, 10);
    addText(`File: ${result.fileName}`, 10);
    addText(`File Type: ${result.fileType}`, 10);
    if (result.pageCount) addText(`Pages: ${result.pageCount}`, 10);
    addText(`Words: ${result.wordCount.toLocaleString()}`, 10);

    addSection('RISK ASSESSMENT');
    const riskLevel = getRiskScoreLabel(result.riskScore.level);
    addText(`Overall Risk Score: ${result.riskScore.score}/100 (${riskLevel})`, 12, true);
    addText(result.riskScore.summary, 10);

    if (result.riskAreas.length > 0) {
      addSection('IDENTIFIED RISK AREAS');
      result.riskAreas.forEach((risk, i) => {
        addText(`${i + 1}. [${risk.severity.toUpperCase()}] ${risk.title}`, 11, true);
        addText(`Description: ${risk.description}`, 10);
        addText(`Recommendation: ${risk.recommendation}`, 10);
        y += 2;
      });
    }

    addSection('IDENTIFIED CLAUSES');
    result.clauses.forEach((clause, i) => {
      const confidenceLabel = clause.confidence ? ` [${clause.confidence.charAt(0).toUpperCase() + clause.confidence.slice(1)} Match]` : '';
      addText(`${i + 1}. ${clause.title} [${getCategoryLabel(clause.category)}]${confidenceLabel}`, 11, true);
      addText('Applicable Sentences:', 10, true);
      (clause.sentences || []).forEach(sentence => {
        addText(`• "${sentence}"`, 9);
      });
      y += 3;
    });

    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('This report was generated by Employ Know.', margin, y);
    y += 5;
    doc.text('DISCLAIMER: This tool does not provide legal advice. For legal matters, consult a qualified attorney.', margin, y);

    doc.save(`contract-analysis-${result.fileName.replace(/\.[^/.]+$/, '')}-${Date.now()}.pdf`);
  }, [result]);

  return (
    <PageLayout>
      <AnimatedPage>
        <section className="py-12 lg:py-16">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                Analyze Your Contract
              </h1>
              <p className="text-muted-foreground">
                Upload your employee contract document to receive structured analysis.
              </p>
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-auto max-w-4xl mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Single Analysis
                </TabsTrigger>
                <TabsTrigger value="compare" className="gap-2">
                  <GitCompare className="h-4 w-4" />
                  Compare Contracts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-6">
                {/* Upload Section */}
                <div className="mx-auto max-w-2xl mb-12">
                  <div className="card-professional">
                    {!file ? (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                          "relative border-2 border-dashed rounded-md p-8 text-center transition-all duration-200 upload-hover",
                          isDragOver 
                            ? "border-accent bg-accent/5 scale-[1.01]" 
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        )}
                      >
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Upload contract file"
                        />
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4 transition-transform duration-200" aria-hidden="true" />
                        <p className="text-foreground font-medium mb-1">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, DOCX, and TXT files up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md animate-scale-in">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-accent" aria-hidden="true" />
                          <div>
                            <p className="font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClear} aria-label="Remove file">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm animate-fade-in">
                        {error}
                      </div>
                    )}

                    {file && !result && (
                      <div className="mt-6 flex flex-col items-center gap-4 animate-fade-in-up">
                        <Button variant="hero" size="lg" onClick={handleAnalyze} disabled={isProcessing}>
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              <span className="processing-pulse">Processing...</span>
                            </>
                          ) : (
                            <>Upload & Analyze</>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      <span>Files are processed temporarily and deleted immediately.</span>
                    </div>
                  </div>
                </div>

                {isProcessing && <AnalysisSkeleton />}

                {result && result.success && (
                  <div className="mx-auto max-w-4xl space-y-8">
                    {/* Disclaimer */}
                    <Disclaimer />

                    {/* Risk Score Summary */}
                    <div className={cn("card-professional border-2 opacity-0 animate-scale-in", getRiskScoreColor(result.riskScore.level))}>
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

                    {/* Summary Card */}
                    <div className="card-professional opacity-0 animate-fade-in-up stagger-1">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                        <h2 className="font-heading text-xl font-semibold text-foreground">Analysis Complete</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-2xl font-semibold text-foreground">{result.fileType}</p>
                          <p className="text-xs text-muted-foreground">File Type</p>
                        </div>
                        {result.pageCount && (
                          <div className="p-3 bg-muted/50 rounded-md">
                            <p className="text-2xl font-semibold text-foreground">{result.pageCount}</p>
                            <p className="text-xs text-muted-foreground">Pages</p>
                          </div>
                        )}
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-2xl font-semibold text-foreground">{result.wordCount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Words</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-2xl font-semibold text-foreground">{result.clauses.length}</p>
                          <p className="text-xs text-muted-foreground">Clauses Found</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Dates Calendar */}
                    {contractDates.length > 0 && (
                      <div className="card-professional opacity-0 animate-fade-in-up stagger-1">
                        <KeyDatesCalendar 
                          dates={contractDates}
                          onDatesChange={(updatedDates) => setContractDates(updatedDates)}
                        />
                      </div>
                    )}

                    {/* Risk Areas */}
                    {result.riskAreas.length > 0 && (
                      <div className="card-professional opacity-0 animate-fade-in-up stagger-2">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                          <h2 className="font-heading text-xl font-semibold text-foreground">Potential Risk Areas</h2>
                        </div>
                        <div className="space-y-4">
                          {result.riskAreas.map((risk, index) => (
                            <div
                              key={index}
                              className={cn("p-4 border rounded-md opacity-0 animate-slide-in-right", getSeverityColor(risk.severity))}
                              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
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

                    {/* Identified Clauses */}
                    <div className="card-professional opacity-0 animate-fade-in-up stagger-3">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-xl font-semibold text-foreground">Identified Clauses</h2>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={expandAllClauses} className="text-xs">Expand All</Button>
                          <Button variant="ghost" size="sm" onClick={collapseAllClauses} className="text-xs">Collapse All</Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {result.clauses.map((clause, index) => (
                          <Collapsible
                            key={index}
                            open={expandedClauses.has(index)}
                            onOpenChange={() => toggleClause(index)}
                            className="border border-border rounded-md overflow-hidden opacity-0 animate-fade-in-up"
                            style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                          >
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center justify-between w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border">
                                <div className="flex items-center gap-3">
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getCategoryColor(clause.category))}>
                                    {getCategoryLabel(clause.category)}
                                  </span>
                                  <ClauseTooltip category={clause.category} />
                                  <h3 className="font-semibold text-foreground text-left">{clause.title}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <ConfidenceIndicator matchCount={clause.sentences?.length || 0} />
                                  <span className="text-xs">{(clause.sentences || []).length} sentence(s)</span>
                                  {expandedClauses.has(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                              </button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent className="animate-accordion-down">
                              <div className="px-4 py-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Applicable Sentence(s):</p>
                                <div className="space-y-2">
                                  {(clause.sentences || []).map((sentence, sIndex) => (
                                    <blockquote
                                      key={sIndex}
                                      className="pl-3 border-l-2 border-accent/40 text-sm text-foreground/90 leading-relaxed italic bg-accent/5 py-2 pr-2 rounded-r"
                                    >
                                      "
                                      <LegalTermHighlighter 
                                        text={sentence}
                                        className="contents"
                                      />
                                      "
                                    </blockquote>
                                  ))}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </div>

                    {/* Download Report */}
                    <div className="card-professional opacity-0 animate-fade-in-up stagger-4 border-accent/20">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h2 className="font-heading text-xl font-semibold text-foreground mb-1">Download Analysis Report</h2>
                          <p className="text-sm text-muted-foreground">Save a complete PDF report of this analysis for your records.</p>
                        </div>
                        <Button variant="hero" size="lg" onClick={generateReport} className="gap-2">
                          <Download className="h-4 w-4" />
                          Download PDF Report
                        </Button>
                      </div>
                    </div>

                    <div className="text-center opacity-0 animate-fade-in-up stagger-5 flex gap-4 justify-center">
                      <Button variant="outline" size="lg" onClick={handleClear}>Analyze Another Contract</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="compare" className="mt-6">
                <ContractComparison />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </AnimatedPage>
    </PageLayout>
  );
};

export default Analyze;
