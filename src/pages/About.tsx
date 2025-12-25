import { Users, Code, Brain, Shield, Target, Lightbulb } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const About = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold text-foreground mb-6">
              About Employ Know
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Empowering employees to understand their contracts before they sign.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <div className="card-professional">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-accent" aria-hidden="true" />
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Our Mission
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Employ Know was created with a simple but powerful mission: to help employees understand what they're agreeing to before signing their employment contracts. Too often, complex legal language and buried clauses catch workers off guard, leading to unexpected restrictions on their careers and lives.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe that every worker deserves to understand the terms of their employment—without needing expensive legal consultations for basic clarity. Our tool analyzes contract documents right in your browser, identifying key clauses, potential risks, and areas that warrant careful consideration.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're reviewing a non-compete clause, understanding your IP rights, or checking termination terms, Employ Know gives you the knowledge to negotiate from a position of understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              What We Offer
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card-professional text-center">
              <Shield className="h-10 w-10 text-accent mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Privacy First
              </h3>
              <p className="text-sm text-muted-foreground">
                Your documents are processed entirely in your browser. No uploads to external servers, no data storage.
              </p>
            </div>
            <div className="card-professional text-center">
              <Lightbulb className="h-10 w-10 text-accent mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Smart Analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatically detects key contract clauses and highlights potential risks with actionable recommendations.
              </p>
            </div>
            <div className="card-professional text-center">
              <Code className="h-10 w-10 text-accent mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Free to Use
              </h3>
              <p className="text-sm text-muted-foreground">
                No subscriptions, no hidden fees. Analyze as many contracts as you need, completely free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
                Our Team
              </h2>
            </div>
            <p className="text-muted-foreground">
              Meet the people behind Employ Know.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Team Member 1 */}
            <div className="card-professional text-center">
              <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Code className="h-10 w-10 text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                Jackreece Brian
              </h3>
              <p className="text-accent font-medium mb-3">Lead Developer</p>
              <p className="text-sm text-muted-foreground">
                Leads the development of Employ Know, architecting the core analysis engine and ensuring a seamless user experience for contract review.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="card-professional text-center">
              <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                Taiwo Isaac
              </h3>
              <p className="text-accent font-medium mb-3">AI Engineer & Support Developer</p>
              <p className="text-sm text-muted-foreground">
                Develops the intelligent clause detection patterns and provides ongoing support to enhance the platform's analytical capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              Ready to Analyze Your Contract?
            </h2>
            <p className="text-muted-foreground mb-6">
              Get started in seconds—no account required.
            </p>
            <a
              href="/analyze"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-8"
            >
              Start Analyzing
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
