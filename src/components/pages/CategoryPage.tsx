
import NotFound from "@/components/pages/NotFound";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Map, LayoutGrid } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SEOHead from "@/components/SEOHead";
import CategoryFilters from "@/components/CategoryFilters";
import type { FilterGroup } from "@/components/CategoryFilters";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { getListingsByCategory } from "@/lib/api";
import { expandLocationQuery } from "@/lib/greekLocationMap";

const ListingsMap = lazy(() => import("@/components/ListingsMap"));

const catAccommodation = "/assets/cat-accommodation.jpg";
const catCarRental = "/assets/cat-car-rental.jpg";
const catRestaurants = "/assets/cat-restaurants.jpg";
const catActivities = "/assets/cat-activities.jpg";


const categoryMeta: Record<string, { title: string; seoTitle: string; subtitle: string; description: string; image: string; fetchSlugs?: string }> = {
  diamonh: {
    title: "Διαμονή",
    seoTitle: "Διαμονή στην Ελλάδα | Ξενοδοχεία & Καταλύματα",
    subtitle: "Ξενοδοχεία, Βίλες & Διαμερίσματα",
    description: "Βρείτε ξενοδοχεία, βίλες και καταλύματα σε όλη την Ελλάδα. Δείτε φωτογραφίες και στοιχεία επικοινωνίας για την ιδανική διαμονή στο ταξίδι σας.",
    image: catAccommodation,
  },
  "car-moto": {
    title: "Car & Moto",
    seoTitle: "Car & Moto Rental Ελλάδα | Ενοικίαση Αυτοκινήτου & Μηχανής",
    subtitle: "Αυτοκίνητα, Μηχανές & Σκούτερ",
    description: "Ανακαλύψτε εταιρείες ενοικίασης αυτοκινήτων και μηχανών σε όλη την Ελλάδα. Δείτε υπηρεσίες και επικοινωνήστε απευθείας με τους συνεργάτες.",
    image: catCarRental,
    fetchSlugs: "car-rental,moto-rental",
  },
  restaurants: {
    title: "Φαγητό & Ποτό",
    seoTitle: "Φαγητό & Ποτό Ελλάδα | Προτάσεις Φαγητού",
    subtitle: "Γεύσεις που αξίζει να δοκιμάσετε",
    description: "Ανακαλύψτε φαγητό και ποτό σε όλη την Ελλάδα. Δείτε φωτογραφίες, περιγραφή και επικοινωνία για να επιλέξετε το ιδανικό μέρος.",
    image: catRestaurants,
  },
  activities: {
    title: "Δραστηριότητες",
    seoTitle: "Δραστηριότητες στην Ελλάδα | Activities & Εμπειρίες",
    subtitle: "Περιπέτεια & Αναψυχή",
    description: "Ανακαλύψτε δραστηριότητες και εμπειρίες σε όλη την Ελλάδα. Quad Safari, θαλάσσια σπορ, εκδρομές και πολλά ακόμη.",
    image: catActivities,
  },
};

