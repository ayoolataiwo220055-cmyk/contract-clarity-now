export interface ContractDate {
  id: string;
  date: Date;
  type: 'probation-end' | 'notice-period' | 'renewal' | 'start' | 'vesting' | 'review' | 'other';
  title: string;
  description: string;
  context: string; // The sentence/text where it wlas found
  daysUntil?: number;
  hasReminder: boolean;
  reminderDate?: Date;
}

// Patterns to detect different date types and formats
const datePatterns = [
  // Probation period patterns
  {
    regex: /probation(?:ary)?\s+period\s+(?:of\s+)?(\d+)\s+(days?|weeks?|months?)/gi,
    type: 'probation-end' as const,
    title: (match: string) => 'Probation Period End',
    extractDuration: true,
  },
  // Notice period patterns
  {
    regex: /notice\s+period\s+(?:of\s+)?(\d+)\s+(days?|weeks?|months?)/gi,
    type: 'notice-period' as const,
    title: (match: string) => 'Notice Period',
    extractDuration: true,
  },
  // Contract renewal patterns
  {
    regex: /(?:contract|agreement)\s+renewal\s+(?:on|date|of)?\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|[A-Za-z]+\s+\d{1,2}|January|February|March|April|May|June|July|August|September|October|November|December)/gi,
    type: 'renewal' as const,
    title: (match: string) => 'Contract Renewal Date',
    extractDuration: false,
  },
  // Review/Performance review patterns
  {
    regex: /(?:annual|quarterly|six-month)\s+(?:performance\s+)?review\s+(?:on|date|of)?\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
    type: 'review' as const,
    title: (match: string) => 'Performance Review Date',
    extractDuration: false,
  },
  // Vesting schedule patterns
  {
    regex: /(?:vesting|stock\s+options?)\s+(?:schedule|date|vests?\s+on)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|after\s+(\d+)\s+(years?|months?))/gi,
    type: 'vesting' as const,
    title: (match: string) => 'Vesting Schedule Date',
    extractDuration: true,
  },
  // Generic date patterns (YYYY-MM-DD, MM/DD/YYYY, Month Day, Year)
  {
    regex: /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/gi,
    type: 'other' as const,
    title: (match: string) => 'Important Date',
    extractDuration: false,
  },
];

function parseDate(dateStr: string): Date | null {
  const trimmed = dateStr.trim();

  // Handle YYYY-MM-DD format
  const isoMatch = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  // Handle MM/DD/YYYY format
  const slashMatch = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    return new Date(parseInt(slashMatch[3]), parseInt(slashMatch[1]) - 1, parseInt(slashMatch[2]));
  }

  // Handle Month Day, Year format
  const monthMatch = trimmed.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i);
  if (monthMatch) {
    return new Date(monthMatch[0]);
  }

  return null;
}

function calculateDurationDate(durationStr: string, fromDate: Date = new Date()): Date {
  const match = durationStr.match(/(\d+)\s+(days?|weeks?|months?|years?)/i);
  if (!match) return fromDate;

  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const result = new Date(fromDate);

  if (unit.startsWith('day')) {
    result.setDate(result.getDate() + amount);
  } else if (unit.startsWith('week')) {
    result.setDate(result.getDate() + amount * 7);
  } else if (unit.startsWith('month')) {
    result.setMonth(result.getMonth() + amount);
  } else if (unit.startsWith('year')) {
    result.setFullYear(result.getFullYear() + amount);
  }

  return result;
}

export function extractDatesFromText(text: string): ContractDate[] {
  const dates: ContractDate[] = [];
  const seen = new Set<string>();

  const sentences = text.split(/[.!?]\s+/);

  for (const sentence of sentences) {
    for (const pattern of datePatterns) {
      let match;
      const regex = new RegExp(pattern.regex);

      while ((match = regex.exec(sentence)) !== null) {
        let extractedDate: Date | null = null;

        if (pattern.extractDuration && match[1] && match[2]) {
          // Extract duration and calculate end date
          const durationStr = `${match[1]} ${match[2]}`;
          extractedDate = calculateDurationDate(durationStr);
        } else if (match[1]) {
          // Try to parse the captured date string
          extractedDate = parseDate(match[1]);
        }

        if (extractedDate && extractedDate > new Date()) {
          const dateKey = extractedDate.toISOString();
          if (!seen.has(dateKey)) {
            seen.add(dateKey);

            const daysUntil = Math.ceil(
              (extractedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            dates.push({
              id: `${pattern.type}-${Date.now()}-${Math.random()}`,
              date: extractedDate,
              type: pattern.type,
              title: pattern.title(match[0]),
              description: sentence.trim().slice(0, 150),
              context: sentence.trim(),
              daysUntil,
              hasReminder: false,
            });
          }
        }
      }
    }
  }

  return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const DATES_STORAGE_KEY = 'contract-clarity-saved-dates';

export function getSavedDates(): ContractDate[] {
  try {
    const stored = localStorage.getItem(DATES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Array<Record<string, unknown>>;
    return parsed.map((d: Record<string, unknown>) => ({
      ...d,
      date: new Date(d.date as string),
      reminderDate: d.reminderDate ? new Date(d.reminderDate as string) : undefined,
    } as ContractDate));
  } catch (error) {
    console.error('Error reading saved dates:', error);
    return [];
  }
}

export function saveDates(dates: ContractDate[]): void {
  localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(dates));
}

export function addReminder(dateId: string, reminderDate: Date): void {
  const dates = getSavedDates();
  const date = dates.find(d => d.id === dateId);
  if (date) {
    date.hasReminder = true;
    date.reminderDate = reminderDate;
    saveDates(dates);
  }
}

export function removeReminder(dateId: string): void {
  const dates = getSavedDates();
  const date = dates.find(d => d.id === dateId);
  if (date) {
    date.hasReminder = false;
    date.reminderDate = undefined;
    saveDates(dates);
  }
}

export function checkReminders(): ContractDate[] {
  const dates = getSavedDates();
  const now = new Date();
  return dates.filter(d => d.hasReminder && d.reminderDate && d.reminderDate <= now);
}

export function exportDatesToCalendar(dates: ContractDate[]): string {
  // Generate iCalendar format (.ics)
  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Contract Clarity//Contract Dates//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Contract Dates
X-WR-TIMEZONE:UTC
`;

  for (const date of dates) {
    const dtstart = date.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    ics += `BEGIN:VEVENT
DTSTART:${dtstart}
DTSTAMP:${dtstamp}
SUMMARY:${date.title}
DESCRIPTION:${date.description}
UID:${date.id}@contractclarity.com
END:VEVENT
`;
  }

  ics += 'END:VCALENDAR';
  return ics;
}

export function downloadCalendarFile(dates: ContractDate[]): void {
  const ics = exportDatesToCalendar(dates);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics));
  element.setAttribute('download', 'contract-dates.ics');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
