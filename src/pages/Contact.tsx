import { Mail, MessageSquare, Shield } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const Contact = () => {
  return (
    <PageLayout>
      <section className="py-12 lg:py-16">
        <div className="section-container">
          {/* Page Header */}
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-muted-foreground">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Options */}
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email Contact */}
              <div className="card-professional text-center">
                <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Mail className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-lg font-medium text-foreground mb-2">
                  Email Us
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  For general inquiries and support
                </p>
                <a
                  href="mailto:support@employknow.com"
                  className="text-accent hover:underline font-medium"
                >
                  support@employknow.com
                </a>
              </div>

              {/* Feedback */}
              <div className="card-professional text-center">
                <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <MessageSquare className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-lg font-medium text-foreground mb-2">
                  Send Feedback
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Help us improve Employ Know
                </p>
                <a
                  href="mailto:feedback@employknow.com"
                  className="text-accent hover:underline font-medium"
                >
                  feedback@employknow.com
                </a>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-10 p-6 bg-muted/30 border border-border rounded-md">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                    Your Privacy Matters
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    When you contact us, please avoid including any sensitive contract details or personal information. 
                    We're committed to protecting your privacy and do not collect or store any data from your contract analyses.
                    If you need to discuss specific contract concerns, we recommend consulting with a qualified attorney.
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                We typically respond within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Contact;
