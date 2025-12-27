export interface ProcessingResult {
  success: boolean;
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
  wordCount: number;
  clauses: ClauseAnalysis[];
  riskAreas: RiskArea[];
  riskScore: RiskScore;
}

export interface RiskScore {
  score: number; // 0-100, lower is better
  level: 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
}

export interface ClauseAnalysis {
  title: string;
  category: 'compensation' | 'termination' | 'confidentiality' | 'non-compete' | 'benefits' | 'non-solicitation' | 'relocation' | 'dispute-resolution' | 'intellectual-property' | 'probation' | 'overtime' | 'other';
  sentences: string[]; // Actual sentences from the document
  keywords: string[]; // Keywords that matched this clause
  section?: string; // Document section where clause was found
  confidence: 'strong' | 'moderate' | 'weak'; // Match confidence
}

export interface RiskArea {
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
}

export interface DocumentSection {
  title: string;
  startIndex: number;
  endIndex: number;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty. Please select a file with content.',
    };
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
  
  if (!isValidType) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.',
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please upload a smaller file.',
    };
  }

  // Check for very small files (likely corrupted)
  if (file.size < 50) {
    return {
      valid: false,
      error: 'The file appears to be corrupted or incomplete. Please try a different file.',
    };
  }

  return { valid: true };
}