const categoryFilters: Record<string, FilterGroup[]> = {
  diamonh: [
    {
      key: "location",
      title: "Τοποθεσία",
      type: "location",
      options: [],
    },
    {
      key: "dates",
      title: "Ημερομηνίες",
      type: "dates",
      options: [],
    },
    {
      key: "visitors",
      title: "Επισκέπτες",
      type: "counter",
      options: [],
      counterOptions: [
        { key: "adults", label: "Ενήλικες" },
        { key: "children", label: "Παιδιά" },
        { key: "infants", label: "Βρέφη", note: "Τα βρέφη δεν προσμετρούνται στο συνολικό αριθμό των επισκεπτών." },
      ],
    },
    {
      key: "price",
      title: "Εύρος τιμών",
      type: "price-range",
      options: [],
    },
    {
      key: "type",
      title: "Κατηγορία",
      options: [
        { value: "hotel", label: "Ξενοδοχείο" },
        { value: "villa", label: "Βίλα" },
        { value: "apartment", label: "Διαμέρισμα" },
        { value: "studio", label: "Στούντιο" },
        { value: "rooms", label: "Δωμάτια" },
        { value: "guesthouse", label: "Ξενώνας" },
      ],
    },
    {
      key: "amenities",
      title: "Παροχές",
      options: [
        { value: "wifi", label: "WiFi" },
        { value: "coffee-maker", label: "Καφετιέρα" },
        { value: "ac", label: "Κλιματιστικό" },
        { value: "washing-machine", label: "Πλυντήριο" },
        { value: "kitchen", label: "Κουζίνα" },
        { value: "tv", label: "Τηλεόραση" },
        { value: "hairdryer", label: "Πιστολάκι" },
        { value: "iron", label: "Σίδερο" },
      ],
    },
    {
      key: "facilities",
      title: "Εγκαταστάσεις",
      options: [
        { value: "parking", label: "Parking" },
        { value: "pool", label: "Πισίνα" },
        { value: "garden", label: "Κήπος" },
        { value: "balcony", label: "Μπαλκόνι" },
        { value: "bbq", label: "BBQ" },
        { value: "gym", label: "Γυμναστήριο" },
        { value: "spa", label: "Spa" },
      ],
    },
    {
      key: "rules",
      title: "Ειδικοί κανόνες",
      options: [
        { value: "instant-booking", label: "Instant booking" },
        { value: "self-checkin", label: "Self check-in" },
        { value: "no-smoking", label: "Δεν επιτρέπεται το κάπνισμα" },
        { value: "pets-allowed", label: "Επιτρέπονται κατοικίδια" },
        { value: "parties-allowed", label: "Επιτρέπονται πάρτυ και εκδηλώσεις" },
        { value: "baby-friendly", label: "Κατάλληλο για βρέφη (κάτω των 2 ετών)" },
        { value: "smoker-friendly", label: "Κατάλληλο για καπνίζοντες" },
      ],
    },
  ],
  "car-moto": [
    {
      key: "location",
      title: "Τοποθεσία",
      type: "location",
      options: [],
    },
    {
      key: "dates",
      title: "Ημερομηνίες",
      type: "dates",
      options: [],
    },
    {
      key: "price",
      title: "Εύρος τιμών",
      type: "price-range",
      options: [],
    },
    {
      key: "type",
      title: "Είδος",
      options: [
        { value: "economy", label: "Οικονομικό" },
        { value: "suv", label: "SUV" },
        { value: "luxury", label: "Πολυτελές" },
        { value: "van", label: "Van" },
        { value: "convertible", label: "Κάμπριο" },
        { value: "automatic", label: "Αυτόματο" },
        { value: "scooter", label: "Σκούτερ" },
        { value: "motorcycle", label: "Μηχανή" },
        { value: "atv", label: "ATV / Γουρούνα" },
        { value: "ebike", label: "Ηλεκτρικό ποδήλατο" },
      ],
    },
  ],
  restaurants: [
    {
      key: "location",
      title: "Τοποθεσία",
      type: "location",
      options: [],
    },
    {
      key: "price",
      title: "Εύρος τιμών",
      type: "price-range",
      options: [],
    },
    {
      key: "type",
      title: "Είδος",
      options: [
        { value: "fast-food", label: "Fast food" },
        { value: "pub", label: "Pub" },
        { value: "wine-bar", label: "Wine bar" },
        { value: "vegan", label: "Βίγκαν" },
        { value: "restaurant", label: "Εστιατόριο" },
        { value: "pastry", label: "Ζαχαροπλαστείο" },
        { value: "italian", label: "Ιταλικό" },
        { value: "coffee", label: "Καφές και ποτό" },
        { value: "cafeteria", label: "Καφετέρια" },
        { value: "club", label: "Κλάμπ" },
        { value: "cocktail-bar", label: "Κοκτέιλ μπαρ" },
        { value: "bar", label: "Μπαρ" },
        { value: "bar-restaurant", label: "Μπαρ εστιατόριο" },
        { value: "burger", label: "Μπέργκερ" },
        { value: "pizza", label: "Πίτσα" },
        { value: "breakfast", label: "Πρωινό" },
        { value: "taverna", label: "Ταβέρνα" },
        { value: "healthy", label: "Υγιεινό φαγητό" },
        { value: "bakery", label: "Φούρνος" },
      ],
    },
    {
      key: "recommended",
      title: "Προτείνεται για",
      options: [
        { value: "unique-environment", label: "Μοναδικό περιβάλλον" },
        { value: "family", label: "Οικογένεια" },
        { value: "romantic", label: "Ρομαντικό" },
        { value: "group", label: "Παρέα" },
        { value: "sea-view", label: "Θέα θάλασσα" },
        { value: "live-music", label: "Live μουσική" },
      ],
    },
  ],
  activities: [
    {
      key: "location",
      title: "Τοποθεσία",
      type: "location",
      options: [],
    },
    {
      key: "dates",
      title: "Ημερομηνίες",
      type: "dates",
      options: [],
    },
    {
      key: "price",
      title: "Εύρος τιμών",
      type: "price-range",
      options: [],
    },
    {
      key: "type",
      title: "Είδος",
      options: [
        { value: "quad-safari", label: "Quad Safari" },
        { value: "water-sports", label: "Θαλάσσια σπορ" },
        { value: "hiking", label: "Πεζοπορία" },
        { value: "boat-tour", label: "Βαρκάδα / Boat tour" },
        { value: "diving", label: "Κατάδυση" },
        { value: "cycling", label: "Ποδηλασία" },
        { value: "wine-tasting", label: "Γευσιγνωσία" },
        { value: "cultural", label: "Πολιτιστικά" },
      ],
    },
  ],
};

const PAGE_SIZE = 24;

const validSlugs = Object.keys(categoryMeta);

