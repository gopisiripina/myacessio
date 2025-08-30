import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addDays, format, isSameMonth, parseISO, startOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { Download, Eraser, Save, CalendarDays, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// SEO helpers
function useSEO() {
  useEffect(() => {
    document.title = 'Company Calendar | Working days, holidays, events';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const el = document.createElement('meta');
      el.name = 'description';
      el.content = 'Company Calendar to assign working days, weekends, holidays, events, disasters, and strikes.';
      document.head.appendChild(el);
    } else {
      metaDesc.setAttribute('content', 'Company Calendar to assign working days, weekends, holidays, events, disasters, and strikes.');
    }

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.origin + '/company-calendar';
      document.head.appendChild(link);
    } else {
      canonical.href = window.location.origin + '/company-calendar';
    }
  }, []);
}

type DayType = 'working_day' | 'weekday' | 'weekend' | 'holiday' | 'disaster' | 'event' | 'strike';

const DAY_TYPES: { key: DayType; label: string; className: string }[] = [
  { key: 'working_day', label: 'Working Day', className: 'ring-1 ring-primary bg-primary/20' },
  { key: 'weekday', label: 'Weekday', className: 'ring-1 ring-secondary bg-secondary/20' },
  { key: 'weekend', label: 'Weekend', className: 'ring-1 ring-accent bg-accent/30' },
  { key: 'holiday', label: 'Holiday', className: 'ring-1 ring-destructive bg-destructive/30' },
  { key: 'event', label: 'Event', className: 'ring-1 ring-ring bg-muted' },
  { key: 'disaster', label: 'Disaster', className: 'ring-1 ring-destructive bg-destructive/50' },
  { key: 'strike', label: 'Strike', className: 'ring-1 ring-secondary bg-secondary/40' },
];

interface CalendarMap {
  // key: ISO date (YYYY-MM-DD), value: DayType
  [isoDate: string]: DayType;
}

