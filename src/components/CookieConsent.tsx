import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const COOKIE_KEY = "atr_cookie_consent";

interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
  unclassified: boolean;
}

const defaultPrefs: CookiePreferences = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
  unclassified: false,
};

interface CategoryInfo {
  key: keyof CookiePreferences;
  labelEl: string;
  labelEn: string;
  descEl: string;
  descEn: string;
  count: number;
  locked?: boolean;
}

const categories: CategoryInfo[] = [
  {
    key: "necessary",
    labelEl: "Αναγκαία",
    labelEn: "Necessary",
    descEl: "Τα αναγκαία cookies είναι απαραίτητα για τη σωστή λειτουργία του ιστοτόπου.",
    descEn: "Necessary cookies are essential for the website to function properly.",
    count: 2,
    locked: true,
  },
  {
    key: "preferences",
    labelEl: "Προτιμήσεις",
    labelEn: "Preferences",
    descEl: "Τα cookies προτιμήσεων αποθηκεύουν τις ρυθμίσεις σας (π.χ. γλώσσα).",
    descEn: "Preference cookies store your settings (e.g. language).",
    count: 0,
  },
  {
    key: "statistics",
    labelEl: "Στατιστικά",
    labelEn: "Statistics",
    descEl: "Τα στατιστικά cookies μας βοηθούν να κατανοήσουμε πώς χρησιμοποιείτε τον ιστότοπο.",
    descEn: "Statistics cookies help us understand how you use the website.",
    count: 0,
  },
  {
    key: "marketing",
    labelEl: "Προωθητικά",
    labelEn: "Marketing",
    descEl: "Τα προωθητικά cookies χρησιμοποιούνται για την προβολή σχετικών διαφημίσεων.",
    descEn: "Marketing cookies are used to show relevant advertisements.",
    count: 0,
  },
  {
    key: "unclassified",
    labelEl: "Αταξινόμητα",
    labelEn: "Unclassified",
    descEl: "Cookies που δεν έχουν ακόμα κατηγοριοποιηθεί.",
    descEn: "Cookies that have not yet been categorized.",
    count: 0,
  },
];

const CookieConsent = () => {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(defaultPrefs);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      // Small delay so page loads first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveAndClose = useCallback((preferences: CookiePreferences) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences));
    setVisible(false);
  }, []);

  const acceptAll = () => {
    const all: CookiePreferences = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
      unclassified: true,
    };
    setPrefs(all);
    saveAndClose(all);
  };

  const acceptSelected = () => {
    saveAndClose(prefs);
  };

  const togglePref = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-background border-t border-border shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 relative">
          {/* Close button */}
          <button
            onClick={acceptSelected}
            className="absolute top-4 right-4 sm:right-6 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {/* Header */}
          <h3 className="text-lg font-bold text-foreground pr-8">
            {lang === "el" ? "Χρησιμοποιούμε cookies" : "We use cookies"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "el"
              ? "Μπορείτε να επιλέξετε ποια θα είναι ενεργά."
              : "You can choose which ones are active."}
          </p>

          {/* Settings panel */}
          {showSettings && (
            <div className="mt-4 border border-border rounded-lg divide-y divide-border overflow-hidden">
              {categories.map((cat) => {
                const isExpanded = expandedCat === cat.key;
                return (
                  <div key={cat.key}>
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCat(isExpanded ? null : cat.key)}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {lang === "el" ? cat.labelEl : cat.labelEn} ({cat.count})
                      </span>
                      <div className="flex items-center gap-3">
                        {cat.locked ? (
                          <span className="text-xs text-muted-foreground font-medium">
                            Locked
                          </span>
                        ) : (
                          <Switch
                            checked={prefs[cat.key]}
                            onCheckedChange={() => togglePref(cat.key)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 text-xs text-muted-foreground bg-muted/30">
                        {lang === "el" ? cat.descEl : cat.descEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4">
            {!showSettings ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-1.5"
                >
                  {lang === "el" ? "Ρυθμίσεις" : "Settings"}
                  <ChevronDown size={14} />
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  {lang === "el" ? "Αποδοχή όλων" : "Accept all"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={acceptSelected}>
                  {lang === "el" ? "Αποδοχή επιλεγμένων" : "Accept selected"}
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  {lang === "el" ? "Αποδοχή όλων" : "Accept all"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
