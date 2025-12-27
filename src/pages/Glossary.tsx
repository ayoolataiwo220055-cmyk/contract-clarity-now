import { useState } from 'react';
import { Search, BookOpen, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import PageLayout from '@/components/layout/PageLayout';
import AnimatedPage from '@/components/layout/AnimatedPage';
import { LEGAL_GLOSSARY, getTermsByCategory, searchTerms, LegalTerm } from '@/lib/legalGlossary';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'employment', label: 'Employment', color: 'bg-blue-100 text-blue-800' },
  { id: 'contract', label: 'Contract Basics', color: 'bg-purple-100 text-purple-800' },
  { id: 'rights', label: 'Rights & Restrictions', color: 'bg-red-100 text-red-800' },
  { id: 'termination', label: 'Termination', color: 'bg-orange-100 text-orange-800' },
  { id: 'compensation', label: 'Compensation', color: 'bg-green-100 text-green-800' },
  { id: 'compliance', label: 'Compliance', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'dispute', label: 'Dispute Resolution', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'general', label: 'General Legal', color: 'bg-gray-100 text-gray-800' },
] as const;

const LegalGlossaryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-100 text-gray-800';
  };

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(term)) {
        newSet.delete(term);
      } else {
        newSet.add(term);
      }
      return newSet;
    });
  };

  let displayedTerms: LegalTerm[];

  if (searchQuery.trim()) {
    displayedTerms = searchTerms(searchQuery);
  } else if (selectedCategory) {
    displayedTerms = getTermsByCategory(selectedCategory as 'employment' | 'contract' | 'rights' | 'termination' | 'compensation' | 'compliance' | 'dispute' | 'general');
  } else {
    displayedTerms = Object.values(LEGAL_GLOSSARY);
  }

  displayedTerms = displayedTerms.sort((a, b) => a.term.localeCompare(b.term));

  return (
    <AnimatedPage>
      <PageLayout>
        <section className="py-12 lg:py-16">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                EmployKnow Glossary
              </h1>
              <p className="text-muted-foreground">
                Understand common legal and contract terms used in employment agreements
              </p>
            </div>

            <div className="mx-auto max-w-4xl space-y-8">
              {/* Search Section */}
              <div className="card-professional">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-semibold text-foreground">Search Terms</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for legal terms, definitions, or concepts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {displayedTerms.length} term{displayedTerms.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Category Filter */}
              {!searchQuery.trim() && (
                <div className="card-professional">
                  <div className="flex items-center gap-3 mb-4">
                    <Filter className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Browse by Category</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(null)}
                      size="sm"
                    >
                      All Terms
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat.id)}
                        size="sm"
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms List */}
              <div className="space-y-3">
                {displayedTerms.length === 0 ? (
                  <div className="card-professional text-center py-8">
                    <p className="text-muted-foreground">No terms found matching your search.</p>
                  </div>
                ) : (
                  displayedTerms.map((term) => (
                    <Collapsible
                      key={term.term}
                      open={expandedTerms.has(term.term)}
                      onOpenChange={() => toggleTerm(term.term)}
                      className="card-professional"
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-lg hover:text-accent transition-colors">
                                {term.term}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {term.definition}
                              </p>
                            </div>
                            <Badge className={cn('ml-4 whitespace-nowrap', getCategoryColor(term.category))}>
                              {term.category}
                            </Badge>
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="pt-4 border-t border-border mt-4 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Definition:</p>
                          <p className="text-sm text-foreground/80">{term.definition}</p>
                        </div>

                        {term.example && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Example:</p>
                            <p className="text-sm italic text-foreground/70 bg-muted/30 p-3 rounded border border-border">
                              "{term.example}"
                            </p>
                          </div>
                        )}

                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Related Terms:</p>
                            <div className="flex flex-wrap gap-2">
                              {term.relatedTerms.map((relatedTerm) => (
                                <Button
                                  key={relatedTerm}
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSearchQuery(relatedTerm)}
                                  className="text-xs"
                                >
                                  {relatedTerm}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>

              {/* Info Box */}
              <div className="card-professional bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> When analyzing contracts, terms highlighted in color have definitions available. Hover over them to learn more about their meaning and usage.
                </p>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>
    </AnimatedPage>
  );
};

export default LegalGlossaryPage;
