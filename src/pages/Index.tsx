import { Link } from "react-router-dom";
import { Shield, Lock, Trash2, FileCheck, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedPage from "@/components/layout/AnimatedPage";

const Index = () => {
  return (
    <PageLayout>
      <AnimatedPage>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 lg:py-28">
          <div className="section-container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm text-accent opacity-0 animate-fade-in-up">
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>Secure Contract Analysis</span>
              </div>
              
              <h1 className="mb-6 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl opacity-0 animate-slide-up stagger-1">
                Understand Your Employee Contract{" "}
                <span className="text-accent">Before You Sign</span>
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl opacity-0 animate-fade-in-up stagger-2">
                Employ Know helps you analyze employee contracts securely and instantly. 
                No accounts required. Your files are never stored.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-3">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/analyze">
                    Analyze Employee Contract
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="border-y border-border bg-card py-12">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center opacity-0 animate-fade-in-up stagger-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Trash2 className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-medium text-foreground">No Files Stored</h3>
                <p className="text-sm text-muted-foreground">
                  Documents are processed in memory and immediately deleted after analysis.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center opacity-0 animate-fade-in-up stagger-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Lock className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-medium text-foreground">No Accounts Required</h3>
                <p className="text-sm text-muted-foreground">
                  Start analyzing immediately. No sign-up, no passwords, no tracking.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center opacity-0 animate-fade-in-up stagger-3">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <FileCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-medium text-foreground">Session-Free Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Refresh the page anytime to clear all data. Your privacy is guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center mb-12 opacity-0 animate-fade-in-up">
              <h2 className="font-heading text-3xl font-semibold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Three simple steps to understand your employment contract better.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Upload', desc: 'Upload your PDF or DOCX contract file.' },
                { step: '2', title: 'Analyze', desc: 'Our system extracts and identifies key clauses.' },
                { step: '3', title: 'Review', desc: 'View structured results with highlighted areas.' },
              ].map((item, index) => (
                <div 
                  key={item.step}
                  className={`card-professional card-hover text-center opacity-0 animate-slide-up stagger-${index + 1}`}
                >
                  <div className="mb-4 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="section-container text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-primary-foreground mb-4">
              Ready to Understand Your Contract?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Get started in seconds. No registration, no data retention.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none"
              >
                <Link to="/analyze">
                  Start Analysis
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none"
              >
                <Link to="/glossary">
                  Browse Glossary
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedPage>
    </PageLayout>
  );
};

export default Index;
