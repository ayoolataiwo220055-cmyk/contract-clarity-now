import { supabase } from "@/integrations/supabase/client";

export interface ClassificationResult {
  sentence: string;
  category: string;
  confidence: number;
  scores: Record<string, number>;
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
}

export interface SimilarityResult {
  sourceText: string;
  similarities: Array<{
    targetText: string;
    score: number;
  }>;
}

// ML-powered clause classification using LEGAL-BERT
export async function classifySentences(sentences: string[]): Promise<ClassificationResult[]> {
  if (sentences.length === 0) return [];

  try {
    const { data, error } = await supabase.functions.invoke('legal-bert', {
      body: {
        action: 'classify',
        sentences
      }
    });

    if (error) {
      console.error('Classification error:', error);
      throw new Error(error.message);
    }

    return data.results || [];
  } catch (err) {
    console.error('Failed to classify sentences:', err);
    throw err;
  }
}

// Generate embeddings for texts using LEGAL-BERT
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return [];

  try {
    const { data, error } = await supabase.functions.invoke('legal-bert', {
      body: {
        action: 'embed',
        texts
      }
    });

    if (error) {
      console.error('Embedding error:', error);
      throw new Error(error.message);
    }

    return data.results || [];
  } catch (err) {
    console.error('Failed to generate embeddings:', err);
    throw err;
  }
}

// Find similar clauses using semantic similarity
export async function findSimilarClauses(
  sourceText: string, 
  targetTexts: string[]
): Promise<SimilarityResult> {
  if (!sourceText || targetTexts.length === 0) {
    return { sourceText, similarities: [] };
  }

  try {
    const { data, error } = await supabase.functions.invoke('legal-bert', {
      body: {
        action: 'similarity',
        sourceText,
        targetTexts
      }
    });

    if (error) {
      console.error('Similarity error:', error);
      throw new Error(error.message);
    }

    return data.result || { sourceText, similarities: [] };
  } catch (err) {
    console.error('Failed to compute similarity:', err);
    throw err;
  }
}

// Batch process sentences for ML classification with chunking
export async function batchClassifySentences(
  sentences: string[], 
  batchSize: number = 10,
  onProgress?: (processed: number, total: number) => void
): Promise<ClassificationResult[]> {
  const results: ClassificationResult[] = [];
  
  for (let i = 0; i < sentences.length; i += batchSize) {
    const batch = sentences.slice(i, i + batchSize);
    const batchResults = await classifySentences(batch);
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, sentences.length), sentences.length);
    }
  }

  return results;
}

// Map ML category to internal category type
export function mapMLCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'compensation': 'compensation',
    'termination': 'termination',
    'confidentiality': 'confidentiality',
    'non-compete': 'non-compete',
    'benefits': 'benefits',
    'non-solicitation': 'non-solicitation',
    'relocation': 'relocation',
    'dispute-resolution': 'dispute-resolution',
    'intellectual-property': 'intellectual-property',
    'probation': 'probation',
    'overtime': 'overtime',
    'other': 'other'
  };

  return categoryMap[category.toLowerCase()] || 'other';
}

// Convert ML confidence to confidence level
export function getConfidenceLevel(score: number): 'strong' | 'moderate' | 'weak' {
  if (score >= 0.7) return 'strong';
  if (score >= 0.4) return 'moderate';
  return 'weak';
}

// Check if ML service is available
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('legal-bert', {
      body: {
        action: 'classify',
        sentences: ['test']
      }
    });
    return !error;
  } catch {
    return false;
  }
}
