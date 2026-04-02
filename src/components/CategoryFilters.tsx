import { useState, useEffect } from "react";
import { ChevronRight, X, Minus, Plus, ChevronLeft, ChevronDown, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { usePlacesAutocomplete, loadGoogleMaps } from "@/hooks/usePlacesAutocomplete";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, isBefore, startOfDay } from "date-fns";
import { el } from "date-fns/locale";

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterGroupType = "checkbox" | "counter" | "price-range" | "location" | "dates";

export interface CounterOption {
  key: string;
  label: string;
  note?: string;
}

export interface FilterGroup {
  key: string;
  title: string;
  type?: FilterGroupType;
  options: FilterOption[];
  counterOptions?: CounterOption[];
}

interface CategoryFiltersProps {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onApplyFilters: (filters: Record<string, string[]>) => void;
  onLocationCoords?: (lat: number, lng: number) => void;
}

// Helper to parse stored values
const parseCounterValue = (values: string[], key: string): number => {
  const entry = values.find((v) => v.startsWith(`${key}:`));
  return entry ? parseInt(entry.split(":")[1], 10) || 0 : 0;
};

const parsePriceValue = (values: string[], which: "min" | "max"): string => {
  const entry = values.find((v) => v.startsWith(`${which}:`));
  return entry ? entry.split(":")[1] || "" : "";
};

const parseDateValue = (values: string[], which: "start" | "end"): Date | null => {
  const entry = values.find((v) => v.startsWith(`${which}:`));
  if (!entry) return null;
  const d = new Date(entry.split(":").slice(1).join(":"));
  return isNaN(d.getTime()) ? null : d;
};

const getLocationValue = (values: string[]): string => {
  return values.length > 0 ? values[0] : "";
};

const DAYS = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];

