import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@3.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// LEGAL-BERT model for contract analysis
const LEGAL_BERT_MODEL = "nlpaueb/bert-base-uncased-contracts";
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// Clause categories for classification
const CLAUSE_CATEGORIES = [
  'compensation',
  'termination', 
  'confidentiality',
  'non-compete',
  'benefits',
  'non-solicitation',
  'relocation',
  'dispute-resolution',
  'intellectual-property',
  'probation',
  'overtime',
  'other'
] as const;

interface ClassifyRequest {
  action: 'classify';
  sentences: string[];
}

interface EmbedRequest {
  action: 'embed';
  texts: string[];
}

interface SimilarityRequest {
  action: 'similarity';
  sourceText: string;
  targetTexts: string[];
}

type RequestBody = ClassifyRequest | EmbedRequest | SimilarityRequest;

interface ClassificationResult {
  sentence: string;
  category: string;
  confidence: number;
  scores: Record<string, number>;
}

interface EmbeddingResult {
  text: string;
  embedding: number[];
}

interface SimilarityResult {
  sourceText: string;
  similarities: Array<{
    targetText: string;
    score: number;
  }>;
}

// Helper: cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HUGGINGFACE_API_KEY) {
      console.error('HUGGINGFACE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hf = new HfInference(HUGGINGFACE_API_KEY);
    const body: RequestBody = await req.json();

    console.log(`Processing ${body.action} request`);

    switch (body.action) {
      case 'classify': {
        const { sentences } = body as ClassifyRequest;
        
        if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
          return new Response(
            JSON.stringify({ error: 'sentences array is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Classifying ${sentences.length} sentences`);

        // Use zero-shot classification with the LEGAL-BERT model
        // Since LEGAL-BERT is a masked language model, we'll use zero-shot classification
        const results: ClassificationResult[] = [];
        
        for (const sentence of sentences) {
          try {
            // Use zero-shot classification for clause categorization
            const classification = await hf.zeroShotClassification({
              model: "facebook/bart-large-mnli", // Use BART for zero-shot (LEGAL-BERT doesn't support direct classification)
              inputs: sentence,
              parameters: {
                candidate_labels: CLAUSE_CATEGORIES as unknown as string[],
              }
            }) as unknown as { labels: string[]; scores: number[] };

            // Get the top category
            const topIndex = 0;
            const category = classification.labels[topIndex];
            const confidence = classification.scores[topIndex];

            // Build scores map
            const scores: Record<string, number> = {};
            for (let i = 0; i < classification.labels.length; i++) {
              scores[classification.labels[i]] = classification.scores[i];
            }

            results.push({
              sentence,
              category,
              confidence,
              scores
            });
          } catch (err) {
            console.error(`Error classifying sentence: ${err}`);
            results.push({
              sentence,
              category: 'other',
              confidence: 0,
              scores: {}
            });
          }
        }

        console.log(`Classification complete: ${results.length} results`);

        return new Response(
          JSON.stringify({ results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'embed': {
        const { texts } = body as EmbedRequest;
        
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
          return new Response(
            JSON.stringify({ error: 'texts array is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Generating embeddings for ${texts.length} texts`);

        const results: EmbeddingResult[] = [];

        for (const text of texts) {
          try {
            // Use LEGAL-BERT for embeddings via feature extraction
            const embedding = await hf.featureExtraction({
              model: LEGAL_BERT_MODEL,
              inputs: text,
            });

            // Handle the embedding response (could be nested arrays)
            let flatEmbedding: number[];
            if (Array.isArray(embedding[0])) {
              // Take mean pooling if we get token-level embeddings
              const tokenEmbeddings = embedding as number[][];
              flatEmbedding = tokenEmbeddings[0]; // Use first token (CLS) or mean pool
              
              // Mean pooling across all tokens
              if (tokenEmbeddings.length > 1) {
                flatEmbedding = new Array(tokenEmbeddings[0].length).fill(0);
                for (const tokenEmb of tokenEmbeddings) {
                  for (let i = 0; i < tokenEmb.length; i++) {
                    flatEmbedding[i] += tokenEmb[i] / tokenEmbeddings.length;
                  }
                }
              }
            } else {
              flatEmbedding = embedding as number[];
            }

            results.push({
              text,
              embedding: flatEmbedding
            });
          } catch (err) {
            console.error(`Error generating embedding: ${err}`);
            results.push({
              text,
              embedding: []
            });
          }
        }

        console.log(`Embeddings complete: ${results.length} results`);

        return new Response(
          JSON.stringify({ results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'similarity': {
        const { sourceText, targetTexts } = body as SimilarityRequest;
        
        if (!sourceText || !targetTexts || !Array.isArray(targetTexts)) {
          return new Response(
            JSON.stringify({ error: 'sourceText and targetTexts array are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Computing similarity for 1 source against ${targetTexts.length} targets`);

        // Get embedding for source
        const sourceEmbedding = await hf.featureExtraction({
          model: EMBEDDING_MODEL,
          inputs: sourceText,
        }) as number[];

        // Get embeddings for all targets
        const targetEmbeddings: number[][] = [];
        for (const target of targetTexts) {
          const embedding = await hf.featureExtraction({
            model: EMBEDDING_MODEL,
            inputs: target,
          }) as number[];
          targetEmbeddings.push(embedding);
        }

        // Compute similarities
        const similarities = targetTexts.map((targetText, i) => ({
          targetText,
          score: cosineSimilarity(sourceEmbedding, targetEmbeddings[i])
        }));

        // Sort by score descending
        similarities.sort((a, b) => b.score - a.score);

        const result: SimilarityResult = {
          sourceText,
          similarities
        };

        console.log(`Similarity computation complete`);

        return new Response(
          JSON.stringify({ result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: classify, embed, or similarity' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in legal-bert function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
