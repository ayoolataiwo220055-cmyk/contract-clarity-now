// Custom clause type definition
export interface CustomClause {
  id: string;
  name: string;
  keywords: string[]; // Keywords to match this clause
  category: string;
  description: string;
  riskLevel?: 'low' | 'medium' | 'high';
  createdAt: number;
}

const STORAGE_KEY = 'contract-clarity-custom-clauses';

// Get all custom clauses from localStorage
export function getCustomClauses(): CustomClause[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading custom clauses:', error);
    return [];
  }
}

// Add a new custom clause
export function addCustomClause(clause: Omit<CustomClause, 'id' | 'createdAt'>): CustomClause {
  const newClause: CustomClause = {
    ...clause,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  const clauses = getCustomClauses();
  clauses.push(newClause);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clauses));
  return newClause;
}

// Update an existing custom clause
export function updateCustomClause(id: string, updates: Partial<Omit<CustomClause, 'id' | 'createdAt'>>): CustomClause | null {
  const clauses = getCustomClauses();
  const index = clauses.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updated = { ...clauses[index], ...updates };
  clauses[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clauses));
  return updated;
}

// Delete a custom clause
export function deleteCustomClause(id: string): boolean {
  const clauses = getCustomClauses();
  const filtered = clauses.filter(c => c.id !== id);
  
  if (filtered.length === clauses.length) return false; // Not found
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Export custom clauses as JSON
export function exportCustomClauses(): string {
  const clauses = getCustomClauses();
  return JSON.stringify(clauses, null, 2);
}

// Import custom clauses from JSON
export function importCustomClauses(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array of clauses' };
    }
    
    const clauses = getCustomClauses();
    let importedCount = 0;
    
    for (const item of imported) {
      if (item.name && Array.isArray(item.keywords)) {
        const newClause: CustomClause = {
          id: Date.now().toString() + Math.random(),
          name: item.name,
          keywords: item.keywords,
          category: item.category || 'custom',
          description: item.description || '',
          riskLevel: item.riskLevel || 'medium',
          createdAt: Date.now(),
        };
        clauses.push(newClause);
        importedCount++;
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clauses));
    return { success: true, count: importedCount };
  } catch (error) {
    return { success: false, count: 0, error: 'Failed to parse JSON' };
  }
}

// Clear all custom clauses
export function clearAllCustomClauses(): boolean {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return true;
}
