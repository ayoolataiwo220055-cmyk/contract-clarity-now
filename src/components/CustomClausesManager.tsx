import { useState } from "react";
import { Plus, Trash2, Edit2, Download, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CustomClause,
  getCustomClauses,
  addCustomClause,
  updateCustomClause,
  deleteCustomClause,
  exportCustomClauses,
  importCustomClauses,
} from "@/lib/customClausesManager";
import { cn } from "@/lib/utils";

export const CustomClausesManager = () => {
  const [clauses, setClauses] = useState<CustomClause[]>(getCustomClauses());
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    description: string;
    keywords: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>({
    name: '',
    category: '',
    description: '',
    keywords: '',
    riskLevel: 'medium',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      keywords: '',
      riskLevel: 'medium',
    });
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!formData.name || !formData.keywords) {
      alert('Please fill in clause name and keywords');
      return;
    }

    const keywords = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      alert('Please add at least one keyword');
      return;
    }

    if (editingId) {
      updateCustomClause(editingId, {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        keywords,
        riskLevel: formData.riskLevel,
      });
    } else {
      const riskLevel: 'low' | 'medium' | 'high' = formData.riskLevel;
      addCustomClause({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        keywords,
        riskLevel,
      });
    }

    setClauses(getCustomClauses());
    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (clause: CustomClause) => {
    setFormData({
      name: clause.name,
      category: clause.category,
      description: clause.description,
      keywords: clause.keywords.join(', '),
      riskLevel: clause.riskLevel || 'medium',
    });
    setEditingId(clause.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this custom clause?')) {
      deleteCustomClause(id);
      setClauses(getCustomClauses());
    }
  };

  const handleExport = () => {
    const json = exportCustomClauses();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', 'contract-clarity-custom-clauses.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const result = importCustomClauses(event.target?.result as string);
          if (result.success) {
            setClauses(getCustomClauses());
            setImportMessage({ type: 'success', text: `Successfully imported ${result.count} clause(s)` });
          } else {
            setImportMessage({ type: 'error', text: result.error || 'Import failed' });
          }
          setTimeout(() => setImportMessage(null), 5000);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const riskLevelColor = (level?: string) => {
    switch (level) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground leading-tight">Custom Clauses Library</h2>
          <p className="text-base text-muted-foreground mt-2 max-w-xl">
            Create and manage industry-specific contract clauses tailored to your needs
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="outline" size="sm" onClick={handleImport} className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={clauses.length === 0} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="border-t border-border mt-4" />

      {/* Import Message */}
      {importMessage && (
        <Alert className={importMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-destructive/10 border-destructive/20'}>
          <div className="flex items-center gap-2">
            {importMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription>{importMessage.text}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Add New Clause Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 px-4 py-2">
            <Plus className="h-4 w-4" />
            Add Custom Clause
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Custom Clause' : 'Add New Custom Clause'}</DialogTitle>
            <DialogDescription>
              Define keywords and details for a custom contract clause that will be detected in your documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Clause Name *</label>
              <Input
                placeholder="e.g., Remote Work Policy, Equity Vesting"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Input
                placeholder="e.g., Work Arrangement, Compensation"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Keywords (comma-separated) *</label>
              <Textarea
                placeholder="e.g., remote work, work from home, flexible location"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="mt-1 resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">These keywords will be searched for in contracts</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                placeholder="Describe what this clause covers and why it matters"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full mt-1 px-3 py-2 border rounded-md border-input bg-background text-foreground"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { resetForm(); setIsOpen(false); }}>
                Cancel
              </Button>
              <Button onClick={handleAddOrUpdate}>
                {editingId ? 'Update Clause' : 'Add Clause'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clauses List */}
      {clauses.length === 0 ? (
        <Alert className="p-4 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No custom clauses yet. Create one to start building your personal clause library that will be detected in contracts you analyze.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {clauses.map((clause) => (
            <div
              key={clause.id}
              className="p-6 border rounded-lg bg-card hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{clause.name}</h3>
                    {clause.riskLevel && (
                      <Badge className={riskLevelColor(clause.riskLevel)}>
                        {clause.riskLevel} Risk
                      </Badge>
                    )}
                  </div>
                  {clause.category && (
                    <p className="text-xs text-muted-foreground mb-2">Category: {clause.category}</p>
                  )}
                  {clause.description && (
                    <p className="text-sm text-foreground mb-3">{clause.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {clause.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(clause)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(clause.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Alert className="p-4 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Custom clauses are stored locally in your browser. Export your library to back it up or share it with team members.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CustomClausesManager;
