import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedPage from "@/components/layout/AnimatedPage";
import CustomClausesManager from "@/components/CustomClausesManager";

const Settings = () => {
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