const CategoryPage = ({ slug }: { slug: string }) => {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isMobile = useIsMobile();
  const locationParam = searchParams.get("location") || "";
  const [searchQuery, setSearchQuery] = useState(locationParam);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState(0);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);

  // If slug is not a valid category, show 404
  if (!slug || !validSlugs.includes(slug)) {
    return <NotFound />;
  }

  const meta = categoryMeta[slug];

  const apiFilters = {
    type: activeFilters["type"] || [],
    recommended: activeFilters["recommended"] || [],
  };

  const fetchSlug = meta.fetchSlugs || slug;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["listings", slug, apiFilters, page],
    queryFn: () => getListingsByCategory(fetchSlug, apiFilters, page, PAGE_SIZE),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });

  const listings = data?.listings ?? (Array.isArray(data) ? data : []);
  const total = data?.total ?? listings.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Combine searchQuery and location filter for filtering
  const locationFilterValue = (activeFilters["location"] || [])[0] || "";
  const combinedSearch = [searchQuery.trim(), locationFilterValue.trim()].filter(Boolean).join(" ");

  const filteredListings = combinedSearch
    ? (() => {
        const expandedWords = expandLocationQuery(combinedSearch);
        return listings.filter((l: any) => {
          const searchableText = [l.business_name, l.location, l.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return expandedWords.some((word: string) => searchableText.includes(word));
        });
      })()
    : listings;

  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <>
      <SEOHead title={meta.seoTitle || meta.title} description={meta.description} path={`/${slug}`} />
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <img
          src={meta.image}
          alt={meta.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-3">
            {meta.title}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-xl mx-auto">
            {meta.subtitle}
          </p>
        </div>
      </section>

      {/* Search & Content */}
      <main className="py-8 bg-background">
        <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-70" : "opacity-100"}`}>
          {/* Filters + map toggle */}
          <div className="px-4 md:px-8 mb-6 flex flex-wrap items-center gap-3">
            {(categoryFilters[slug || ""] || []).length > 0 && (
              isMobile ? (
                <MobileFilterSheet
                  filterGroups={categoryFilters[slug || ""] || []}
                  activeFilters={activeFilters}
                  onApplyFilters={(f) => { setActiveFilters(f); setPage(0); }}
                  onLocationCoords={(lat, lng) => setMapCenter([lat, lng])}
                />
              ) : (
                <CategoryFilters
                  filterGroups={categoryFilters[slug || ""] || []}
                  activeFilters={activeFilters}
                  onApplyFilters={(f) => { setActiveFilters(f); setPage(0); }}
                  onLocationCoords={(lat, lng) => setMapCenter([lat, lng])}
                />
              )
            )}
            <div className="ml-auto flex items-center gap-3">
              {!isLoading && (
                <span className="text-sm text-muted-foreground hidden md:block">{total} αποτελέσματα</span>
              )}
              <button
                onClick={() => setShowMap((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-sm font-medium hover:bg-accent transition-colors shadow-sm"
              >
                {showMap ? <><LayoutGrid size={15} /><span className="hidden sm:inline">Λίστα</span></> : <><Map size={15} /><span className="hidden sm:inline">Χάρτης</span></>}
              </button>
            </div>
          </div>

          {/* Split view — Airbnb layout */}
          <div className={showMap && !isMobile ? "flex items-start" : "px-4 md:px-8"}>

            {/* LEFT: Listings — page scrolls naturally */}
            <div className={showMap && !isMobile ? "w-[54%] px-4 md:px-8" : "w-full"}>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl animate-pulse">
                      <div className="aspect-[4/3] bg-muted rounded-2xl" />
                      <div className="pt-3 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    Δεν βρέθηκαν καταχωρίσεις{searchQuery ? " για την αναζήτησή σας" : " σε αυτήν την κατηγορία"}.
                  </p>
                </div>
              ) : (
                <div className={`grid gap-5 ${showMap && !isMobile ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                  {filteredListings.map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onHover={setHoveredListingId}
                      highlighted={hoveredListingId === listing.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Sticky map — stays fixed while page scrolls */}
            {showMap && !isMobile && (
              <div className="hidden lg:block flex-1 sticky top-20 pr-6 self-start" style={{ height: "calc(100vh - 160px)" }}>
                <Suspense fallback={<div className="w-full h-full rounded-2xl bg-muted animate-pulse" />}>
                  <ListingsMap
                    listings={filteredListings.filter((l: any) => l.latitude && l.longitude)}
                    hoveredId={hoveredListingId}
                    center={mapCenter}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === 0}
                className="p-2 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="text-foreground" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
                .reduce<(number | "dots")[]>((acc, i, idx, arr) => {
                  if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("dots");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "dots" ? (
                    <span key={`dots-${idx}`} className="px-2 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => { setPage(item); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        page === item
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {item + 1}
                    </button>
                  )
                )}
              <button
                onClick={() => { setPage(Math.min(totalPages - 1, page + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="text-foreground" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CategoryPage;
