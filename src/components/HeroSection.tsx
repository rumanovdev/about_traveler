import { useState, useRef, useEffect } from "react";
import { MapPin, Search, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
const heroBgWebp = "/assets/hero-bg.webp";
const heroBgMobileWebp = "/assets/hero-bg-mobile.webp";
const heroBgJpg = "/assets/hero-bg.jpg";



const HeroSection = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { t, lang } = useLanguage();
  const { query, predictions, isOpen, search, select, close } = usePlacesAutocomplete();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Category dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryRef = useRef<HTMLDivElement>(null);





  const categoryOptions = [
    { label: lang === "el" ? "Διαμονή" : "Accommodation", slug: "diamonh" },
    { label: "Car & Moto", slug: "car-moto" },
    { label: lang === "el" ? "Φαγητό & Ποτό" : "Food & Drink", slug: "restaurants" },
    { label: lang === "el" ? "Δραστηριότητες" : "Activities", slug: "activities" },
  ];


  const categoryFilters = [
    { label: t.accommodation, slug: "diamonh" },
    { label: "Car & Moto", slug: "car-moto" },
    { label: t.foodDrink, slug: "restaurants" },
    { label: t.activities, slug: "activities" },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) close();
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
      
      
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const locationParam = query ? `?location=${encodeURIComponent(query)}` : "";
    if (selectedCategory) {
      const cat = categoryOptions.find(c => c.label === selectedCategory);
      if (cat) window.location.href = `/${cat.slug}${locationParam}`;
    } else if (activeFilter) {
      window.location.href = `/${activeFilter}${locationParam}`;
    } else {
      // Default to accommodation if no category selected
      window.location.href = `/diamonh${locationParam}`;
    }
  };



  return (
    <section className="relative min-h-[100vh] flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroBgMobileWebp} type="image/webp" />
          <source srcSet={heroBgWebp} type="image/webp" />
          <img
            src={heroBgJpg}
            alt="Cappadocia hot air balloons"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            sizes="100vw"
            width={1920}
            height={1080}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-foreground/70" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center container px-4">
        {/* Category filters - visible above search on desktop only */}
        <div className="hidden md:flex flex-wrap justify-center gap-2 mb-8">
          {categoryFilters.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => {
                setActiveFilter(activeFilter === cat.slug ? null : cat.slug);
                window.location.href = `/${cat.slug}`;
              }}
              className={`px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 border-2 ${
                activeFilter === cat.slug
                  ? "bg-foreground text-primary-foreground border-foreground shadow-travel-lg"
                  : "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/40 backdrop-blur-md hover:bg-foreground hover:text-primary-foreground hover:border-foreground hover:backdrop-blur-none"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-4xl mb-4 md:mb-10 relative z-20">
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-travel-lg flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Location */}
            <div className="flex-1 relative z-10" ref={dropdownRef}>
              <label className="flex items-center gap-3 px-5 py-4 cursor-text">
                <MapPin size={18} className="text-foreground flex-shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => search(e.currentTarget.value)}
                  onInput={(e) => search((e.currentTarget as HTMLInputElement).value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent text-foreground placeholder:text-foreground text-sm focus:outline-none"
                  style={{ fontSize: "16px" }}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="off"
                  inputMode="search"
                  enterKeyHint="search"
                />
              </label>
              {isOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-travel-lg z-50 overflow-hidden">
                  {predictions.map((p) => (
                    <button key={p.place_id} type="button" onClick={() => select(p)} className="w-full text-left px-5 py-3 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3">
                      <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                      {p.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex-1 relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => { setCategoryOpen(!categoryOpen); }}
                className="w-full flex items-center gap-3 px-5 py-4"
              >
                <Search size={18} className="text-foreground flex-shrink-0" />
                <span className="text-sm text-foreground flex-1 text-left">{selectedCategory || (lang === "el" ? "Διαμονή" : "Accommodation")}</span>
                <ChevronDown size={16} className={`text-foreground transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </button>
              {categoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-travel-lg z-50 overflow-hidden">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.slug}
                      type="button"
                      onClick={() => { setSelectedCategory(opt.label); setCategoryOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-sm hover:bg-accent transition-colors ${selectedCategory === opt.label ? "text-primary font-semibold bg-accent" : "text-foreground"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>



            <button
              type="submit"
              className="m-2 px-5 py-4 md:py-3 rounded-xl bg-gradient-sky text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Category filters - visible below search on mobile only */}
        <div className="flex md:hidden flex-wrap justify-start gap-2 mb-6 w-full max-w-4xl px-2">
          {categoryFilters.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => {
                setActiveFilter(activeFilter === cat.slug ? null : cat.slug);
                window.location.href = `/${cat.slug}`;
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
                activeFilter === cat.slug
                  ? "bg-foreground text-primary-foreground border-foreground shadow-travel-lg"
                  : "bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30 backdrop-blur-md"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1] tracking-tight text-left w-full max-w-4xl mb-6">
          {t.heroTitle}
        </h1>

        <div className="w-full max-w-4xl flex gap-3">
          <button
            onClick={() => {
              document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-gradient-sky text-primary-foreground px-5 py-2.5 md:px-8 md:py-3.5 rounded-lg text-[11px] md:text-sm font-semibold hover:opacity-90 transition-opacity shadow-travel-lg"
          >
            {t.exploreCta}
          </button>
          <button
            onClick={() => window.location.href = "/partner-register"}
            className="md:hidden bg-gradient-sky text-primary-foreground px-4 py-2.5 rounded-lg text-[11px] font-semibold hover:opacity-90 transition-opacity shadow-travel-lg"
          >
            {lang === "el" ? "Καταχώρησε την επιχείρησή σου" : "List your business"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
