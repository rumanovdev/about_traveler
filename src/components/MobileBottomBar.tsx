import { useState } from "react";
import { Search, Heart, User, MessageSquare, Menu, Globe, Home, Car, UtensilsCrossed, Building, LogOut, UserPlus, MapPin, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";

const MobileBottomBar = () => {
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { query, predictions, isOpen, search, select, close } = usePlacesAutocomplete();

  if (path.startsWith("/dashboard") || path.startsWith("/admin")) return null;

  const categories = [
    { label: t.accommodation, slug: "diamonh", icon: Building },
    { label: "Car & Moto", slug: "car-moto", icon: Car },
    { label: t.restaurants, slug: "restaurants", icon: UtensilsCrossed },
  ];

  const navItems = [
    { icon: Search, label: lang === "el" ? "Αναζήτηση" : "Search", action: "search" },
    { icon: Heart, label: lang === "el" ? "Αγαπημένα" : "Favorites", path: user ? "/dashboard?tab=favorites" : "/auth" },
    { icon: User, label: lang === "el" ? "Προφίλ" : "Profile", path: user ? "/dashboard" : "/auth", primary: true },
    { icon: MessageSquare, label: lang === "el" ? "Μηνύματα" : "Messages", path: user ? "/dashboard?tab=messages" : "/auth" },
    { icon: Menu, label: lang === "el" ? "Μενού" : "Menu", action: "menu" },
  ];

  const handleNav = (to: string) => {
    setMenuOpen(false);
    setSearchOpen(false);
    window.location.href = to;
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = item.path === path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action === "menu") {
                    setMenuOpen(true);
                  } else if (item.action === "search") {
                    setSearchOpen(true);
                  } else if (item.path) {
                    window.location.href = item.path;
                  }
                }}
                className="flex flex-col items-center gap-0.5 min-w-[3rem]"
              >
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors ${
                    item.primary
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon size={20} />
                </div>
                <span className={`text-[10px] font-medium ${item.primary ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Search Sheet - full screen overlay to avoid keyboard issues on iOS */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="h-[100dvh] flex flex-col p-0 border-0 [&>button]:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-2 border-b border-border bg-background">
            <SheetHeader className="flex-1 py-3">
              <SheetTitle className="text-left text-lg">
                {lang === "el" ? "Τι ψάχνετε;" : "What are you looking for?"}
              </SheetTitle>
            </SheetHeader>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Search Input */}
            <div className="relative mb-5" onPointerDown={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 bg-accent/50 border border-border rounded-xl px-4 py-3.5">
                <Search size={18} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => search(e.currentTarget.value)}
                  onInput={(e) => search((e.currentTarget as HTMLInputElement).value)}
                  placeholder={lang === "el" ? "Δοκιμάστε 'Σύρος'..." : "Try 'Syros'..."}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none appearance-none"
                  style={{ fontSize: "16px" }}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="off"
                  inputMode="search"
                  enterKeyHint="search"
                />
                {query && (
                  <button type="button" onClick={() => search("")} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Autocomplete Results */}
              {isOpen && predictions.length > 0 && (
                <div className="mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                  {predictions.map((p) => (
                    <button
                      key={p.place_id}
                      type="button"
                      onClick={() => {
                        select(p);
                        setSearchOpen(false);
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

            {/* Quick Category Links */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
              {lang === "el" ? "Κατηγορίες" : "Categories"}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleNav(`/${cat.slug}`)}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-accent/40 border border-border hover:bg-accent transition-colors min-w-0"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                    <cat.icon size={16} />
                  </div>
                  <span className="text-xs font-medium text-foreground text-left leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[80vh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-left">{lang === "el" ? "Μενού" : "Menu"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-1 mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {lang === "el" ? "Κατηγορίες" : "Categories"}
            </p>
            {categories.map((cat) => (
              <button key={cat.slug} onClick={() => handleNav(`/${cat.slug}`)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium text-foreground">
                <cat.icon size={18} className="text-muted-foreground" />
                {cat.label}
              </button>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {lang === "el" ? "Γλώσσα" : "Language"}
            </p>
            <div className="flex gap-2 px-1">
              <button
                onClick={() => setLang("el")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  lang === "el" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                }`}
              >
                🇬🇷 Ελληνικά
              </button>
              <button
                onClick={() => setLang("en")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  lang === "en" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="space-y-1">
            <button onClick={() => handleNav("/partner-register")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-semibold text-primary">
              <Home size={18} />
              {lang === "el" ? "Καταχώρησε την επιχείρησή σου" : "Host your place"}
            </button>
            <button onClick={() => handleNav("/how-it-works")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium text-foreground">
              <Globe size={18} className="text-muted-foreground" />
              {lang === "el" ? "Πώς λειτουργεί" : "How it works"}
            </button>
          </div>

          {user ? (
            <>
              <Separator className="my-3" />
              <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive">
                <LogOut size={18} />
                {t.signOut}
              </button>
            </>
          ) : (
            <>
              <Separator className="my-3" />
              <button onClick={() => handleNav("/auth")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium text-foreground">
                <UserPlus size={18} className="text-muted-foreground" />
                {t.signIn}
              </button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileBottomBar;
