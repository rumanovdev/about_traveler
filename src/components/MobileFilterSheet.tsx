import { useState, useEffect } from "react";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Minus, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { FilterGroup } from "@/components/CategoryFilters";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, isBefore, startOfDay } from "date-fns";
import { el } from "date-fns/locale";

interface MobileFilterSheetProps {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onApplyFilters: (filters: Record<string, string[]>) => void;
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

const MobileFilterSheet = ({ filterGroups, activeFilters, onApplyFilters }: MobileFilterSheetProps) => {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [tempFilters, setTempFilters] = useState<Record<string, string[]>>({});

  // Places autocomplete for location filter
  const { query: locationQuery, predictions: locationPredictions, isOpen: locationDropdownOpen, search: locationSearch, select: locationSelect, close: locationClose, setQuery: setLocationQuery } = usePlacesAutocomplete();
  // Date picker state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const currentGroup = filterGroups.find((g) => g.key === activeGroup);

  const totalActive = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  const handleOpen = () => {
    setTempFilters({ ...activeFilters });
    setActiveGroup(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveGroup(null);
  };

  const handleToggle = (groupKey: string, value: string) => {
    setTempFilters((prev) => {
      const current = prev[groupKey] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [groupKey]: updated };
    });
  };

  const handleApplyAll = () => {
    onApplyFilters(tempFilters);
    setOpen(false);
    setActiveGroup(null);
  };

  const handleReset = () => {
    setTempFilters({});
  };

  // Counter helpers
  const handleCounterChange = (groupKey: string, counterKey: string, delta: number) => {
    setTempFilters((prev) => {
      const current = prev[groupKey] || [];
      const val = parseCounterValue(current, counterKey);
      const newVal = Math.max(0, val + delta);
      const filtered = current.filter((v) => !v.startsWith(`${counterKey}:`));
      if (newVal > 0) filtered.push(`${counterKey}:${newVal}`);
      return { ...prev, [groupKey]: filtered };
    });
  };

  // Price helpers
  const handlePriceChange = (groupKey: string, which: "min" | "max", val: string) => {
    setTempFilters((prev) => {
      const current = prev[groupKey] || [];
      const filtered = current.filter((v) => !v.startsWith(`${which}:`));
      if (val) filtered.push(`${which}:${val}`);
      return { ...prev, [groupKey]: filtered };
    });
  };

  // Location helper
  const handleLocationChange = (groupKey: string, val: string) => {
    setTempFilters((prev) => ({
      ...prev,
      [groupKey]: val ? [val] : [],
    }));
  };

  // Date helpers
  const handleDayClick = (groupKey: string, day: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(day, today)) return;

    const current = tempFilters[groupKey] || [];
    const currentStart = parseDateValue(current, "start");
    const currentEnd = parseDateValue(current, "end");

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
    setTempFilters((prev) => ({ ...prev, [groupKey]: result }));
  };

  const getSelectedLabels = (group: FilterGroup): string => {
    const values = tempFilters[group.key] || [];
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
    const selected = values;
    const labels = selected
      .map((v) => group.options.find((o) => o.value === v)?.label)
      .filter(Boolean);
    if (labels.length <= 3) return labels.join(", ");
    return `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`;
  };

  const hasTempSelections = Object.values(tempFilters).some((arr) => arr.length > 0);

