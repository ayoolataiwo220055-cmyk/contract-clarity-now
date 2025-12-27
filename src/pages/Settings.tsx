import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedPage from "@/components/layout/AnimatedPage";
import CustomClausesManager from "@/components/CustomClausesManager";

const Settings = () => {
  return (
    <AnimatedPage>
      <PageLayout title="Settings & Custom Clauses" description="Manage your preferences and create a library of custom contract clauses">
        <div className="space-y-8">
          <div className="card-professional">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  EmployKnow Legal Glossary
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse and search our comprehensive library of legal terms, definitions, and explanations used in employment contracts.
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/glossary">
                View Glossary
              </Link>
            </Button>
          </div>
          <CustomClausesManager />
        </div>
      </PageLayout>
    </AnimatedPage>
  );
};

export default Settings;
