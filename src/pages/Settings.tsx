import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedPage from "@/components/layout/AnimatedPage";
import CustomClausesManager from "@/components/CustomClausesManager";
import { checkMLServiceHealth } from "@/lib/mlAnalysisService";
import { toast } from "sonner";

const Settings = () => {
  const [mlAnalysisEnabled, setMlAnalysisEnabled] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('contract-clarity-ml-analysis');
    setMlAnalysisEnabled(saved === 'true');
  }, []);

  const handleMLToggle = async (enabled: boolean) => {
    if (enabled) {
      setIsCheckingHealth(true);
      const isHealthy = await checkMLServiceHealth();
      setIsCheckingHealth(false);

      if (!isHealthy) {
        toast.error("ML service is currently unavailable. Please try again later.");
        return;
      }
      toast.success("ML-powered analysis enabled!");
    } else {
      toast.info("Switched to rule-based analysis");
    }

    setMlAnalysisEnabled(enabled);
    localStorage.setItem('contract-clarity-ml-analysis', enabled.toString());
  };

  return (
    <AnimatedPage>
      <PageLayout>
        <section className="py-12">
          <div className="section-container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-semibold text-foreground">Settings & Custom Clauses</h1>
                <p className="text-sm text-muted-foreground">Manage your preferences and create a library of custom contract clauses to reuse in documents.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  {/* ML Analysis Toggle */}
                  <div className="card-professional p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-accent" />
                      ML-Powered Analysis
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable AI-powered clause classification using the LEGAL-BERT transformer model. 
                      This provides more accurate clause detection and semantic similarity search.
                    </p>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label htmlFor="ml-toggle" className="font-medium">
                          Use ML Analysis
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {mlAnalysisEnabled 
                            ? "Using LEGAL-BERT for classification" 
                            : "Using rule-based keyword matching"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCheckingHealth && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Switch
                          id="ml-toggle"
                          checked={mlAnalysisEnabled}
                          onCheckedChange={handleMLToggle}
                          disabled={isCheckingHealth}
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <strong>Note:</strong> ML analysis requires an internet connection and may take slightly longer to process.
                    </div>
                  </div>

                  <div className="card-professional p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                      Legal Glossary
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse and search our library of legal terms, definitions, and explanations used in contracts.
                    </p>
                    <Button asChild>
                      <Link to="/glossary">View Glossary</Link>
                    </Button>
                  </div>

                  <div className="card-professional p-6">
                    <CustomClausesManager />
                  </div>
                </div>

                <aside className="md:col-span-1 space-y-6">
                  <div className="card-professional p-6">
                    <h4 className="text-md font-semibold mb-2">Quick Actions</h4>
                    <div className="flex flex-col gap-3">
                      <Button asChild variant="ghost">
                        <Link to="/analyze">Analyze Document</Link>
                      </Button>
                      <Button asChild variant="ghost">
                        <Link to="/glossary">Browse Glossary</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="card-professional p-6">
                    <h4 className="text-md font-semibold mb-2">Analysis Mode</h4>
                    <div className={`p-3 rounded-md ${mlAnalysisEnabled ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 border border-border'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className={`h-4 w-4 ${mlAnalysisEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">
                          {mlAnalysisEnabled ? 'ML Analysis' : 'Rule-Based'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {mlAnalysisEnabled 
                          ? 'Using LEGAL-BERT transformer model' 
                          : 'Using keyword pattern matching'}
                      </p>
                    </div>
                  </div>

                  <div className="card-professional p-6">
                    <h4 className="text-md font-semibold mb-2">Support</h4>
                    <p className="text-sm text-muted-foreground">Questions or feedback? Reach out via the contact page.</p>
                    <div className="mt-3">
                      <Button asChild>
                        <Link to="/contact">Contact Us</Link>
                      </Button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>
    </AnimatedPage>
  );
};

export default Settings;
