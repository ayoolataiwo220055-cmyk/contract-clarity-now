import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessingResult {
  success: boolean;
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
  wordCount: number;
  clauses: ClauseAnalysis[];
  riskAreas: RiskArea[];
}

export interface ClauseAnalysis {
  title: string;
  content: string;
  category: 'compensation' | 'termination' | 'confidentiality' | 'non-compete' | 'benefits' | 'other';
}

export interface RiskArea {
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
  
  if (!isValidType) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF or DOCX file.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

async function extractPdfText(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  
  let fullText = '';
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return { text: fullText.trim(), pageCount };
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function analyzeText(text: string): { clauses: ClauseAnalysis[]; riskAreas: RiskArea[] } {
  // Placeholder clause detection based on common contract keywords
  const clauses: ClauseAnalysis[] = [];
  const riskAreas: RiskArea[] = [];
  
  const lowerText = text.toLowerCase();
  
  // Detect compensation clauses
  if (lowerText.includes('salary') || lowerText.includes('compensation') || lowerText.includes('wage')) {
    clauses.push({
      title: 'Compensation Terms',
      content: 'Salary and compensation details detected in document.',
      category: 'compensation',
    });
  }
  
  // Detect termination clauses
  if (lowerText.includes('termination') || lowerText.includes('notice period')) {
    clauses.push({
      title: 'Termination Conditions',
      content: 'Employment termination provisions identified.',
      category: 'termination',
    });
    
    if (lowerText.includes('immediate termination') || lowerText.includes('at will')) {
      riskAreas.push({
        severity: 'medium',
        title: 'At-Will Employment',
        description: 'This contract may allow termination without cause.',
        recommendation: 'Clarify termination conditions and notice requirements.',
      });
    }
  }
  
  // Detect confidentiality clauses
  if (lowerText.includes('confidential') || lowerText.includes('non-disclosure') || lowerText.includes('nda')) {
    clauses.push({
      title: 'Confidentiality Agreement',
      content: 'Non-disclosure and confidentiality requirements present.',
      category: 'confidentiality',
    });
  }
  
  // Detect non-compete clauses
  if (lowerText.includes('non-compete') || lowerText.includes('non compete') || lowerText.includes('compete with')) {
    clauses.push({
      title: 'Non-Compete Clause',
      content: 'Restrictions on future employment detected.',
      category: 'non-compete',
    });
    
    riskAreas.push({
      severity: 'high',
      title: 'Non-Compete Restrictions',
      description: 'This contract contains clauses that may limit your future employment options.',
      recommendation: 'Review the scope, duration, and geographic limitations carefully.',
    });
  }
  
  // Detect benefits
  if (lowerText.includes('benefit') || lowerText.includes('insurance') || lowerText.includes('vacation') || lowerText.includes('401k')) {
    clauses.push({
      title: 'Benefits Package',
      content: 'Employee benefits and perks mentioned.',
      category: 'benefits',
    });
  }
  
  // Add a general note if minimal content detected
  if (clauses.length === 0) {
    clauses.push({
      title: 'General Contract Content',
      content: 'Document uploaded successfully. Review the extracted text below for details.',
      category: 'other',
    });
  }
  
  // Check for potentially concerning language
  if (lowerText.includes('waive') || lowerText.includes('forfeit')) {
    riskAreas.push({
      severity: 'medium',
      title: 'Rights Waiver Language',
      description: 'The contract contains language about waiving certain rights.',
      recommendation: 'Understand exactly what rights you may be giving up.',
    });
  }
  
  if (lowerText.includes('arbitration') && !lowerText.includes('optional arbitration')) {
    riskAreas.push({
      severity: 'low',
      title: 'Mandatory Arbitration',
      description: 'Disputes may require resolution through arbitration rather than court.',
      recommendation: 'Consider the implications of mandatory arbitration clauses.',
    });
  }
  
  return { clauses, riskAreas };
}

export async function processFile(file: File): Promise<ProcessingResult> {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  let text = '';
  let pageCount: number | undefined;
  
  try {
    if (extension === '.pdf' || file.type === 'application/pdf') {
      const result = await extractPdfText(file);
      text = result.text;
      pageCount = result.pageCount;
    } else if (extension === '.docx' || file.type.includes('wordprocessingml')) {
      text = await extractDocxText(file);
    }
    
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const { clauses, riskAreas } = analyzeText(text);
    
    return {
      success: true,
      text,
      fileName: file.name,
      fileType: extension.replace('.', '').toUpperCase(),
      pageCount,
      wordCount,
      clauses,
      riskAreas,
    };
  } catch (error) {
    console.error('File processing error:', error);
    return {
      success: false,
      text: '',
      fileName: file.name,
      fileType: extension.replace('.', '').toUpperCase(),
      wordCount: 0,
      clauses: [],
      riskAreas: [],
    };
  }
}
