import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, Phone, Mail, CreditCard, CalendarIcon } from "lucide-react";
import { format, subDays, subMonths, isWithinInterval, startOfDay } from "date-fns";
import { el, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/hooks/useLanguage";
import type { DateRange } from "react-day-picker";

type Preset = "30d" | "90d" | "6m" | "all" | "custom";

interface DashboardOverviewProps {
  listings: any[];
  analytics: any[];
  subscription: any;
}

const DashboardOverview = ({ listings, analytics, subscription }: DashboardOverviewProps) => {
  const { lang } = useLanguage();
  const [preset, setPreset] = useState<Preset>("30d");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const localeObj = lang === "el" ? el : enUS;
  const localeDateStr = lang === "el" ? "el-GR" : "en-US";

  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
  const totalPhoneClicks = analytics.reduce((sum, a) => sum + a.phone_clicks, 0);
  const totalEmailClicks = analytics.reduce((sum, a) => sum + a.email_clicks, 0);

  const chartMap = new Map<string, { date: string; views: number; phone: number; email: number }>();
  analytics.forEach((a) => {
    const existing = chartMap.get(a.date) || { date: a.date, views: 0, phone: 0, email: 0 };
    existing.views += a.views;
    existing.phone += a.phone_clicks;
    existing.email += a.email_clicks;
    chartMap.set(a.date, existing);
  });

  const allChartData = Array.from(chartMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = dateRange?.from
    ? allChartData.filter((d) => {
        const day = startOfDay(new Date(d.date));
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(day, { start: startOfDay(dateRange.from), end: startOfDay(dateRange.to) });
        }
        if (dateRange.from) {
          return day >= startOfDay(dateRange.from);
        }
        return true;
      })
    : allChartData;

  const handlePreset = (p: Preset) => {
    setPreset(p);
    const today = new Date();
    switch (p) {
      case "30d":
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case "90d":
        setDateRange({ from: subDays(today, 90), to: today });
        break;
      case "6m":
        setDateRange({ from: subMonths(today, 6), to: today });
        break;
      case "all":
        setDateRange(undefined);
        break;
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setPreset("custom");
    if (range?.from && range?.to) {
      setCalendarOpen(false);
    }
  };

  const presetLabels: Record<Exclude<Preset, "custom">, string> = {
    "30d": lang === "el" ? "30 ημέρες" : "30 days",
    "90d": lang === "el" ? "90 ημέρες" : "90 days",
    "6m": lang === "el" ? "6 μήνες" : "6 months",
    "all": lang === "el" ? "Όλα" : "All",
  };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy", { locale: localeObj })} – ${format(dateRange.to, "dd MMM yyyy", { locale: localeObj })}`
      : format(dateRange.from, "dd MMM yyyy", { locale: localeObj })
    : (lang === "el" ? "Όλες οι ημερομηνίες" : "All dates");

  const statCards = [
    { label: lang === "el" ? "Συνολικές Προβολές" : "Total Views", value: totalViews, icon: Eye, color: "text-primary" },
    { label: lang === "el" ? "Κλικ Τηλεφώνου" : "Phone Clicks", value: totalPhoneClicks, icon: Phone, color: "text-green-600" },
    { label: lang === "el" ? "Κλικ Email" : "Email Clicks", value: totalEmailClicks, icon: Mail, color: "text-orange-500" },
    { label: lang === "el" ? "Καταχωρίσεις" : "Listings", value: listings.length, icon: CreditCard, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Subscription status */}
      <div className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {lang === "el" ? "Κατάσταση Συνδρομής" : "Subscription Status"}
          </p>
          <p className="text-xs text-muted-foreground">
            {subscription?.status === "active"
              ? (lang === "el" ? "Ενεργή συνδρομή" : "Active subscription")
              : subscription?.status === "past_due"
              ? (lang === "el" ? "Εκκρεμής πληρωμή" : "Payment due")
              : (lang === "el" ? "Ανενεργή — απαιτείται συνδρομή 15€/μήνα" : "Inactive — subscription of 15€/month required")}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            subscription?.status === "active"
              ? "bg-green-100 text-green-700"
              : subscription?.status === "past_due"
              ? "bg-orange-100 text-orange-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {subscription?.status === "active"
            ? (lang === "el" ? "Ενεργή" : "Active")
            : subscription?.status === "past_due"
            ? (lang === "el" ? "Εκκρεμής" : "Due")
            : (lang === "el" ? "Ανενεργή" : "Inactive")}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-travel">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} className={stat.color} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString(localeDateStr)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl p-6 shadow-travel">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-display font-semibold text-foreground">
            {lang === "el" ? "Στατιστικά" : "Statistics"}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
              {(Object.keys(presetLabels) as Exclude<Preset, "custom">[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handlePreset(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    preset === key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {presetLabels[key]}
                </button>
              ))}
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 text-xs gap-1.5 px-3",
                    preset === "custom" && "border-primary text-primary"
                  )}
                >
                  <CalendarIcon size={14} />
                  <span className="hidden sm:inline">{dateLabel}</span>
                  <span className="sm:hidden">{lang === "el" ? "Ημ/νίες" : "Dates"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                  disabled={(date) => date > new Date()}
                  locale={localeObj}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString(localeDateStr, { day: "2-digit", month: "2-digit" })}
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString(localeDateStr)}
                />
                <Bar dataKey="views" name={lang === "el" ? "Προβολές" : "Views"} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="phone" name={lang === "el" ? "Τηλέφωνο" : "Phone"} fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="email" name="Email" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              {lang === "el" ? "Δεν υπάρχουν δεδομένα για αυτό το χρονικό εύρος." : "No data for this time range."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "el" ? "Δοκιμάστε να αλλάξετε το εύρος ημερομηνιών." : "Try changing the date range."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