// Normalize and clean extracted text
function normalizeText(text: string): string {
  return text
    // Fix encoding issues
    .replace(/\u0000/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Fix multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Fix multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

// Detect document sections (headings, numbered sections)
function detectSections(text: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = text.split('\n');
  let currentIndex = 0;

  // Patterns for section detection
  const sectionPatterns = [
    /^(article|section|clause|part)\s+(\d+|[ivxlc]+)[\.:]/i,
    /^(\d+)\.\s+[A-Z]/,
    /^([A-Z][A-Z\s]+):?\s*$/,
    /^(\d+\.\d+)\s+[A-Z]/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const pattern of sectionPatterns) {
      if (pattern.test(line) && line.length < 100) {
        sections.push({
          title: line,
          startIndex: currentIndex,
          endIndex: currentIndex + line.length
        });
        break;
      }
    }
    currentIndex += lines[i].length + 1;
  }

  return sections;
}

// Find which section a sentence belongs to
function findSectionForIndex(index: number, sections: DocumentSection[]): string | undefined {
  for (let i = sections.length - 1; i >= 0; i--) {
    if (index >= sections[i].startIndex) {
      return sections[i].title;
    }
  }
  return undefined;
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

// Helper function to segment text into sentences
function segmentSentences(text: string): string[] {
  // Split by common sentence terminators, keeping the terminator
  const rawSentences = text.split(/(?<=[.!?])\s+/);
  
  // Clean up and filter sentences
  return rawSentences
    .map(s => s.trim())
    .filter(s => s.length > 10) // Filter out very short fragments
    .map(s => s.replace(/\s+/g, ' ')); // Normalize whitespace
}

// Helper function to find sentences containing any of the keywords
function findMatchingSentences(sentences: string[], keywords: string[], maxSentences: number = 3): string[] {
  const matches: string[] = [];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    for (const keyword of keywords) {
      if (lowerSentence.includes(keyword.toLowerCase()) && !matches.includes(sentence)) {
        matches.push(sentence);
        break;
      }
    }
    if (matches.length >= maxSentences) break;
  }
  
  return matches;
}

// Helper function to determine confidence based on match count
function getConfidence(matchCount: number): ClauseAnalysis['confidence'] {
  if (matchCount >= 3) return 'strong';
  if (matchCount >= 2) return 'moderate';
  return 'weak';
}

function analyzeText(text: string): { clauses: ClauseAnalysis[]; riskAreas: RiskArea[]; riskScore: RiskScore } {
  const clauses: ClauseAnalysis[] = [];
  const riskAreas: RiskArea[] = [];
  
  const lowerText = text.toLowerCase();
  const sentences = segmentSentences(text);
  
  // Detect compensation clauses
  const compensationKeywords = ['salary', 'compensation', 'wage', 'pay', 'remuneration', 'bonus', 'earnings'];
  if (compensationKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, compensationKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Compensation Clause',
        category: 'compensation',
        sentences: matchedSentences,
        keywords: compensationKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
  }
  
  // Detect termination clauses
  const terminationKeywords = ['termination', 'terminate', 'notice period', 'dismissal', 'end of employment', 'resignation'];
  if (terminationKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, terminationKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Termination Clause',
        category: 'termination',
        sentences: matchedSentences,
        keywords: terminationKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
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
  const confidentialityKeywords = ['confidential', 'non-disclosure', 'nda', 'proprietary', 'trade secret', 'disclose'];
  if (confidentialityKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, confidentialityKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Confidentiality Clause',
        category: 'confidentiality',
        sentences: matchedSentences,
        keywords: confidentialityKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
  }
  
  // Detect non-compete clauses
  const nonCompeteKeywords = ['non-compete', 'non compete', 'compete with', 'competitive business', 'competing'];
  if (nonCompeteKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, nonCompeteKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Non-Compete Clause',
        category: 'non-compete',
        sentences: matchedSentences,
        keywords: nonCompeteKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
    riskAreas.push({
      severity: 'high',
      title: 'Non-Compete Restrictions',
      description: 'This contract contains clauses that may limit your future employment options.',
      recommendation: 'Review the scope, duration, and geographic limitations carefully.',
    });
  }
  
  // Detect benefits clauses
  const benefitsKeywords = ['benefit', 'insurance', 'vacation', '401k', 'pension', 'health plan', 'paid leave'];
  if (benefitsKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, benefitsKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Benefits Clause',
        category: 'benefits',
        sentences: matchedSentences,
        keywords: benefitsKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
  }
  
  // Detect overtime clauses
  const overtimeKeywords = ['overtime', 'extra hours', 'time and a half', 'work hours', 'additional hours', 'working hours'];
  if (overtimeKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, overtimeKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Overtime Clause',
        category: 'overtime',
        sentences: matchedSentences,
        keywords: overtimeKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
    if (lowerText.includes('exempt') || lowerText.includes('no overtime pay') || lowerText.includes('unpaid overtime') || lowerText.includes('salaried exempt')) {
      riskAreas.push({
        severity: 'medium',
        title: 'Overtime Exemption',
        description: 'This contract may classify you as overtime-exempt, limiting extra compensation for additional hours worked.',
        recommendation: 'Verify your exempt status meets legal requirements and understand expected working hours.',
      });
    }
  }
  
  // Detect probation period clauses
  const probationKeywords = ['probation', 'probationary period', 'trial period', 'introductory period', 'evaluation period'];
  if (probationKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, probationKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Probation Period Clause',
        category: 'probation',
        sentences: matchedSentences,
        keywords: probationKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
    if (lowerText.includes('reduced benefits') || lowerText.includes('no benefits during') || lowerText.includes('limited benefits') || lowerText.includes('benefits begin after')) {
      riskAreas.push({
        severity: 'low',
        title: 'Probation Period Benefits',
        description: 'Benefits may be limited or unavailable during the probationary period.',
        recommendation: 'Understand what benefits apply during probation and when full benefits begin.',
      });
    }
    
    if (lowerText.includes('terminate during probation') || lowerText.includes('dismissal during probation') || lowerText.includes('end employment during')) {
      riskAreas.push({
        severity: 'medium',
        title: 'Probation Termination Terms',
        description: 'The contract allows for easier termination during the probationary period.',
        recommendation: 'Review what protections, if any, apply during your probation period.',
      });
    }
  }
  
  // Detect intellectual property clauses
  const ipKeywords = ['intellectual property', 'invention', 'work product', 'copyright', 'patent', 'trade secret', 'ip rights'];
  if (ipKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, ipKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Intellectual Property Clause',
        category: 'intellectual-property',
        sentences: matchedSentences,
        keywords: ipKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
    if (lowerText.includes('all inventions') || lowerText.includes('employer owns') || lowerText.includes('assign all rights') || lowerText.includes('work for hire') || lowerText.includes('company property')) {
      riskAreas.push({
        severity: 'high',
        title: 'Broad IP Assignment',
        description: 'This contract may require assignment of all intellectual property rights, potentially including personal projects created outside work hours.',
        recommendation: 'Clarify scope of IP assignment and negotiate carve-outs for personal projects if needed.',
      });
    }
    
    if (lowerText.includes('prior invention') || lowerText.includes('existing invention') || lowerText.includes('invention disclosure')) {
      riskAreas.push({
        severity: 'low',
        title: 'Prior Inventions Disclosure',
        description: 'You may need to disclose existing inventions to exclude them from the IP assignment.',
        recommendation: 'List all prior inventions you wish to retain rights to before signing.',
      });
    }
  }
  
  // Detect non-solicitation clauses
  const nonSolicitKeywords = ['non-solicitation', 'non solicitation', 'solicit employees', 'solicit clients', 'solicit customers', 'recruit employees', 'poach'];
  if (nonSolicitKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, nonSolicitKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Non-Solicitation Clause',
        category: 'non-solicitation',
        sentences: matchedSentences,
        keywords: nonSolicitKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
    if (lowerText.includes('permanent') || lowerText.includes('indefinite') || lowerText.includes('forever')) {
      riskAreas.push({
        severity: 'high',
        title: 'Indefinite Non-Solicitation',
        description: 'The non-solicitation restrictions may have no time limit, potentially affecting your future career indefinitely.',
        recommendation: 'Negotiate a reasonable time limit (typically 1-2 years) for non-solicitation obligations.',
      });
    } else {
      riskAreas.push({
        severity: 'medium',
        title: 'Non-Solicitation Restrictions',
        description: 'This contract limits your ability to contact former colleagues, clients, or customers after leaving.',
        recommendation: 'Understand which relationships are covered and for how long these restrictions apply.',
      });
    }
  }
  
  // Detect relocation requirements
  const relocationKeywords = ['relocation', 'relocate', 'transfer to another', 'reassignment', 'work location', 'geographic mobility', 'move to another'];
  if (relocationKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, relocationKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Relocation Clause',
        category: 'relocation',
        sentences: matchedSentences,
        keywords: relocationKeywords,
        confidence: getConfidence(matchedSentences.length),
      });
    }
    
    if (lowerText.includes('required to relocate') || lowerText.includes('must relocate') || lowerText.includes('mandatory relocation') || lowerText.includes('obligation to relocate')) {
      riskAreas.push({
        severity: 'high',
        title: 'Mandatory Relocation',
        description: "This contract may require you to relocate to a different location at the employer's request.",
        recommendation: 'Clarify relocation terms, notice periods, and what happens if you decline a relocation request.',
      });
    }
    
    if (lowerText.includes('relocation assistance') || lowerText.includes('relocation package') || lowerText.includes('moving expenses') || lowerText.includes('relocation reimbursement')) {
      if (lowerText.includes('repay') || lowerText.includes('reimburse') || lowerText.includes('clawback') || lowerText.includes('pay back') || lowerText.includes('return the')) {
        riskAreas.push({
          severity: 'medium',
          title: 'Relocation Clawback',
          description: 'Relocation assistance may need to be repaid if you leave the company within a certain timeframe.',
          recommendation: 'Understand the repayment terms, timeframes, and amounts you could owe if you leave early.',
        });
      }
    }
  }
  
  // Detect dispute resolution clauses
  const disputeKeywords = ['arbitration', 'dispute resolution', 'mediation', 'litigation', 'jurisdiction', 'governing law', 'legal proceedings'];
  if (disputeKeywords.some(kw => lowerText.includes(kw))) {
    const matchedSentences = findMatchingSentences(sentences, disputeKeywords);
    if (matchedSentences.length > 0) {
      clauses.push({
        title: 'Dispute Resolution Clause',
        category: 'dispute-resolution',
        sentences: matchedSentences,
        keywords: disputeKeywords,
        confidence: getConfidence(matchedSentences.length),
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
  }
  
  // Add a general note if no clauses detected
  if (clauses.length === 0) {
    clauses.push({
      title: 'General Contract Content',
      category: 'other',
      sentences: ['Document uploaded successfully. No specific clause patterns were detected. Please review the extracted text below for details.'],
      keywords: [],
      confidence: 'weak',
    });
  }
  
  // Check for potentially concerning language (rights waiver)
  const waiverKeywords = ['waive', 'forfeit', 'relinquish', 'give up rights'];
  if (waiverKeywords.some(kw => lowerText.includes(kw))) {
    riskAreas.push({
      severity: 'medium',
      title: 'Rights Waiver Language',
      description: 'The contract contains language about waiving certain rights.',
      recommendation: 'Understand exactly what rights you may be giving up.',
    });
  }
  
  // Detect custom clauses
  try {
    const customClausesJson = typeof window !== 'undefined' ? localStorage.getItem('contract-clarity-custom-clauses') : null;
    if (customClausesJson) {
      const customClauses = JSON.parse(customClausesJson);
      for (const customClause of customClauses) {
        const matchedSentences = findMatchingSentences(sentences, customClause.keywords, 3);
        if (matchedSentences.length > 0) {
          clauses.push({
            title: customClause.name,
            category: 'other',
            sentences: matchedSentences,
            keywords: customClause.keywords,
            confidence: getConfidence(matchedSentences.length),
          });
          
          // Add risk area if custom clause has high risk level
          if (customClause.riskLevel === 'high') {
            riskAreas.push({
              severity: 'high',
              title: `${customClause.name} - Custom Clause`,
              description: customClause.description || 'Custom clause detected in contract.',
              recommendation: 'Review this custom clause carefully against your industry standards and requirements.',
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing custom clauses:', error);
  }
  
  // Calculate risk score
  const riskScore = calculateRiskScore(riskAreas);
  
  return { clauses, riskAreas, riskScore };
}

function calculateRiskScore(riskAreas: RiskArea[]): RiskScore {
  // Weight by severity: high = 25, medium = 15, low = 5
  let totalPoints = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  
  for (const risk of riskAreas) {
    if (risk.severity === 'high') {
      totalPoints += 25;
      highCount++;
    } else if (risk.severity === 'medium') {
      totalPoints += 15;
      mediumCount++;
    } else {
      totalPoints += 5;
      lowCount++;
    }
  }
  
  // Cap the score at 100
  const score = Math.min(100, totalPoints);
  
  // Determine level
  let level: RiskScore['level'];
  if (score >= 70 || highCount >= 3) {
    level = 'critical';
  } else if (score >= 45 || highCount >= 2) {
    level = 'high';
  } else if (score >= 20 || highCount >= 1 || mediumCount >= 2) {
    level = 'moderate';
  } else {
    level = 'low';
  }
  
  // Generate summary
  let summary: string;
  if (level === 'critical') {
    summary = `This contract contains ${highCount} high-severity concern${highCount !== 1 ? 's' : ''} that require careful review before signing. Consider consulting with a legal professional.`;
  } else if (level === 'high') {
    summary = `This contract has significant risk areas that warrant attention. Review the ${riskAreas.length} identified concern${riskAreas.length !== 1 ? 's' : ''} carefully.`;
  } else if (level === 'moderate') {
    summary = `This contract has some areas worth reviewing. The ${riskAreas.length} identified item${riskAreas.length !== 1 ? 's' : ''} are common but should be understood.`;
  } else if (riskAreas.length === 0) {
    summary = 'No significant risk areas were detected. This appears to be a standard contract with typical terms.';
  } else {
    summary = `This contract appears relatively straightforward with ${riskAreas.length} minor consideration${riskAreas.length !== 1 ? 's' : ''}.`;
  }
  
  return { score, level, summary };
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
    const { clauses, riskAreas, riskScore } = analyzeText(text);
    
    return {
      success: true,
      text,
      fileName: file.name,
      fileType: extension.replace('.', '').toUpperCase(),
      pageCount,
      wordCount,
      clauses,
      riskAreas,
      riskScore,
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
      riskScore: { score: 0, level: 'low', summary: 'Unable to analyze document.' },
    };
  }
}