const CategoryFilters = ({ filterGroups, activeFilters, onApplyFilters, onLocationCoords }: CategoryFiltersProps) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  // Date picker state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Places autocomplete for location filter
  const { query: locationQuery, predictions: locationPredictions, isOpen: locationDropdownOpen, search: locationSearch, select: locationSelect, close: locationClose, setQuery: setLocationQuery, getPlaceDetails } = usePlacesAutocomplete();

  useEffect(() => { loadGoogleMaps(); }, []);

  const openGroup = filterGroups.find((g) => g.key === openFilter);

  const handleOpenFilter = (key: string) => {
    setTempSelected(activeFilters[key] || []);
    setOpenFilter(key);
    // Sync location query when opening location filter
    const group = filterGroups.find(g => g.key === key);
    if (group?.type === "location") {
      const val = getLocationValue(activeFilters[key] || []);
      setLocationQuery(val);
    }
  };

  const handleToggle = (value: string) => {
    setTempSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleApply = () => {
    if (!openFilter) return;
    onApplyFilters({ ...activeFilters, [openFilter]: tempSelected });
    setOpenFilter(null);
  };

  const handleRemovePill = (groupKey: string, value: string) => {
    const updated = (activeFilters[groupKey] || []).filter((v) => v !== value);
    onApplyFilters({ ...activeFilters, [groupKey]: updated });
  };

  // Counter helpers
  const handleCounterChange = (key: string, delta: number) => {
    setTempSelected((prev) => {
      const current = parseCounterValue(prev, key);
      const newVal = Math.max(0, current + delta);
      const filtered = prev.filter((v) => !v.startsWith(`${key}:`));
      if (newVal > 0) filtered.push(`${key}:${newVal}`);
      return filtered;
    });
  };

  // Price helpers
  const handlePriceChange = (which: "min" | "max", val: string) => {
    setTempSelected((prev) => {
      const filtered = prev.filter((v) => !v.startsWith(`${which}:`));
      if (val) filtered.push(`${which}:${val}`);
      return filtered;
    });
  };

  // Location helper
  const handleLocationChange = (val: string) => {
    setTempSelected(val ? [val] : []);
  };

  // Date helpers
  const handleDayClick = (day: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(day, today)) return;

    const currentStart = parseDateValue(tempSelected, "start");
    const currentEnd = parseDateValue(tempSelected, "end");

    let newStart: Date | null = null;
    let newEnd: Date | null = null;

    if (!currentStart || (currentStart && currentEnd)) {
      newStart = day;
      newEnd = null;
    } else {
      if (isBefore(day, currentStart)) {
        newStart = day;
        newEnd = currentStart;
      } else {
        newStart = currentStart;
        newEnd = day;
      }
    }

    const result: string[] = [];
    if (newStart) result.push(`start:${newStart.toISOString()}`);
    if (newEnd) result.push(`end:${newEnd.toISOString()}`);
    setTempSelected(result);
  };

  // Summary helpers
  const getSummary = (group: FilterGroup): string => {
    const values = activeFilters[group.key] || [];
    if (values.length === 0) return "";

    const type = group.type || "checkbox";

    if (type === "location") return getLocationValue(values);

    if (type === "dates") {
      const start = parseDateValue(values, "start");
      const end = parseDateValue(values, "end");
      if (start && end) return `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`;
      if (start) return format(start, "dd/MM/yyyy");
      return "";
    }

    if (type === "counter") {
      const parts: string[] = [];
      group.counterOptions?.forEach((co) => {
        const v = parseCounterValue(values, co.key);
        if (v > 0) parts.push(`${v} ${co.label.toLowerCase()}`);
      });
      return parts.join(", ");
    }

    if (type === "price-range") {
      const min = parsePriceValue(values, "min");
      const max = parsePriceValue(values, "max");
      if (min && max) return `Από ${min} € έως ${max} €`;
      if (min) return `Από ${min} €`;
      if (max) return `Έως ${max} €`;
      return "";
    }

    // checkbox
    const labels = values
      .map((v) => group.options.find((o) => o.value === v)?.label)
      .filter(Boolean);
    if (labels.length <= 3) return labels.join(", ");
    return `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`;
  };

  // Collect all active pills (only for checkbox type)
  const pills: { groupKey: string; value: string; label: string }[] = [];
  for (const group of filterGroups) {
    const type = group.type || "checkbox";
    if (type !== "checkbox") {
      // For non-checkbox types, show summary as single pill
      const summary = getSummary(group);
      if (summary) {
        pills.push({ groupKey: group.key, value: "__all__", label: `${group.title}: ${summary}` });
      }
      continue;
    }
    for (const val of activeFilters[group.key] || []) {
      const opt = group.options.find((o) => o.value === val);
      if (opt) pills.push({ groupKey: group.key, value: val, label: opt.label });
    }
  }

  const handleRemoveGroupPill = (groupKey: string, value: string) => {
    if (value === "__all__") {
      onApplyFilters({ ...activeFilters, [groupKey]: [] });
    } else {
      handleRemovePill(groupKey, value);
    }
  };

  // Calendar rendering helpers
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;
  const dateStart = parseDateValue(tempSelected, "start");
  const dateEnd = parseDateValue(tempSelected, "end");

  // Render sub-view content based on type
  const renderSubView = () => {
    if (!openGroup) return null;
    const type = openGroup.type || "checkbox";

    if (type === "location") {
      return (
        <div className="px-5 py-4">
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                locationSearch(e.target.value);
                handleLocationChange(e.target.value);
              }}
              placeholder="Δοκιμάστε 'Σύρος'"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "16px" }}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          {locationDropdownOpen && locationPredictions.length > 0 && (
            <div className="mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
              {locationPredictions.map((p) => (
                <button
                  key={p.place_id}
                  type="button"
                  onClick={async () => {
                    locationSelect(p);
                    handleLocationChange(p.description);
                    const details = await getPlaceDetails(p.place_id);
                    if (details?.lat && details?.lng && onLocationCoords) {
                      onLocationCoords(details.lat, details.lng);
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                >
                  <MapPin size={15} className="text-primary flex-shrink-0" />
                  {p.description}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (type === "dates") {
      return (
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-foreground" />
            </button>
            <span className="text-sm font-semibold text-foreground capitalize">
              {format(calendarMonth, "LLLL yyyy", { locale: el })}
            </span>
            <button type="button" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
              <ChevronRight size={18} className="text-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map((day) => {
              const isDisabled = isBefore(day, today);
              const isStart = dateStart && isSameDay(day, dateStart);
              const isEnd = dateEnd && isSameDay(day, dateEnd);
              const isInRange = dateStart && dateEnd && isWithinInterval(day, { start: dateStart, end: dateEnd });
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(day)}
                  className={`text-sm py-1.5 rounded-lg transition-colors ${
                    isDisabled ? "text-muted-foreground/40 cursor-not-allowed" :
                    isStart || isEnd ? "bg-primary text-primary-foreground font-bold" :
                    isInRange ? "bg-primary/15 text-foreground" :
                    "text-foreground hover:bg-accent"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === "counter") {
      return (
        <div className="px-5 py-4 space-y-5">
          {openGroup.counterOptions?.map((co) => {
            const val = parseCounterValue(tempSelected, co.key);
            return (
              <div key={co.key}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{co.label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCounterChange(co.key, -1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                      disabled={val <= 0}
                    >
                      <Minus size={14} className="text-foreground" />
                    </button>
                    <span className="text-base font-semibold text-foreground w-5 text-center">{val}</span>
                    <button
                      type="button"
                      onClick={() => handleCounterChange(co.key, 1)}
                      className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                {co.note && <p className="text-xs text-muted-foreground mt-1">{co.note}</p>}
              </div>
            );
          })}
        </div>
      );
    }

    if (type === "price-range") {
      const minVal = parsePriceValue(tempSelected, "min");
      const maxVal = parsePriceValue(tempSelected, "max");
      return (
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Από €</label>
              <input
                type="number"
                value={minVal}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
                min={0}
              />
            </div>
            <span className="text-muted-foreground mt-5">—</span>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Έως €</label>
              <input
                type="number"
                value={maxVal}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
                min={0}
              />
            </div>
          </div>
        </div>
      );
    }

    // Default: checkbox
    return (
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
        {openGroup.options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors"
          >
            <Checkbox
              checked={tempSelected.includes(opt.value)}
              onCheckedChange={() => handleToggle(opt.value)}
            />
            <span className="text-sm text-foreground">{opt.label}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {filterGroups.map((group) => {
          const summary = getSummary(group);
          const hasActive = summary.length > 0;
          return (
            <button
              key={group.key}
              onClick={() => handleOpenFilter(group.key)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-full border text-sm transition-colors ${
                hasActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {group.title}
              {hasActive && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                  ✓
                </span>
              )}
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Applied filter pills */}
      {pills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span
              key={`${pill.groupKey}-${pill.value}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              {pill.label}
              <button
                onClick={() => handleRemoveGroupPill(pill.groupKey, pill.value)}
                className="hover:text-destructive transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            onClick={() => onApplyFilters({})}
            className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Καθαρισμός
          </button>
        </div>
      )}

      {/* Filter Sheet */}
      <Sheet open={!!openFilter} onOpenChange={(open) => !open && setOpenFilter(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] flex flex-col p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
            <SheetTitle className="text-base font-semibold">{openGroup?.title}</SheetTitle>
            <button
              onClick={() => setOpenFilter(null)}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {renderSubView()}
          </div>

          {/* Apply button */}
          <div className="px-5 py-4 border-t border-border">
            <Button onClick={handleApply} className="w-full">
              Εφαρμογή
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CategoryFilters;
