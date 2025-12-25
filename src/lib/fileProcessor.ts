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
  content: string;
  category: 'compensation' | 'termination' | 'confidentiality' | 'non-compete' | 'benefits' | 'non-solicitation' | 'relocation' | 'other';
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

function analyzeText(text: string): { clauses: ClauseAnalysis[]; riskAreas: RiskArea[]; riskScore: RiskScore } {
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
  
  // Detect overtime clauses
  if (lowerText.includes('overtime') || lowerText.includes('extra hours') || lowerText.includes('time and a half') || lowerText.includes('work hours') || lowerText.includes('additional hours')) {
    clauses.push({
      title: 'Overtime Provisions',
      content: 'Overtime work requirements and compensation terms identified.',
      category: 'other',
    });
    
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
  if (lowerText.includes('probation') || lowerText.includes('probationary period') || lowerText.includes('trial period') || lowerText.includes('introductory period') || lowerText.includes('evaluation period')) {
    clauses.push({
      title: 'Probation Period',
      content: 'Probationary or trial employment period terms detected.',
      category: 'other',
    });
    
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
  if (lowerText.includes('intellectual property') || lowerText.includes('invention') || lowerText.includes('work product') || lowerText.includes('copyright') || lowerText.includes('patent') || lowerText.includes('trade secret')) {
    clauses.push({
      title: 'Intellectual Property Rights',
      content: 'IP ownership, invention assignment, and work product terms detected.',
      category: 'other',
    });
    
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
  if (lowerText.includes('non-solicitation') || lowerText.includes('non solicitation') || lowerText.includes('solicit employees') || lowerText.includes('solicit clients') || lowerText.includes('solicit customers') || lowerText.includes('recruit employees') || lowerText.includes('poach')) {
    clauses.push({
      title: 'Non-Solicitation Clause',
      content: 'Restrictions on soliciting employees, clients, or customers after employment.',
      category: 'non-solicitation',
    });
    
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
  if (lowerText.includes('relocation') || lowerText.includes('relocate') || lowerText.includes('transfer to another') || lowerText.includes('reassignment') || lowerText.includes('work location') || lowerText.includes('geographic mobility') || lowerText.includes('move to another')) {
    clauses.push({
      title: 'Relocation Requirements',
      content: 'Terms related to potential job relocation or geographic mobility detected.',
      category: 'relocation',
    });
    
    if (lowerText.includes('required to relocate') || lowerText.includes('must relocate') || lowerText.includes('mandatory relocation') || lowerText.includes('obligation to relocate')) {
      riskAreas.push({
        severity: 'high',
        title: 'Mandatory Relocation',
        description: 'This contract may require you to relocate to a different location at the employer\'s request.',
        recommendation: 'Clarify relocation terms, notice periods, and what happens if you decline a relocation request.',
      });
    }
    
    if (lowerText.includes('relocation assistance') || lowerText.includes('relocation package') || lowerText.includes('moving expenses') || lowerText.includes('relocation reimbursement')) {
      // Check for clawback provisions
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