function iso(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

const getYearOptions = (currentYear: number) => {
  const years: number[] = [];
  for (let y = currentYear - 2; y <= currentYear + 3; y++) years.push(y);
  return years;
};

export default function CompanyCalendar() {
  useSEO();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<Date>(startOfMonth(now));
  const [currentType, setCurrentType] = useState<DayType>('working_day');
  const [map, setMap] = useState<CalendarMap>({});

  // Load assignments for selected year from Supabase
  const { data: rows, isLoading: loadingRows } = useQuery({
    queryKey: ['company-calendar', year],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('company_calendar_assignments')
        .select('calendar_date, day_type')
        .gte('calendar_date', `${year}-01-01`)
        .lte('calendar_date', `${year}-12-31`);
      if (error) throw error;
      return data as { calendar_date: string; day_type: DayType }[];
    },
  });

  // Sync local map with server data
  useEffect(() => {
    if (rows) {
      const next: CalendarMap = {};
      rows.forEach(r => { next[r.calendar_date] = r.day_type; });
      setMap(next);
    } else {
      setMap({});
    }
  }, [rows]);

  useEffect(() => {
    // ensure selected month stays within selected year
    if (format(month, 'yyyy') !== String(year)) {
      setMonth(startOfMonth(startOfYear(new Date(year, 0, 1))));
    }
  }, [year]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existingDates = new Set((rows || []).map(r => r.calendar_date));
      const newDates = new Set(Object.keys(map));
      const upsertRows = Array.from(newDates).map(d => ({ calendar_date: d, day_type: map[d] }));

      // Upsert selected assignments
      const { error: upsertError } = await (supabase as any)
        .from('company_calendar_assignments')
        .upsert(upsertRows, { onConflict: 'calendar_date' });
      if (upsertError) throw upsertError;

      // Delete removed assignments
      const toDelete = Array.from(existingDates).filter(d => !newDates.has(d));
      if (toDelete.length > 0) {
        const { error: delError } = await (supabase as any)
          .from('company_calendar_assignments')
          .delete()
          .in('calendar_date', toDelete);
        if (delError) throw delError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-calendar', year] });
      toast({ title: 'Saved', description: `Calendar saved for ${year}.` });
    },
    onError: (e: any) => {
      toast({ title: 'Save failed', description: e?.message || 'Please try again', variant: 'destructive' });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('company_calendar_assignments')
        .delete()
        .gte('calendar_date', `${year}-01-01`)
        .lte('calendar_date', `${year}-12-31`);
      if (error) throw error;
    },
    onSuccess: () => {
      setMap({});
      queryClient.invalidateQueries({ queryKey: ['company-calendar', year] });
      toast({ title: 'Cleared', description: `All assignments cleared for ${year}.` });
    },
    onError: (e: any) => {
      toast({ title: 'Clear failed', description: e?.message || 'Please try again', variant: 'destructive' });
    },
  });

  const clearDay = (d: Date) => {
    const key = iso(d);
    setMap(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setDayType = (d: Date, type: DayType) => {
    const key = iso(d);
    setMap(prev => ({ ...prev, [key]: type }));
  };

  const onDayClick = (d?: Date) => {
    if (!d) return;
    const key = iso(d);
    const existing = map[key];
    if (existing === currentType) {
      clearDay(d);
    } else {
      setDayType(d, currentType);
    }
  };

  // Build modifiers for styling
  const modifiers = useMemo(() => {
    const byType: Record<DayType, Date[]> = {
      working_day: [], weekday: [], weekend: [], holiday: [], disaster: [], event: [], strike: []
    };
    // Only pass dates in current displayed month for perf
    const start = startOfMonth(month);
    const end = addDays(start, 40); // next month too to cover outside days
    Object.entries(map).forEach(([k, type]) => {
      const d = parseISO(k);
      if (isSameMonth(d, month) || (d >= start && d <= end)) byType[type].push(d);
    });
    return byType;
  }, [map, month]);

  const modifiersClassNames = useMemo(() => {
    const classes: Record<string, string> = {};
    DAY_TYPES.forEach(dt => { classes[dt.key] = cn('!rounded-md !text-foreground', dt.className); });
    return classes;
  }, []);

  // Counts
  const counts = useMemo(() => {
    const c: Record<DayType, number> = {
      working_day: 0, weekday: 0, weekend: 0, holiday: 0, disaster: 0, event: 0, strike: 0
    };
    Object.values(map).forEach(t => { c[t]++; });
    return c;
  }, [map]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalDays = Object.keys(map).length;
    const workingDays = counts.working_day + counts.weekday;
    const nonWorkingDays = counts.weekend + counts.holiday;
    const specialEvents = counts.event + counts.disaster + counts.strike;
    const yearProgress = Math.round(((new Date().getTime() - new Date(year, 0, 1).getTime()) / (new Date(year + 1, 0, 1).getTime() - new Date(year, 0, 1).getTime())) * 100);
    
    return {
      totalDays,
      workingDays,
      nonWorkingDays,
      specialEvents,
      yearProgress: Math.min(yearProgress, 100),
      efficiency: totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0
    };
  }, [counts, year, map]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Company Calendar
        </h1>
        <p className="text-muted-foreground">
          Assign day types for the year to track working days, weekends, holidays, events, disasters, and strikes.
        </p>
      </header>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dashboardMetrics.totalDays}</div>
            <p className="text-xs text-muted-foreground">
              Days configured for {year}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{dashboardMetrics.workingDays}</div>
            <p className="text-xs text-muted-foreground">
              Productive work days
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Working Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{dashboardMetrics.nonWorkingDays}</div>
            <p className="text-xs text-muted-foreground">
              Weekends & holidays
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Special Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{dashboardMetrics.specialEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events, disasters & strikes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">{dashboardMetrics.efficiency}%</div>
              <Badge variant={dashboardMetrics.efficiency > 70 ? "default" : dashboardMetrics.efficiency > 50 ? "secondary" : "destructive"}>
                {dashboardMetrics.efficiency > 70 ? "Optimal" : dashboardMetrics.efficiency > 50 ? "Good" : "Low"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Working days ratio
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-emerald-600">{dashboardMetrics.yearProgress}%</div>
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dashboardMetrics.yearProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {year} completion status
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {year} Calendar View
              </CardTitle>
              <CardDescription>Click a date to assign the selected day type.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label="Select year"
                className="border border-input bg-background text-foreground rounded-md px-2 py-1"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {getYearOptions(new Date().getFullYear()).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => saveMutation.mutate()} 
                disabled={loadingRows || saveMutation.isPending}
                className="bg-primary/10 border-primary/20 hover:bg-primary/20"
              >
                <Save className="h-4 w-4 mr-1" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Day Type Selection</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {DAY_TYPES.map((dt) => (
                    <Button
                      key={dt.key}
                      variant={currentType === dt.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentType(dt.key)}
                      className={cn(
                        'transition-all duration-200',
                        currentType === dt.key 
                          ? 'shadow-md scale-105 bg-primary hover:bg-primary/90' 
                          : 'hover:scale-105 hover:shadow-sm'
                      )}
                      aria-pressed={currentType === dt.key}
                    >
                      <span className={cn('h-3 w-3 rounded-sm mr-2 inline-block', dt.className)} />
                      {dt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/50 overflow-hidden shadow-inner bg-gradient-to-b from-muted/30 to-background">
                <Calendar
                  month={month}
                  onMonthChange={setMonth}
                  onDayClick={(d) => onDayClick(d as Date)}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  showOutsideDays
                  className="p-0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card to-accent/5">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-accent/5 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Day Type Summary
            </CardTitle>
            <CardDescription>{year} assignments overview</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {DAY_TYPES.map((dt) => (
                <div key={dt.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={cn('h-4 w-4 rounded-md inline-block shadow-sm', dt.className)} />
                    <span className="text-sm font-medium">{dt.label}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'font-semibold shadow-sm',
                      counts[dt.key] > 0 && 'bg-primary/10 text-primary border-primary/20'
                    )}
                  >
                    {counts[dt.key]}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Actions</h4>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => clearMutation.mutate()} 
                  disabled={clearMutation.isPending}
                  className="justify-start hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive"
                >
                  <Eraser className="h-4 w-4 mr-2" /> 
                  {clearMutation.isPending ? 'Clearing...' : 'Clear Year'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start hover:bg-primary/10 hover:border-primary/20"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `company-calendar-${year}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" /> Export JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
