import { useState, useEffect } from "react";
import { Calendar, Bell, Trash2, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ContractDate,
  addReminder,
  removeReminder,
  downloadCalendarFile,
} from "@/lib/dateExtractor";
import { cn } from "@/lib/utils";

interface KeyDatesCalendarProps {
  dates: ContractDate[];
  onDatesChange?: (dates: ContractDate[]) => void;
}

export const KeyDatesCalendar = ({ dates, onDatesChange }: KeyDatesCalendarProps) => {
  const [localDates, setLocalDates] = useState<ContractDate[]>(dates);
  const [selectedDate, setSelectedDate] = useState<ContractDate | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);

  useEffect(() => {
    setLocalDates(dates);
  }, [dates]);

  const handleAddReminder = (dateId: string, daysAhead: number) => {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysAhead);

    addReminder(dateId, reminderDate);

    const updated = localDates.map(d =>
      d.id === dateId ? { ...d, hasReminder: true, reminderDate } : d
    );
    setLocalDates(updated);
    onDatesChange?.(updated);
    setReminderOpen(false);
  };

  const handleRemoveReminder = (dateId: string) => {
    removeReminder(dateId);

    const updated = localDates.map(d =>
      d.id === dateId ? { ...d, hasReminder: false, reminderDate: undefined } : d
    );
    setLocalDates(updated);
    onDatesChange?.(updated);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'probation-end':
        return 'bg-blue-100 text-blue-800';
      case 'notice-period':
        return 'bg-orange-100 text-orange-800';
      case 'renewal':
        return 'bg-purple-100 text-purple-800';
      case 'vesting':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'probation-end':
        return 'Probation';
      case 'notice-period':
        return 'Notice';
      case 'renewal':
        return 'Renewal';
      case 'vesting':
        return 'Vesting';
      case 'review':
        return 'Review';
      default:
        return 'Date';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const isUrgent = (date: ContractDate) => {
    const now = new Date();
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return date.date <= thirtyDaysAhead;
  };

  const upcomingDates = localDates.filter(d => new Date(d.date) > new Date());
  const urgentDates = upcomingDates.filter(isUrgent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-accent" />
          <div>
            <h3 className="text-xl font-semibold text-foreground">Key Dates</h3>
            <p className="text-sm text-muted-foreground">Important dates extracted from your contract</p>
          </div>
        </div>
        {upcomingDates.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCalendarFile(upcomingDates)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Calendar
          </Button>
        )}
      </div>

      {/* Urgent Alert */}
      {urgentDates.length > 0 && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{urgentDates.length}</strong> important date{urgentDates.length !== 1 ? 's' : ''} coming up in the next 30 days!
          </AlertDescription>
        </Alert>
      )}

      {/* No Dates Message */}
      {localDates.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No key dates extracted from this contract. Upload a document with dates to see them here.
          </AlertDescription>
        </Alert>
      )}

      {/* Dates List */}
      {localDates.length > 0 && (
        <div className="space-y-3">
          {localDates.map((date) => {
            const isExpired = new Date(date.date) < new Date();
            const daysLeft = Math.ceil(
              (new Date(date.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={date.id}
                className={cn(
                  "p-4 border rounded-lg transition-all",
                  isExpired ? "bg-muted/30 opacity-60" : "bg-card hover:border-accent/50",
                  isUrgent(date) && !isExpired ? "border-orange-300 bg-orange-50/30" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{date.title}</h4>
                      <Badge className={getTypeColor(date.type)}>
                        {getTypeLabel(date.type)}
                      </Badge>
                      {isExpired && (
                        <Badge variant="secondary" className="bg-muted">
                          Expired
                        </Badge>
                      )}
                      {date.hasReminder && !isExpired && (
                        <Badge className="bg-blue-100 text-blue-800 gap-1">
                          <Bell className="h-3 w-3" />
                          Reminder Set
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-foreground font-medium mb-1">
                      {formatDate(date.date)}
                    </p>

                    {!isExpired && daysLeft !== undefined && (
                      <p className={cn("text-xs font-medium mb-2", isUrgent(date) ? "text-orange-600" : "text-muted-foreground")}>
                        {daysLeft === 0
                          ? "Today"
                          : daysLeft === 1
                            ? "Tomorrow"
                            : `${daysLeft} days away`}
                      </p>
                    )}

                    {date.description && (
                      <p className="text-xs text-muted-foreground italic mt-2">
                        "{date.description}..."
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!date.hasReminder && !isExpired && (
                      <Dialog open={reminderOpen && selectedDate?.id === date.id} onOpenChange={setReminderOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(date)}
                            className="gap-1"
                          >
                            <Bell className="h-4 w-4" />
                            Set Reminder
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Set Reminder</DialogTitle>
                            <DialogDescription>
                              Get notified before this important date
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            {[7, 14, 30].map((days) => (
                              <Button
                                key={days}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleAddReminder(date.id, days)}
                              >
                                {days} days before
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {date.hasReminder && !isExpired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReminder(date.id)}
                        className="gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Reminder Set
                      </Button>
                    )}

                    {isExpired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-muted-foreground"
                      >
                        Passed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Dates are extracted automatically from your contract. Set reminders to get browser notifications before important dates. Export to add them to your calendar app.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default KeyDatesCalendar;
