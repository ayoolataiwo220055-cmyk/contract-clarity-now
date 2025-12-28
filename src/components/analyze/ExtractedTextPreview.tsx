import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtractedTextPreviewProps {
  text: string;
  highlightedSentence?: string | null;
}

export interface ExtractedTextPreviewHandle {
  scrollToSentence: (sentence: string) => void;
}

const ExtractedTextPreview = forwardRef<ExtractedTextPreviewHandle, ExtractedTextPreviewProps>(
  ({ text, highlightedSentence }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [internalHighlight, setInternalHighlight] = useState<string | null>(null);
    const textContainerRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Combine external and internal highlights
    const activeHighlight = highlightedSentence || internalHighlight;

    useImperativeHandle(ref, () => ({
      scrollToSentence: (sentence: string) => {
        setIsExpanded(true);
        setInternalHighlight(sentence);
        
        // Wait for expansion animation then scroll
        setTimeout(() => {
          if (textContainerRef.current) {
            const textContent = textContainerRef.current.innerHTML;
            const normalizedSentence = sentence.slice(0, 50); // Use first 50 chars for matching
            
            // Find and scroll to the highlighted element
            const highlightedElement = textContainerRef.current.querySelector('.sentence-highlight');
            if (highlightedElement) {
              highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 300);
      },
    }));

    // Clear internal highlight after 5 seconds
    useEffect(() => {
      if (internalHighlight) {
        const timer = setTimeout(() => setInternalHighlight(null), 5000);
        return () => clearTimeout(timer);
      }
    }, [internalHighlight]);

    // Highlight matching text
    const renderHighlightedText = () => {
      if (!text) return null;

      let processedText = text;
      
      // If there's an active highlight, wrap it
      if (activeHighlight) {
        const escapedSentence = activeHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSentence.slice(0, 100)})`, 'gi');
        processedText = text.replace(regex, '<mark class="sentence-highlight bg-accent/30 text-accent-foreground px-1 py-0.5 rounded font-medium animate-pulse">$1</mark>');
      }
      
      // If there's a search term, highlight it
      if (searchTerm.length >= 2) {
        const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(`(${escapedSearch})`, 'gi');
        processedText = processedText.replace(searchRegex, '<mark class="bg-amber-200 text-amber-900 px-0.5 rounded">$1</mark>');
      }

      return (
        <div
          ref={textContainerRef}
          className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    };

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent" />
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Extracted Text</h3>
                  <p className="text-xs text-muted-foreground">
                    {wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {activeHighlight && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                    Sentence highlighted
                  </span>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="animate-accordion-down">
            <div className="p-4 border-t border-border">
              {/* Search Bar */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search in extracted text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchTerm && (
                  <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
                    Clear
                  </Button>
                )}
              </div>
              
              {/* Text Preview */}
              <ScrollArea className="h-[400px] rounded-md border border-border bg-background p-4" ref={scrollAreaRef}>
                {renderHighlightedText()}
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);

ExtractedTextPreview.displayName = 'ExtractedTextPreview';

export default ExtractedTextPreview;
