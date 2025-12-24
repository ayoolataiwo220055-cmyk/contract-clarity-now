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
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
  
  if (!isValidType) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF, DOCX, or TXT file.',
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

// Load PDF.js from CDN
async function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
}

async function extractPdfText(file: File): Promise<{ text: string; pageCount: number }> {
  const pdfjsLib = await loadPdfJs();
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
  // Simple DOCX extraction using JSZip approach
  // DOCX files are ZIP archives containing XML
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    // Load JSZip from CDN if not available
    if (!(window as any).JSZip) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load JSZip'));
        document.head.appendChild(script);
      });
    }
    
    const JSZip = (window as any).JSZip;
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      return 'Unable to extract text from this DOCX file.';
    }
    
    // Parse XML and extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(documentXml, 'application/xml');
    
    // Get all text elements
    const textNodes = doc.getElementsByTagName('w:t');
    let text = '';
    
    for (let i = 0; i < textNodes.length; i++) {
      text += textNodes[i].textContent + ' ';
    }
    
    // Clean up and format
    return text
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return 'Error extracting text from DOCX file. Please try a PDF or TXT file.';
  }
}

async function extractTxtText(file: File): Promise<string> {
  return await file.text();
}

function analyzeText(text: string): { clauses: ClauseAnalysis[]; riskAreas: RiskArea[] } {
  const clauses: ClauseAnalysis[] = [];
  const riskAreas: RiskArea[] = [];
  
  const lowerText = text.toLowerCase();
  
  // Detect compensation clauses
  if (lowerText.includes('salary') || lowerText.includes('compensation') || lowerText.includes('wage') || lowerText.includes('pay')) {
    clauses.push({
      title: 'Compensation Terms',
      content: 'Salary and compensation details detected in document.',
      category: 'compensation',
    });
  }
  
  // Detect termination clauses
  if (lowerText.includes('termination') || lowerText.includes('notice period') || lowerText.includes('dismissal')) {
    clauses.push({
      title: 'Termination Conditions',
      content: 'Employment termination provisions identified.',
      category: 'termination',
    });
    
    if (lowerText.includes('immediate termination') || lowerText.includes('at will') || lowerText.includes('at-will')) {
      riskAreas.push({
        severity: 'medium',
        title: 'At-Will Employment',
        description: 'This contract may allow termination without cause.',
        recommendation: 'Clarify termination conditions and notice requirements.',
      });
    }
  }
  
  // Detect confidentiality clauses
  if (lowerText.includes('confidential') || lowerText.includes('non-disclosure') || lowerText.includes('nda') || lowerText.includes('proprietary')) {
    clauses.push({
      title: 'Confidentiality Agreement',
      content: 'Non-disclosure and confidentiality requirements present.',
      category: 'confidentiality',
    });
  }
  
  // Detect non-compete clauses
  if (lowerText.includes('non-compete') || lowerText.includes('non compete') || lowerText.includes('compete with') || lowerText.includes('competitive business')) {
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
  if (lowerText.includes('benefit') || lowerText.includes('insurance') || lowerText.includes('vacation') || lowerText.includes('401k') || lowerText.includes('pension')) {
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
  if (lowerText.includes('waive') || lowerText.includes('forfeit') || lowerText.includes('relinquish')) {
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
  
  if (lowerText.includes('intellectual property') || lowerText.includes('invention') || lowerText.includes('work product')) {
    clauses.push({
      title: 'Intellectual Property',
      content: 'IP ownership and invention assignment terms detected.',
      category: 'other',
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
    } else if (extension === '.txt' || file.type === 'text/plain') {
      text = await extractTxtText(file);
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
