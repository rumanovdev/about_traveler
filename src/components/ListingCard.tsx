import { MapPin, Heart, Star, ChevronLeft, ChevronRight, Users, BedDouble, DoorOpen } from "lucide-react";
import { useState, useCallback } from "react";

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

  const typeLabel = listing.type ? (typeLabels[listing.type] || listing.type) : null;
  const rating = listing.rating ? Number(listing.rating) : null;
  const isNew = !rating;

  return (
    <div
      className={`group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 ${highlighted ? "ring-2 ring-primary shadow-xl scale-[1.01]" : "hover:shadow-lg"}`}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image carousel */}
      <a href={`/listing/${listing.slug}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted rounded-2xl">
          <img
            src={images[imgIdx]}
            alt={listing.business_name}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
          />

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`block rounded-full transition-all ${i === imgIdx ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-white/60"}`}
                />
              ))}
            </div>
          )}

          {/* Prev/Next buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Badge */}
          {isNew && (
            <span className="absolute top-3 left-3 text-xs font-semibold bg-white text-foreground px-2.5 py-1 rounded-full shadow-sm z-10">
              Νέο
            </span>
          )}
        </div>
      </a>

      {/* Favorite */}
      <button
        onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
        className="absolute top-3 right-3 z-10 p-1.5"
        aria-label="Αποθήκευση"
      >
        <Heart
          size={22}
          className={`drop-shadow transition-colors ${liked ? "fill-rose-500 text-rose-500" : "fill-black/20 text-white"}`}
        />
      </button>

      {/* Content */}
      <a href={`/listing/${listing.slug}`} className="block pt-3 pb-1 px-0.5">
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

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {typeLabel && <span>{typeLabel}{listing.location ? " · " : ""}</span>}
          {listing.location && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={11} className="inline shrink-0" />
              {listing.location}
            </span>
          )}
        </p>

        {/* Details (rooms/beds/capacity) */}
        {(listing.rooms || listing.beds || listing.capacity) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            {listing.rooms && <span className="flex items-center gap-1"><DoorOpen size={11} />{listing.rooms} δωμ.</span>}
            {listing.beds && <span className="flex items-center gap-1"><BedDouble size={11} />{listing.beds} κρεβ.</span>}
            {listing.capacity && <span className="flex items-center gap-1"><Users size={11} />{listing.capacity} άτομα</span>}
          </div>
        )}

        {/* Price */}
        <div className="mt-2">
          {listing.price_from != null ? (
            <p className="text-sm text-foreground">
              <span className="font-semibold">
                {listing.price_to != null
                  ? `€${listing.price_from.toFixed(0)} – €${listing.price_to.toFixed(0)}`
                  : `από €${listing.price_from.toFixed(0)}`}
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