  // Calendar rendering helpers
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  const renderSubView = () => {
    if (!currentGroup || !activeGroup) return null;
    const type = currentGroup.type || "checkbox";

    if (type === "location") {
      return (
        <div className="flex-1 overflow-y-auto px-5 py-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                locationSearch(e.target.value);
                handleLocationChange(activeGroup, e.target.value);
              }}
              onInput={(e) => {
                const val = (e.currentTarget as HTMLInputElement).value;
                locationSearch(val);
                handleLocationChange(activeGroup, val);
              }}
              placeholder="Δοκιμάστε 'Σύρος'"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
              style={{ fontSize: "16px" }}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="off"
              inputMode="search"
            />
          </div>
          {locationDropdownOpen && locationPredictions.length > 0 && (
            <div className="mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
              {locationPredictions.map((p) => (
                <button
                  key={p.place_id}
                  type="button"
                  onClick={() => {
                    locationSelect(p);
                    handleLocationChange(activeGroup, p.description);
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
      const dateStart = parseDateValue(tempFilters[activeGroup] || [], "start");
      const dateEnd = parseDateValue(tempFilters[activeGroup] || [], "end");

      return (
        <div className="flex-1 overflow-y-auto px-5 py-4">
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
            {calendarDays.map((day) => {
              const isDisabled = isBefore(day, today);
              const isStart = dateStart && isSameDay(day, dateStart);
              const isEnd = dateEnd && isSameDay(day, dateEnd);
              const isInRange = dateStart && dateEnd && isWithinInterval(day, { start: dateStart, end: dateEnd });
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(activeGroup, day)}
                  className={`text-sm py-2 rounded-lg transition-colors ${
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {currentGroup.counterOptions?.map((co) => {
            const val = parseCounterValue(tempFilters[activeGroup] || [], co.key);
            return (
              <div key={co.key}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{co.label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCounterChange(activeGroup, co.key, -1)}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                      disabled={val <= 0}
                    >
                      <Minus size={14} className="text-foreground" />
                    </button>
                    <span className="text-base font-semibold text-foreground w-5 text-center">{val}</span>
                    <button
                      type="button"
                      onClick={() => handleCounterChange(activeGroup, co.key, 1)}
                      className="w-9 h-9 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                {co.note && <p className="text-xs text-muted-foreground mt-1.5">{co.note}</p>}
              </div>
            );
          })}
        </div>
      );
    }

    if (type === "price-range") {
      const minVal = parsePriceValue(tempFilters[activeGroup] || [], "min");
      const maxVal = parsePriceValue(tempFilters[activeGroup] || [], "max");
      return (
        <div className="flex-1 overflow-y-auto px-5 py-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Από €</label>
              <input
                type="number"
                value={minVal}
                onChange={(e) => handlePriceChange(activeGroup, "min", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                style={{ fontSize: "16px" }}
                min={0}
                inputMode="numeric"
              />
            </div>
            <span className="text-muted-foreground mt-5">—</span>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Έως €</label>
              <input
                type="number"
                value={maxVal}
                onChange={(e) => handlePriceChange(activeGroup, "max", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                style={{ fontSize: "16px" }}
                min={0}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      );
    }

    // Default: checkbox
    return (
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
        {currentGroup.options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 py-3 cursor-pointer hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors"
          >
            <Checkbox
              checked={(tempFilters[activeGroup] || []).includes(opt.value)}
              onCheckedChange={() => handleToggle(activeGroup, opt.value)}
            />
            <span className="text-sm text-foreground">{opt.label}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors"
      >
        <SlidersHorizontal size={16} className="text-muted-foreground" />
        Φίλτρα
        {totalActive > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
            {totalActive}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl flex flex-col p-0 [&>button]:hidden"
        >
          {/* ─── Main list view ─── */}
          {!activeGroup && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
                <button onClick={handleClose} className="p-1 rounded-full hover:bg-accent transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
                <h2 className="text-base font-semibold text-foreground">Φίλτρα</h2>
                {hasTempSelections ? (
                  <button
                    onClick={handleReset}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Επαναφορά
                  </button>
                ) : (
                  <div className="w-16" />
                )}
              </div>

              {/* Filter group rows */}
              <div className="flex-1 overflow-y-auto">
                {filterGroups.map((group) => {
                  const summary = getSelectedLabels(group);
                  return (
                    <button
                      key={group.key}
                      onClick={() => {
                        setActiveGroup(group.key);
                        if (group.type === "location") {
                          const val = getLocationValue(tempFilters[group.key] || []);
                          setLocationQuery(val);
                        }
                      }}
                      className="w-full flex items-center justify-between px-5 py-4 border-b border-border/50 hover:bg-accent/30 transition-colors text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{group.title}</div>
                        {summary && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {summary}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground shrink-0 ml-3" />
                    </button>
                  );
                })}
              </div>

              {/* Apply button */}
              <div className="px-5 py-4 border-t border-border">
                <Button onClick={handleApplyAll} className="w-full rounded-full h-12 text-base">
                  Αναζήτηση
                </Button>
              </div>
            </>
          )}

          {/* ─── Sub-view for a specific filter group ─── */}
          {activeGroup && currentGroup && (
            <>
              {/* Sub header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border">
                <button
                  onClick={() => setActiveGroup(null)}
                  className="p-1 rounded-full hover:bg-accent transition-colors"
                >
                  <ChevronLeft size={20} className="text-muted-foreground" />
                </button>
                <h2 className="text-base font-semibold text-foreground flex-1 text-center pr-7">
                  {currentGroup.title}
                </h2>
              </div>

              {/* Dynamic content */}
              {renderSubView()}

              {/* Apply sub */}
              <div className="px-5 py-4 border-t border-border">
                <Button
                  onClick={() => setActiveGroup(null)}
                  className="w-full rounded-full h-12 text-base"
                >
                  Εφαρμογή
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileFilterSheet;
