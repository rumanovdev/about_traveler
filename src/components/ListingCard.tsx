import { MapPin, Heart, Star, ChevronLeft, ChevronRight, Users, BedDouble, DoorOpen } from "lucide-react";
import { useState, useCallback, useRef } from "react";

const catAccommodation = "/assets/cat-accommodation.jpg";

interface ListingCardProps {
  listing: {
    id: string;
    business_name: string;
    slug: string;
    description: string | null;
    location: string | null;
    phone: string | null;
    images: string[] | null;
    type: string | null;
    capacity?: number | null;
    rooms?: number | null;
    beds?: number | null;
    price_from?: number | null;
    price_to?: number | null;
    rating?: number | null;
    review_count?: number | null;
    amenities?: string[] | null;
  };
  onHover?: (id: string | null) => void;
  highlighted?: boolean;
}

const typeLabels: Record<string, string> = {
  hotel: "Ξενοδοχείο", villa: "Βίλα", apartment: "Διαμέρισμα", studio: "Στούντιο",
  rooms: "Δωμάτια", guesthouse: "Ξενώνας", "fast-food": "Fast food", pub: "Pub",
  "wine-bar": "Wine bar", vegan: "Βίγκαν", restaurant: "Εστιατόριο",
  pastry: "Ζαχαροπλαστείο", italian: "Ιταλικό", coffee: "Καφές & Ποτό",
  cafeteria: "Καφετέρια", club: "Κλάμπ", "cocktail-bar": "Κοκτέιλ μπαρ",
  bar: "Μπαρ", "bar-restaurant": "Μπαρ εστιατόριο", burger: "Μπέργκερ",
  pizza: "Πίτσα", breakfast: "Πρωινό", taverna: "Ταβέρνα",
  healthy: "Υγιεινό φαγητό", bakery: "Φούρνος",
  economy: "Οικονομικό", suv: "SUV", luxury: "Πολυτελές", van: "Van",
  convertible: "Κάμπριο", automatic: "Αυτόματο", scooter: "Σκούτερ",
  motorcycle: "Μηχανή", atv: "ATV / Γουρούνα", ebike: "Ηλεκτρικό ποδήλατο",
};

const ListingCard = ({ listing, onHover, highlighted }: ListingCardProps) => {
  const images = listing.images?.length ? listing.images : [catAccommodation];
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setImgIdx((i) => (i + 1) % images.length);
      else setImgIdx((i) => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  };

  const typeLabel = listing.type ? (typeLabels[listing.type] || listing.type) : null;
  const rating = listing.rating ? Number(listing.rating) : null;
  const isNew = !rating;
  const showArrows = images.length > 1 && (isHovered);

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-200 ${highlighted ? "scale-[1.01]" : ""}`}
      onMouseEnter={() => { onHover?.(listing.id); setIsHovered(true); }}
      onMouseLeave={() => { onHover?.(null); setIsHovered(false); }}
    >
      {/* Image carousel */}
      <div
        className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-muted"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* All images stacked, only active one visible */}
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={listing.business_name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
            style={{ opacity: i === imgIdx ? 1 : 0, zIndex: i === imgIdx ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        {/* Gradient bottom for dots visibility */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none rounded-b-2xl" />
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
            {images.slice(0, 8).map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all duration-200"
                style={{
                  width: i === imgIdx ? 8 : 6,
                  height: i === imgIdx ? 8 : 6,
                  background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </div>
        )}

        {/* Prev/Next buttons — always visible on mobile, hover on desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center z-20 transition-all duration-200 ${showArrows ? "opacity-100 scale-100" : "opacity-0 scale-90"} md:group-hover:opacity-100 md:group-hover:scale-100`}
              aria-label="Προηγούμενη"
            >
              <ChevronLeft size={15} className="text-foreground" />
            </button>
            <button
              onClick={next}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center z-20 transition-all duration-200 ${showArrows ? "opacity-100 scale-100" : "opacity-0 scale-90"} md:group-hover:opacity-100 md:group-hover:scale-100`}
              aria-label="Επόμενη"
            >
              <ChevronRight size={15} className="text-foreground" />
            </button>
          </>
        )}

        {/* Badge */}
        {isNew && (
          <span className="absolute top-3 left-3 text-xs font-semibold bg-white text-foreground px-2.5 py-1 rounded-full shadow-sm z-20">
            Νέο
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 z-20 p-1"
          aria-label="Αποθήκευση"
        >
          <Heart
            size={24}
            className={`transition-all drop-shadow-md ${liked ? "fill-rose-500 text-rose-500 scale-110" : "fill-black/20 text-white"}`}
          />
        </button>
      </div>

      {/* Content */}
      <a href={`/listing/${listing.slug}`} className="block pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 flex-1">
            {listing.business_name}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={13} className="fill-foreground text-foreground" />
              <span className="text-sm font-medium">{rating.toFixed(2)}</span>
              {listing.review_count ? <span className="text-xs text-muted-foreground">({listing.review_count})</span> : null}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {typeLabel && <span>{typeLabel}{listing.location ? " · " : ""}</span>}
          {listing.location && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={11} className="inline shrink-0" />
              {listing.location}
            </span>
          )}
        </p>

        {(listing.rooms || listing.beds || listing.capacity) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            {listing.rooms && <span className="flex items-center gap-1"><DoorOpen size={11} />{listing.rooms} δωμ.</span>}
            {listing.beds && <span className="flex items-center gap-1"><BedDouble size={11} />{listing.beds} κρεβ.</span>}
            {listing.capacity && <span className="flex items-center gap-1"><Users size={11} />{listing.capacity} άτομα</span>}
          </div>
        )}

        <div className="mt-2">
          {listing.price_from != null ? (
            <p className="text-sm text-foreground">
              <span className="font-semibold">
                {listing.price_to != null
                  ? `€${listing.price_from.toFixed(0)} – €${listing.price_to.toFixed(0)}`
                  : `€${listing.price_from.toFixed(0)}`}
              </span>
              <span className="font-normal text-muted-foreground"> / νύχτα</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Επικοινωνήστε για τιμή</p>
          )}
        </div>
      </a>
    </div>
  );
};

export default ListingCard;
