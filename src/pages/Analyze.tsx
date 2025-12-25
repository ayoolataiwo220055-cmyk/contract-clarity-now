import { useState, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import { validateFile, processFile, ProcessingResult, ClauseAnalysis, RiskArea, RiskScore } from "@/lib/fileProcessor";
import { cn } from "@/lib/utils";

const Analyze = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
        setError('Failed to process the document. Please try again.');
      } else {
        setResult(processingResult);
      }
    } catch (err) {
      setError('An unexpected error occurred during processing.');
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

  return (
    <PageLayout>
      <section className="py-12 lg:py-16">
        <div className="section-container">
          {/* Page Header */}
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Analyze Your Contract
            </h1>
            <p className="text-muted-foreground">
              Upload your employee contract document to receive structured analysis.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mx-auto max-w-2xl mb-12">
            <div className="card-professional">
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "relative border-2 border-dashed rounded-md p-8 text-center transition-colors duration-200",
                    isDragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload contract file"
                  />
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" aria-hidden="true" />
                  <p className="text-foreground font-medium mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF and DOCX files up to 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                  {error}
                </div>
              )}

              {file && !result && (
                <div className="mt-6 flex flex-col items-center gap-4">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Upload & Analyze
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>Files are processed temporarily and deleted immediately.</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && result.success && (
            <div className="mx-auto max-w-4xl space-y-8 animate-slide-up">
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
                      <h2 className="font-heading text-xl font-semibold">
                        {getRiskScoreLabel(result.riskScore.level)}
                      </h2>
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
              <div className="card-professional">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    Analysis Complete
                  </h2>
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

              {/* Risk Areas */}
              {result.riskAreas.length > 0 && (
                <div className="card-professional">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                      Potential Risk Areas
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {result.riskAreas.map((risk, index) => (
                      <div
                        key={index}
                        className={cn("p-4 border rounded-md", getSeverityColor(risk.severity))}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {risk.severity} risk
                          </span>
                        </div>
                        <h3 className="font-medium mb-1">{risk.title}</h3>
                        <p className="text-sm opacity-90 mb-2">{risk.description}</p>
                        <p className="text-sm font-medium">
                          Recommendation: {risk.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Identified Clauses */}
              <div className="card-professional">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Identified Clauses
                </h2>
                <div className="space-y-4">
                  {result.clauses.map((clause, index) => (
                    <div key={index} className="border border-border rounded-md overflow-hidden">
                      {/* Clause Header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getCategoryColor(clause.category))}>
                          {getCategoryLabel(clause.category)}
                        </span>
                        <h3 className="font-semibold text-foreground">{clause.title}</h3>
                      </div>
                      
                      {/* Applicable Sentences */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Applicable Sentence(s):
                        </p>
                        <div className="space-y-2">
                          {clause.sentences.map((sentence, sIndex) => (
                            <blockquote
                              key={sIndex}
                              className="pl-3 border-l-2 border-accent/40 text-sm text-foreground/90 leading-relaxed italic"
                            >
                              "{sentence}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Text Preview */}
              <div className="card-professional">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Extracted Text Preview
                </h2>
                <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body leading-relaxed">
                    {result.text.length > 5000 
                      ? result.text.substring(0, 5000) + '\n\n[...truncated for display]' 
                      : result.text || 'No text could be extracted from this document.'
                    }
                  </pre>
                </div>
              </div>

              {/* Analyze Another */}
              <div className="text-center">
                <Button variant="outline" size="lg" onClick={handleClear}>
                  Analyze Another Contract
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Analyze;
