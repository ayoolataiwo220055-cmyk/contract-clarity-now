import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is Employ Know?",
    answer: "Employ Know is a secure, privacy-focused tool that helps you analyze employee contracts. It extracts text from your documents and identifies key clauses such as compensation, termination conditions, confidentiality agreements, and non-compete restrictions."
  },
  {
    question: "Do you store my documents?",
    answer: "No, absolutely not. Your documents are processed entirely in your browser's memory. Files are never uploaded to any server and are automatically cleared when you refresh the page or leave the site. We have no database and retain zero user data."
  },
  {
    question: "Is this legal advice?",
    answer: "No. Employ Know provides informational analysis to help you understand the contents of your contract. It is not a substitute for legal counsel. For specific legal questions or concerns about your employment agreement, please consult with a qualified employment attorney."
  },
  {
    question: "What file types are supported?",
    answer: "We currently support PDF (.pdf) and Microsoft Word (.docx) documents. Files must be under 10MB in size. Scanned documents may have limited text extraction capabilities."
  },
  {
    question: "Who is this tool for?",
    answer: "Employ Know is designed for job seekers, employees, and anyone reviewing an employment contract. It's helpful for understanding what you're agreeing to before signing, identifying potentially concerning clauses, and preparing questions for your employer or legal advisor."
  },
  {
    question: "Do I need to create an account?",
    answer: "No. Employ Know requires no registration, no login, and no personal information. You can start analyzing your contract immediately with complete anonymity."
  },
  {
    question: "How accurate is the analysis?",
    answer: "The analysis identifies common contract patterns and clauses based on keyword detection. While it provides helpful insights, the accuracy depends on the document's formatting and clarity. Always review the extracted text and consult professionals for important decisions."
  },
  {
    question: "Can I use this on mobile devices?",
    answer: "Yes. Employ Know is fully responsive and works on smartphones and tablets. Simply upload your document file and receive the analysis directly on your device."
  },
  {
    question: "What happens when I refresh the page?",
    answer: "All data is cleared. This is by design—your document, the extracted text, and the analysis results are all removed from memory. There's no way to recover previously analyzed documents."
  },
  {
    question: "Is this service free?",
    answer: "Yes. Employ Know is completely free to use with no hidden fees, subscriptions, or premium features."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout>
      <section className="py-12 lg:py-16">
        <div className="section-container">
          {/* Page Header */}
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about Employ Know and how it protects your privacy.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="mx-auto max-w-3xl">
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="card-professional overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between text-left py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                    aria-expanded={openIndex === index}
                  >
                    <span className="font-medium text-foreground pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                        openIndex === index && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-out",
                      openIndex === index ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;
