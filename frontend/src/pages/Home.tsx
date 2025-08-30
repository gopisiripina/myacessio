import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2, DollarSign, TrendingUp, Database, AlertTriangle, RefreshCw, Activity, Calendar, ExternalLink } from "lucide-react";
import { moduleManager } from "@/modules";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useServiceStats, useUpcomingRenewals, useOverdueServices } from "@/hooks/useServices";
import { useAssets } from "@/hooks/useAssets";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

// Customizable Home with pickable individual cards from unified modules
export default function Home() {
  const { user } = useAuth();
  const storageKey = useMemo(() => `home_widgets_${user?.id ?? "anon"}`, [user?.id]);

  const assetsEnabled = moduleManager.isModuleEnabled("assets");

  type WidgetKey =
    | "subs_monthly_spend"
    | "subs_projected_yearly"
    | "subs_total_spent"
    | "subs_yearly_spent"
    | "subs_active_services"
    | "subs_expired_services"
    | "subs_auto_renew"
    | "subs_health_score"
    | "ren_overdue"
    | "ren_next7"
    | "ren_next30"
    | "asset_total"
    | "asset_in_use"
    | "asset_available"
    | "asset_maintenance"
    | "asset_total_value";

  const defaultWidgets: WidgetKey[] = [
    "subs_monthly_spend",
    "subs_projected_yearly",
    "subs_active_services",
    "ren_next7",
    ...(assetsEnabled ? (["asset_total"] as WidgetKey[]) : []),
  ];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<WidgetKey[]>(defaultWidgets);

  // Data hooks
  const { data: stats, isLoading: statsLoading } = useServiceStats();
  const { data: upcoming7Days } = useUpcomingRenewals(7);
  const { data: upcoming30Days } = useUpcomingRenewals(30);
  const { data: overdue } = useOverdueServices();
  const { assetStats } = useAssets();

  useEffect(() => {
    // SEO basics
    document.title = "Home | Unified Dashboard";
    const ensureMeta = (name: string, content: string) => {
      let m = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement("meta");
        m.name = name;
        document.head.appendChild(m);
      }
      m.content = content;
    };
    ensureMeta("description", "Custom home with unified dashboard widgets: subscriptions, renewals, assets");
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.origin + "/home";
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        let parsed = JSON.parse(raw) as string[];
        // Migrate old group keys to individual cards if present
        const expanded: WidgetKey[] = [];
        const add = (k: WidgetKey) => (expanded.includes(k) ? null : expanded.push(k));
        parsed.forEach((k) => {
          switch (k) {
            case "subs_stats":
              (
                [
                  "subs_monthly_spend",
                  "subs_projected_yearly",
                  "subs_total_spent",
                  "subs_yearly_spent",
                  "subs_active_services",
                  "subs_expired_services",
                  "subs_auto_renew",
                  "subs_health_score",
                ] as WidgetKey[]
              ).forEach((x) => add(x));
              break;
            case "upcoming_renewals":
              (["ren_overdue", "ren_next7", "ren_next30"] as WidgetKey[]).forEach((x) => add(x));
              break;
            case "asset_stats":
              if (assetsEnabled) {
                (
                  [
                    "asset_total",
                    "asset_in_use",
                    "asset_available",
                    "asset_maintenance",
                    "asset_total_value",
                  ] as WidgetKey[]
                ).forEach((x) => add(x));
              }
              break;
            default:
              if (
                (
                  [
                    "subs_monthly_spend",
                    "subs_projected_yearly",
                    "subs_total_spent",
                    "subs_yearly_spent",
                    "subs_active_services",
                    "subs_expired_services",
                    "subs_auto_renew",
                    "subs_health_score",
                    "ren_overdue",
                    "ren_next7",
                    "ren_next30",
                    "asset_total",
                    "asset_in_use",
                    "asset_available",
                    "asset_maintenance",
                    "asset_total_value",
                  ] as string[]
                ).includes(k)
              ) {
                add(k as WidgetKey);
              }
          }
        });
        setSelected(expanded.length ? expanded : defaultWidgets);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, assetsEnabled]);

  const toggle = (key: WidgetKey) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(selected));
    toast({ title: "Saved", description: "Home widgets updated." });
    setOpen(false);
  };

  const reset = () => setSelected(defaultWidgets);

  // Helpers for upcoming renewals cards
  const getUrgencyColor = (renewalDate: string) => {
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "destructive" as const;
    if (days <= 7) return "destructive" as const;
    if (days <= 30) return "secondary" as const;
    return "default" as const;
  };
  const getUrgencyLabel = (renewalDate: string) => {
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days`;
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Home</h1>
          <p className="text-sm md:text-base text-muted-foreground">Build your custom main dashboard from unified modules</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" /> Customize
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose widgets</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div>
                <h3 className="text-sm font-semibold mb-2">Subscriptions</h3>
                <div className="grid gap-3">
                  {(
                    [
                      ["subs_monthly_spend", "Monthly Spend"],
                      ["subs_projected_yearly", "Projected Yearly"],
                      ["subs_total_spent", "Total Spent"],
                      ["subs_yearly_spent", "This Year Spent"],
                      ["subs_active_services", "Active Services"],
                      ["subs_expired_services", "Expired Services"],
                      ["subs_auto_renew", "Auto Renewal Count"],
                      ["subs_health_score", "Health Score"],
                    ] as [WidgetKey, string][]
                  ).map(([k, label]) => (
                    <div key={k} className="flex items-center justify-between">
                      <Label htmlFor={k}>{label}</Label>
                      <Switch id={k} checked={selected.includes(k)} onCheckedChange={() => toggle(k)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Upcoming Renewals</h3>
                <div className="grid gap-3">
                  {([
                    ["ren_overdue", "Overdue"],
                    ["ren_next7", "Next 7 Days"],
                    ["ren_next30", "Next 30 Days"],
                  ] as [WidgetKey, string][]).map(([k, label]) => (
                    <div key={k} className="flex items-center justify-between">
                      <Label htmlFor={k}>{label}</Label>
                      <Switch id={k} checked={selected.includes(k)} onCheckedChange={() => toggle(k)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Assets</h3>
                <div className="grid gap-3">
                  {([
                    ["asset_total", "Total Assets"],
                    ["asset_in_use", "In Use"],
                    ["asset_available", "Available"],
                    ["asset_maintenance", "Maintenance"],
                    ["asset_total_value", "Total Asset Value"],
                  ] as [WidgetKey, string][]).map(([k, label]) => (
                    <div key={k} className="flex items-center justify-between">
                      <Label htmlFor={k} className={!assetsEnabled ? "opacity-50" : undefined}>{label}</Label>
                      <Switch id={k} disabled={!assetsEnabled} checked={selected.includes(k)} onCheckedChange={() => toggle(k)} />
                    </div>
                  ))}
                </div>
                {!assetsEnabled && (
                  <p className="text-xs text-muted-foreground mt-2">Enable Assets module in Admin → Modules to use these widgets.</p>
                )}
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="button" onClick={save}>Save</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Selected cards grid */}
      <main>
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {selected.includes("subs_monthly_spend") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalMonthlySpend?.byCurrency?.map((curr: any, index: number) => (
                      <div key={curr.currency}>
                        {formatCurrency(curr.amount, curr.currency as "INR" | "USD" | "EUR")}
                        {index < (stats.totalMonthlySpend?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
                      </div>
                    )) || formatCurrency(0, "INR")}
                  </div>
                  <p className="text-xs text-muted-foreground">Current month active subscriptions</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_projected_yearly") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projected Yearly</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.projectedYearlySpend?.byCurrency?.map((curr: any, index: number) => (
                      <div key={curr.currency}>
                        {formatCurrency(curr.amount, curr.currency as "INR" | "USD" | "EUR")}
                        {index < (stats.projectedYearlySpend?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
                      </div>
                    )) || formatCurrency(0, "INR")}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on current subscriptions</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_total_spent") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalSpent?.byCurrency?.map((curr: any, index: number) => (
                      <div key={curr.currency}>
                        {formatCurrency(curr.amount, curr.currency as "INR" | "USD" | "EUR")}
                        {index < (stats.totalSpent?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
                      </div>
                    )) || formatCurrency(0, "INR")}
                  </div>
                  <p className="text-xs text-muted-foreground">All time actual payments</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_yearly_spent") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Year Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.yearlySpent?.byCurrency?.map((curr: any, index: number) => (
                      <div key={curr.currency}>
                        {formatCurrency(curr.amount, curr.currency as "INR" | "USD" | "EUR")}
                        {index < (stats.yearlySpent?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
                      </div>
                    )) || formatCurrency(0, "INR")}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date().getFullYear()} actual payments</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_active_services") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{stats?.activeServices || 0}</div>
                  <p className="text-xs text-muted-foreground">of {stats?.totalServices || 0} total services</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_expired_services") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expired Services</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats?.expiredServices || 0}</div>
                  <p className="text-xs text-muted-foreground">Need immediate attention</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_auto_renew") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auto Renewal</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats?.autoRenewServices || 0}</div>
                  <p className="text-xs text-muted-foreground">Services with auto-renewal enabled</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("subs_health_score") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">
                      {stats?.totalServices ? Math.round((stats.activeServices / stats.totalServices) * 100) : 0}%
                    </div>
                    <Badge
                      variant={
                        stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.8
                          ? "default"
                          : stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.6
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.8
                        ? "Excellent"
                        : stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.6
                        ? "Good"
                        : "Needs Attention"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Active vs total services ratio</p>
                </CardContent>
              </Card>
            )}

            {selected.includes("ren_overdue") && (
              <Card className="border-destructive/30 bg-[hsl(var(--destructive)/0.08)] dark:bg-[hsl(var(--destructive)/0.12)] lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-destructive flex items-center">
                    <Calendar className="mr-2 h-5 w-5" /> Overdue ({overdue?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {overdue?.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{service.service_name}</p>
                        <p className="text-xs text-muted-foreground">{service.provider}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="destructive" className="text-xs">{getUrgencyLabel(service.next_renewal_date!)}</Badge>
                          <span className="text-xs font-medium">{formatCurrency(service.next_renewal_amount ?? service.amount, service.currency)}</span>
                        </div>
                      </div>
                      {service.dashboard_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                  {(overdue?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No overdue services</p>
                  )}
                </CardContent>
              </Card>
            )}

            {selected.includes("ren_next7") && (
              <Card className="border-accent/30 bg-[hsl(var(--accent)/0.08)] dark:bg-[hsl(var(--accent)/0.12)]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-accent flex items-center">
                    <Calendar className="mr-2 h-5 w-5" /> Next 7 Days ({
                      upcoming7Days?.filter((s) => !overdue?.find((o) => o.id === s.id))?.length || 0
                    })
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming7Days
                    ?.filter((s) => !overdue?.find((o) => o.id === s.id))
                    .slice(0, 5)
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{service.service_name}</p>
                          <p className="text-xs text-muted-foreground">{service.provider}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getUrgencyColor(service.next_renewal_date!)} className="text-xs">
                              {format(new Date(service.next_renewal_date!), "MMM dd")}
                            </Badge>
                            <span className="text-xs font-medium">
                              {formatCurrency(service.next_renewal_amount ?? service.amount, service.currency)}
                            </span>
                          </div>
                        </div>
                        {service.dashboard_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  {(upcoming7Days?.filter((s) => !overdue?.find((o) => o.id === s.id))?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No renewals in next 7 days</p>
                  )}
                </CardContent>
              </Card>
            )}

            {selected.includes("ren_next30") && (
              <Card className="border-secondary/30 bg-[hsl(var(--secondary)/0.08)] dark:bg-[hsl(var(--secondary)/0.12)]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-secondary flex items-center">
                    <Calendar className="mr-2 h-5 w-5" /> Next 30 Days ({
                      upcoming30Days?.filter(
                        (s) => !overdue?.find((o) => o.id === s.id) && !upcoming7Days?.find((u) => u.id === s.id)
                      )?.length || 0
                    })
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming30Days
                    ?.filter((s) => !overdue?.find((o) => o.id === s.id) && !upcoming7Days?.find((u) => u.id === s.id))
                    .slice(0, 5)
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{service.service_name}</p>
                          <p className="text-xs text-muted-foreground">{service.provider}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {format(new Date(service.next_renewal_date!), "MMM dd")}
                            </Badge>
                            <span className="text-xs font-medium">
                              {formatCurrency(service.next_renewal_amount ?? service.amount, service.currency)}
                            </span>
                          </div>
                        </div>
                        {service.dashboard_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  {(upcoming30Days?.filter((s) => !overdue?.find((o) => o.id === s.id) && !upcoming7Days?.find((u) => u.id === s.id))?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No renewals in next 30 days</p>
                  )}
                </CardContent>
              </Card>
            )}

            {assetsEnabled && selected.includes("asset_total") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assetStats.total}</div>
                  <p className="text-xs text-muted-foreground">All assets in inventory</p>
                </CardContent>
              </Card>
            )}

            {assetsEnabled && selected.includes("asset_in_use") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Use</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assetStats.inUse}</div>
                  <p className="text-xs text-muted-foreground">Currently deployed assets</p>
                </CardContent>
              </Card>
            )}

            {assetsEnabled && selected.includes("asset_available") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assetStats.available}</div>
                  <p className="text-xs text-muted-foreground">Ready for deployment</p>
                </CardContent>
              </Card>
            )}

            {assetsEnabled && selected.includes("asset_maintenance") && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assetStats.maintenance}</div>
                  <p className="text-xs text-muted-foreground">Under maintenance</p>
                </CardContent>
              </Card>
            )}

            {assetsEnabled && selected.includes("asset_total_value") && (
              <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="mr-1">$</span>
                    {assetStats.totalValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Current book value of all assets</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <aside className="text-xs text-muted-foreground">
        Tip: Go to individual unified dashboards for full views:
        <Link to="/subscriptions" className="underline ml-1">
          Subscriptions
        </Link>
        {assetsEnabled && (
          <>
            <span> • </span>
            <Link to="/assets-dashboard" className="underline">
              Assets
            </Link>
          </>
        )}
      </aside>
    </div>
  );
}
