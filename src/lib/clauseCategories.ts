import { ClauseAnalysis } from './fileProcessor';

// Clause category groups for organized display
export interface ClauseGroup {
  id: string;
  title: string;
  description: string;
  categories: ClauseAnalysis['category'][];
  icon: string;
}

export const clauseGroups: ClauseGroup[] = [
  {
    id: 'employment-terms',
    title: 'Employment Terms',
    description: 'Core terms defining the employment relationship',
    categories: ['compensation', 'benefits', 'overtime', 'probation'],
    icon: 'Briefcase',
  },
  {
    id: 'employee-obligations',
    title: 'Employee Obligations',
    description: 'Requirements and restrictions placed on the employee',
    categories: ['confidentiality', 'non-compete', 'non-solicitation', 'intellectual-property'],
    icon: 'UserCheck',
  },
  {
    id: 'employer-rights',
    title: 'Employer Rights',
    description: 'Powers and authorities retained by the employer',
    categories: ['termination', 'relocation'],
    icon: 'Building',
  },
  {
    id: 'legal-compliance',
    title: 'Legal & Compliance',
    description: 'Legal framework and dispute handling',
    categories: ['dispute-resolution', 'other'],
    icon: 'Scale',
  },
];

// Group clauses by category group
export function groupClausesByCategory(clauses: ClauseAnalysis[]): Map<ClauseGroup, ClauseAnalysis[]> {
  const grouped = new Map<ClauseGroup, ClauseAnalysis[]>();
  
  for (const group of clauseGroups) {
    const matchingClauses = clauses.filter(c => group.categories.includes(c.category));
    if (matchingClauses.length > 0) {
      grouped.set(group, matchingClauses);
    }
  }
  
  return grouped;
}

// Contract type detection (rule-based)
export type ContractType = 'full-time' | 'part-time' | 'internship' | 'consultancy' | 'freelance' | 'unknown';

export interface ContractTypeResult {
  type: ContractType;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
}

export function detectContractType(text: string): ContractTypeResult {
  const lowerText = text.toLowerCase();
  const indicators: string[] = [];
  let type: ContractType = 'unknown';
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  // Full-time indicators
  const fullTimeKeywords = ['full-time', 'full time', 'permanent position', 'permanent employment', 'regular employee', 'salaried position'];
  const fullTimeMatches = fullTimeKeywords.filter(kw => lowerText.includes(kw));
  
  // Part-time indicators
  const partTimeKeywords = ['part-time', 'part time', 'hours per week', 'reduced hours'];
  const partTimeMatches = partTimeKeywords.filter(kw => lowerText.includes(kw));
  
  // Internship indicators
  const internKeywords = ['intern', 'internship', 'trainee', 'training program', 'student position', 'apprentice'];
  const internMatches = internKeywords.filter(kw => lowerText.includes(kw));
  
  // Consultancy indicators
  const consultancyKeywords = ['consultant', 'consultancy', 'advisory services', 'consulting agreement', 'independent contractor', 'contractor agreement'];
  const consultancyMatches = consultancyKeywords.filter(kw => lowerText.includes(kw));
  
  // Freelance indicators
  const freelanceKeywords = ['freelance', 'freelancer', 'self-employed', 'project-based', 'gig', 'per project'];
  const freelanceMatches = freelanceKeywords.filter(kw => lowerText.includes(kw));
  
  // Determine type based on matches
  const matchCounts = [
    { type: 'full-time' as ContractType, count: fullTimeMatches.length, matches: fullTimeMatches },
    { type: 'part-time' as ContractType, count: partTimeMatches.length, matches: partTimeMatches },
    { type: 'internship' as ContractType, count: internMatches.length, matches: internMatches },
    { type: 'consultancy' as ContractType, count: consultancyMatches.length, matches: consultancyMatches },
    { type: 'freelance' as ContractType, count: freelanceMatches.length, matches: freelanceMatches },
  ];
  
  // Sort by count descending
  matchCounts.sort((a, b) => b.count - a.count);
  
  if (matchCounts[0].count > 0) {
    type = matchCounts[0].type;
    indicators.push(...matchCounts[0].matches);
    
    if (matchCounts[0].count >= 3) {
      confidence = 'high';
    } else if (matchCounts[0].count >= 2) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  }
  
  return { type, confidence, indicators };
}

// "Why This Clause Matters" explanations
export const clauseImportance: Record<ClauseAnalysis['category'], { matters: string; impact: string }> = {
  compensation: {
    matters: 'Defines your total earning potential including base pay, bonuses, and incentives.',
    impact: 'Directly affects your financial security and should align with market rates for your role.',
  },
  termination: {
    matters: 'Outlines how and when your employment can end, including notice requirements.',
    impact: 'Affects your job security and transition planning if employment ends unexpectedly.',
  },
  confidentiality: {
    matters: 'Protects company information but also limits what you can share after leaving.',
    impact: 'May affect your ability to discuss work experience or use knowledge at future jobs.',
  },
  'non-compete': {
    matters: 'Restricts your ability to work for competitors or start a competing business.',
    impact: 'Can significantly limit career options after leaving, especially in specialized fields.',
  },
  benefits: {
    matters: 'Covers health insurance, retirement plans, paid time off, and other perks.',
    impact: 'Represents a significant portion of total compensation beyond just salary.',
  },
  'non-solicitation': {
    matters: 'Prevents you from recruiting former colleagues or approaching clients.',
    impact: 'Limits professional networking and business development after departure.',
  },
  relocation: {
    matters: 'May require you to move to different locations at employer request.',
    impact: 'Affects lifestyle, family considerations, and geographic flexibility.',
  },
  'dispute-resolution': {
    matters: 'Determines how legal disagreements will be handled.',
    impact: 'Arbitration clauses may limit your legal options compared to court proceedings.',
  },
  'intellectual-property': {
    matters: 'Defines ownership of work you create during employment.',
    impact: 'May affect side projects or inventions created outside work hours.',
  },
  probation: {
    matters: 'Sets an evaluation period with potentially different terms.',
    impact: 'May have reduced benefits or easier termination during this initial period.',
  },
  overtime: {
    matters: 'Defines compensation for hours worked beyond standard schedule.',
    impact: 'Exempt status can significantly reduce earnings for additional work hours.',
  },
  other: {
    matters: 'Contains additional terms specific to this agreement.',
    impact: 'Review carefully as these may contain unique conditions.',
  },
};

export function getContractTypeLabel(type: ContractType): string {
  switch (type) {
    case 'full-time': return 'Full-Time Employment';
    case 'part-time': return 'Part-Time Employment';
    case 'internship': return 'Internship Agreement';
    case 'consultancy': return 'Consultancy Contract';
    case 'freelance': return 'Freelance Agreement';
    default: return 'Employment Contract';
  }
}

export function getContractTypeDescription(type: ContractType): string {
  switch (type) {
    case 'full-time': return 'A standard employment agreement for permanent, full-time positions with regular hours and full benefits.';
    case 'part-time': return 'An employment agreement for positions with reduced hours, typically with prorated benefits.';
    case 'internship': return 'A training-focused agreement, often temporary, designed for students or early-career professionals.';
    case 'consultancy': return 'An independent contractor agreement for professional services, typically project-based.';
    case 'freelance': return 'A flexible work arrangement for independent service providers on a per-project basis.';
    default: return 'Unable to determine the specific contract type. Review the terms carefully.';
  }
}
