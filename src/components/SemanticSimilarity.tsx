import { useState, useCallback } from "react";
import { Search, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { findSimilarClauses, SimilarityResult } from "@/lib/mlAnalysisService";
import { cn } from "@/lib/utils";

interface SemanticSimilarityProps {
  contractSentences: string[];
  className?: string;
}

const SemanticSimilarity = ({ contractSentences, className }: SemanticSimilarityProps) => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SimilarityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSearch = useCallback(async () => {
    if (!searchText.trim() || contractSentences.length === 0) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const result = await findSimilarClauses(searchText.trim(), contractSentences);
      setResults(result);
    } catch (err) {
      console.error("Similarity search failed:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchText, contractSentences]);

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-emerald-600";
    if (score >= 0.4) return "text-amber-600";
    return "text-muted-foreground";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return "High Match";
    if (score >= 0.4) return "Moderate Match";
    return "Low Match";
  };

  return (
    <div className={cn("card-professional", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Semantic Clause Search</h3>
            <p className="text-sm text-muted-foreground">
              Find similar clauses using AI-powered semantic analysis
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Enter a clause or text to find similar content
            </label>
            <Textarea
              placeholder="e.g., 'The employee agrees not to work for competitors for 2 years after leaving...'"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={!searchText.trim() || isSearching || contractSentences.length === 0}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Similar Clauses
              </>
            )}
          </Button>

          {contractSentences.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Upload and analyze a contract first to enable similarity search.
            </p>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {results && results.similarities.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-medium text-foreground">
                Top Matching Clauses ({results.similarities.length} found)
              </h4>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {results.similarities.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/30 rounded-md border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-xs font-medium", getScoreColor(item.score))}>
                        {getScoreLabel(item.score)} • {(item.score * 100).toFixed(1)}% similarity
                      </span>
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    </div>
                    <Progress 
                      value={item.score * 100} 
                      className="h-1 mb-2"
                    />
                    <p className="text-sm text-foreground line-clamp-3">
                      "{item.targetText}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.similarities.length === 0 && (
            <div className="p-4 bg-muted/30 rounded-md text-center">
              <p className="text-sm text-muted-foreground">
                No similar clauses found. Try a different search query.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SemanticSimilarity;
