export interface LegalTerm {
  term: string;
  definition: string;
  category: 'employment' | 'contract' | 'rights' | 'termination' | 'compensation' | 'compliance' | 'dispute' | 'general';
  relatedTerms?: string[];
  example?: string;
}

export const LEGAL_GLOSSARY: Record<string, LegalTerm> = {
  // Employment Terms
  'at-will employment': {
    term: 'At-Will Employment',
    definition: 'Employment that can be terminated by either the employer or employee at any time, for any reason (except illegal reasons), without notice or cause.',
    category: 'employment',
    example: 'In an at-will employment arrangement, either party can end the employment relationship without providing a reason.',
    relatedTerms: ['termination', 'notice period'],
  },
  'probation': {
    term: 'Probation',
    definition: 'An initial trial period during which a new employee\'s performance is evaluated. During this period, employment may be terminated more easily.',
    category: 'employment',
    example: 'The employee will be on a 90-day probation period, during which performance will be reviewed.',
    relatedTerms: ['termination', 'probationary period'],
  },
  'probationary period': {
    term: 'Probationary Period',
    definition: 'The introductory period following hire during which an employee can be evaluated and dismissed more readily than permanent staff.',
    category: 'employment',
    example: 'The probationary period lasts for 6 months from the date of employment.',
    relatedTerms: ['probation', 'at-will employment'],
  },
  'exempt employee': {
    term: 'Exempt Employee',
    definition: 'An employee who is exempt from overtime pay requirements under the Fair Labor Standards Act (FLSA), typically due to job duties and salary level.',
    category: 'compensation',
    example: 'As an exempt employee, you are not eligible for overtime compensation.',
    relatedTerms: ['non-exempt', 'overtime', 'FLSA'],
  },
  'non-exempt employee': {
    term: 'Non-Exempt Employee',
    definition: 'An employee who is eligible for overtime pay and other protections under the Fair Labor Standards Act (FLSA).',
    category: 'compensation',
    example: 'Non-exempt employees must receive overtime pay for hours worked beyond 40 per week.',
    relatedTerms: ['exempt employee', 'overtime', 'FLSA'],
  },

  // Contract Terms
  'consideration': {
    term: 'Consideration',
    definition: 'Something of value exchanged between parties in a contract. Both parties must provide consideration for a contract to be binding.',
    category: 'contract',
    example: 'In an employment contract, the employer provides salary (consideration) and the employee provides work (consideration).',
    relatedTerms: ['contract', 'binding'],
  },
  'binding': {
    term: 'Binding',
    definition: 'Legally enforceable; an agreement that all parties are legally obligated to follow.',
    category: 'contract',
    example: 'Once both parties sign, the contract becomes binding.',
    relatedTerms: ['enforceable', 'contract'],
  },
  'enforceable': {
    term: 'Enforceable',
    definition: 'Able to be enforced or carried out by law; a court can compel compliance.',
    category: 'contract',
    example: 'The non-compete clause is enforceable if it meets statutory requirements.',
    relatedTerms: ['binding', 'legal'],
  },
  'clause': {
    term: 'Clause',
    definition: 'A specific section or provision within a contract that addresses a particular aspect of the agreement.',
    category: 'contract',
    example: 'The confidentiality clause prohibits disclosure of proprietary information.',
    relatedTerms: ['provision', 'contract'],
  },
  'provision': {
    term: 'Provision',
    definition: 'A clause or condition in a legal agreement; a specific requirement or statement in a contract.',
    category: 'contract',
    example: 'The contract includes a provision requiring 30 days\' written notice for termination.',
    relatedTerms: ['clause', 'agreement'],
  },

  // Rights & Restrictions
  'non-compete': {
    term: 'Non-Compete Clause',
    definition: 'A contractual agreement restricting an employee from working for competitors or starting a competing business for a specified period and geographic area after leaving employment.',
    category: 'rights',
    example: 'The non-compete clause prevents you from working for any competing company for 2 years within a 50-mile radius.',
    relatedTerms: ['non-solicitation', 'confidentiality', 'restrictive covenant'],
  },
  'non-solicitation': {
    term: 'Non-Solicitation Clause',
    definition: 'A contractual provision preventing an employee from recruiting or hiring colleagues or soliciting clients/customers after leaving the company.',
    category: 'rights',
    example: 'The non-solicitation agreement prohibits contacting company clients for 1 year after termination.',
    relatedTerms: ['non-compete', 'restrictive covenant'],
  },
  'confidentiality': {
    term: 'Confidentiality Clause',
    definition: 'A contractual provision requiring employees to keep sensitive company information, trade secrets, and proprietary data confidential, both during and after employment.',
    category: 'rights',
    example: 'The confidentiality clause requires you to protect all proprietary information you access during employment.',
    relatedTerms: ['trade secret', 'NDA', 'non-disclosure'],
  },
  'nda': {
    term: 'NDA (Non-Disclosure Agreement)',
    definition: 'A legal contract binding one or more parties to keep specified information confidential and not disclose it to third parties.',
    category: 'rights',
    example: 'You must sign an NDA before accessing the company\'s proprietary technology.',
    relatedTerms: ['confidentiality', 'trade secret', 'proprietary'],
  },
  'trade secret': {
    term: 'Trade Secret',
    definition: 'Confidential business information that provides a competitive advantage and is not generally known, such as formulas, processes, or client lists.',
    category: 'rights',
    example: 'The company\'s software code is considered a trade secret and must be protected.',
    relatedTerms: ['confidentiality', 'proprietary', 'intellectual property'],
  },
  'intellectual property': {
    term: 'Intellectual Property',
    definition: 'Legal rights to creations of the mind, including inventions, designs, trademarks, copyrights, and trade secrets.',
    category: 'rights',
    example: 'The contract assigns all intellectual property created during employment to the company.',
    relatedTerms: ['patent', 'copyright', 'trademark', 'trade secret'],
  },
  'work product': {
    term: 'Work Product',
    definition: 'Creations, inventions, or work produced by an employee during employment. Ownership may be assigned to the employer depending on contract terms.',
    category: 'rights',
    example: 'All work product created using company resources belongs to the employer.',
    relatedTerms: ['intellectual property', 'invention'],
  },
  'invention': {
    term: 'Invention',
    definition: 'A new creation or discovery, such as a device, process, or design. Employment contracts often specify who owns inventions created by employees.',
    category: 'rights',
    example: 'Inventions created on company time using company resources are owned by the company.',
    relatedTerms: ['patent', 'intellectual property', 'work product'],
  },

  // Termination Terms
  'termination': {
    term: 'Termination',
    definition: 'The end of an employment relationship. Can be voluntary (resignation) or involuntary (dismissal/firing).',
    category: 'termination',
    example: 'Upon termination of employment, you must return all company property.',
    relatedTerms: ['dismissal', 'resignation', 'severance'],
  },
  'dismissal': {
    term: 'Dismissal',
    definition: 'The involuntary termination of employment by an employer; being fired or let go.',
    category: 'termination',
    example: 'The dismissal was for cause due to violation of company policy.',
    relatedTerms: ['termination', 'for cause', 'wrongful termination'],
  },
  'resignation': {
    term: 'Resignation',
    definition: 'Voluntary termination of employment by an employee; an employee chooses to leave their job.',
    category: 'termination',
    example: 'She submitted her resignation effective two weeks from today.',
    relatedTerms: ['termination', 'notice period'],
  },
  'notice period': {
    term: 'Notice Period',
    definition: 'The required amount of time (e.g., 2 weeks, 30 days) that must be given before employment ends, allowing time for transition and replacement.',
    category: 'termination',
    example: 'You must provide a 30-day notice period before leaving employment.',
    relatedTerms: ['termination', 'severance'],
  },
  'for cause': {
    term: 'For Cause',
    definition: 'Termination of employment due to employee misconduct, breach of contract, or poor performance. Usually allows immediate termination without severance.',
    category: 'termination',
    example: 'The employee was terminated for cause due to theft of company property.',
    relatedTerms: ['termination', 'dismissal', 'without cause'],
  },
  'without cause': {
    term: 'Without Cause',
    definition: 'Termination of employment without a specific reason or breach. Often triggers severance obligations.',
    category: 'termination',
    example: 'The company terminated the employee without cause and provided severance pay.',
    relatedTerms: ['termination', 'severance', 'for cause'],
  },
  'severance': {
    term: 'Severance',
    definition: 'Compensation or benefits provided by an employer to an employee upon termination, typically including salary, benefits continuation, or other payments.',
    category: 'termination',
    example: 'The severance package included 3 months of salary and continued health insurance.',
    relatedTerms: ['termination', 'without cause'],
  },

  // Compensation Terms
  'salary': {
    term: 'Salary',
    definition: 'Fixed compensation paid regularly (usually annually, monthly, or bi-weekly) regardless of hours worked, typically for exempt employees.',
    category: 'compensation',
    example: 'Your annual salary is $75,000 payable bi-weekly.',
    relatedTerms: ['wage', 'compensation', 'bonus'],
  },
  'wage': {
    term: 'Wage',
    definition: 'Hourly or periodic compensation for work, typically paid to non-exempt employees. Must meet minimum wage requirements.',
    category: 'compensation',
    example: 'Employees are paid an hourly wage of $20 per hour.',
    relatedTerms: ['salary', 'hourly rate', 'compensation'],
  },
  'bonus': {
    term: 'Bonus',
    definition: 'Additional compensation beyond regular salary or wages, often based on performance, company profits, or achievement of goals.',
    category: 'compensation',
    example: 'Eligible employees receive an annual performance bonus up to 20% of base salary.',
    relatedTerms: ['compensation', 'incentive', 'salary'],
  },
  'overtime': {
    term: 'Overtime',
    definition: 'Compensation for work hours beyond the standard work week (typically 40 hours). Non-exempt employees usually receive overtime pay at 1.5x (time and a half) or 2x the regular rate.',
    category: 'compensation',
    example: 'Overtime is paid at 1.5 times your regular hourly rate for hours worked beyond 40 per week.',
    relatedTerms: ['non-exempt', 'FLSA', 'wage'],
  },
  'vesting': {
    term: 'Vesting',
    definition: 'The process by which an employee earns the right to employer-provided benefits (such as stock options, retirement contributions, or bonuses) over time.',
    category: 'compensation',
    example: 'Your stock options vest over a 4-year period at 25% per year.',
    relatedTerms: ['stock options', 'benefits', '401k'],
  },

  // Dispute & Compliance Terms
  'arbitration': {
    term: 'Arbitration',
    definition: 'A process where disputes are resolved by a neutral third party (arbitrator) rather than in court. Often faster and more private than litigation.',
    category: 'dispute',
    example: 'This contract requires disputes to be resolved through binding arbitration.',
    relatedTerms: ['mediation', 'litigation', 'dispute resolution'],
  },
  'mediation': {
    term: 'Mediation',
    definition: 'A process where a neutral mediator helps both parties resolve disputes cooperatively without going to court.',
    category: 'dispute',
    example: 'Before litigation, the parties must attempt mediation.',
    relatedTerms: ['arbitration', 'dispute resolution', 'litigation'],
  },
  'litigation': {
    term: 'Litigation',
    definition: 'The process of resolving disputes through the court system, involving judges and/or juries.',
    category: 'dispute',
    example: 'If arbitration fails, either party may pursue litigation.',
    relatedTerms: ['arbitration', 'mediation', 'lawsuit'],
  },
  'dispute resolution': {
    term: 'Dispute Resolution',
    definition: 'Methods and processes for resolving disagreements between parties, including negotiation, mediation, arbitration, and litigation.',
    category: 'dispute',
    example: 'The contract outlines a dispute resolution process involving mediation first, then arbitration.',
    relatedTerms: ['arbitration', 'mediation', 'litigation'],
  },
  'governing law': {
    term: 'Governing Law',
    definition: 'The state or jurisdiction\'s laws that will apply to interpret and enforce the contract.',
    category: 'compliance',
    example: 'This contract is governed by the laws of the State of California.',
    relatedTerms: ['jurisdiction', 'legal'],
  },
  'jurisdiction': {
    term: 'Jurisdiction',
    definition: 'The power of a court to hear and decide a case; the geographic area or subject matter over which a court has authority.',
    category: 'compliance',
    example: 'The parties agree to submit to the jurisdiction of the courts in New York.',
    relatedTerms: ['governing law', 'court', 'venue'],
  },

  // General Contract Terms
  'indemnification': {
    term: 'Indemnification',
    definition: 'An agreement to compensate or protect another party against loss, damage, or liability.',
    category: 'general',
    example: 'The employee indemnifies the company against liability arising from their work.',
    relatedTerms: ['liability', 'breach'],
  },
  'liability': {
    term: 'Liability',
    definition: 'Legal responsibility for damages or harm; an obligation to pay compensation for loss or injury.',
    category: 'general',
    example: 'The company assumes liability for workplace injuries.',
    relatedTerms: ['indemnification', 'breach', 'damages'],
  },
  'waiver': {
    term: 'Waiver',
    definition: 'A voluntary relinquishment or surrender of a right, claim, or privilege.',
    category: 'general',
    example: 'By signing, you waive your right to pursue certain legal claims.',
    relatedTerms: ['rights', 'release'],
  },
  'breach': {
    term: 'Breach',
    definition: 'Failure to fulfill the terms and conditions of a contract; a violation of a contractual obligation.',
    category: 'general',
    example: 'Disclosure of confidential information constitutes a breach of the agreement.',
    relatedTerms: ['violation', 'liability', 'damages'],
  },
  'damages': {
    term: 'Damages',
    definition: 'Monetary compensation awarded by a court to compensate for loss, injury, or breach of contract.',
    category: 'general',
    example: 'The court awarded damages in the amount of $50,000 for breach of contract.',
    relatedTerms: ['liability', 'breach', 'compensation'],
  },
  'relocation': {
    term: 'Relocation',
    definition: 'Moving to a different geographic location, often used in employment context to mean transferring to work at a different office location.',
    category: 'employment',
    example: 'The company may require relocation to its headquarters as a condition of employment.',
    relatedTerms: ['transfer', 'mobility'],
  },
  'clawback': {
    term: 'Clawback',
    definition: 'A provision allowing a company to recover compensation (salary, bonus, benefits) previously paid to an employee under certain conditions.',
    category: 'compensation',
    example: 'The relocation clawback provision requires repayment if you leave within 2 years.',
    relatedTerms: ['repayment', 'severance'],
  },
  'amendment': {
    term: 'Amendment',
    definition: 'A formal change or modification to an existing contract or legal document.',
    category: 'contract',
    example: 'The contract was amended to increase the non-compete period from 1 to 2 years.',
    relatedTerms: ['modification', 'agreement'],
  },
  'effective date': {
    term: 'Effective Date',
    definition: 'The date on which a contract begins to take effect and its terms become enforceable.',
    category: 'contract',
    example: 'The employment contract is effective as of January 1, 2025.',
    relatedTerms: ['termination date', 'agreement'],
  },
};

// Get a term definition
export function getTermDefinition(term: string): LegalTerm | undefined {
  const lowerTerm = term.toLowerCase().trim();
  return LEGAL_GLOSSARY[lowerTerm];
}

// Get all terms in a category
export function getTermsByCategory(category: LegalTerm['category']): LegalTerm[] {
  return Object.values(LEGAL_GLOSSARY).filter(term => term.category === category);
}

// Search for terms matching a pattern
export function searchTerms(query: string): LegalTerm[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(LEGAL_GLOSSARY).filter(
    term => 
      term.term.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery) ||
      term.relatedTerms?.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// Get all unique terms for highlighting
export function getAllTerms(): string[] {
  return Object.keys(LEGAL_GLOSSARY).sort();
}
