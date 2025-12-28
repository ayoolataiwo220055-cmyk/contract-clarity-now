import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Loader2, X, Shield, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedPage from "@/components/layout/AnimatedPage";
import AnalysisSkeleton from "@/components/ui/AnalysisSkeleton";
import Disclaimer from "@/components/ui/Disclaimer";
import ContractComparison from "@/components/analyze/ContractComparison";
import SectionedOutput from "@/components/analyze/SectionedOutput";
import KeyDatesCalendar from "@/components/KeyDatesCalendar";
import { validateFile, processFile, ProcessingResult, ClauseAnalysis, RiskArea, RiskScore } from "@/lib/fileProcessor";
import { extractDatesFromText, ContractDate, saveDates } from "@/lib/dateExtractor";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import { detectContractType, getContractTypeLabel } from "@/lib/clauseCategories";

const Analyze = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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

                    {/* Key Dates Calendar */}
                    {contractDates.length > 0 && (
                      <div className="card-professional opacity-0 animate-fade-in-up">
                        <KeyDatesCalendar 
                          dates={contractDates}
                          onDatesChange={(updatedDates) => setContractDates(updatedDates)}
                        />
                      </div>
                    )}

                    {/* Sectioned Output View */}
                    <SectionedOutput
                      result={result}
                      onGenerateReport={generateReport}
                      getCategoryColor={getCategoryColor}
                      getCategoryLabel={getCategoryLabel}
                      getSeverityColor={getSeverityColor}
                      getRiskScoreColor={getRiskScoreColor}
                      getRiskScoreLabel={getRiskScoreLabel}
                    />

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
