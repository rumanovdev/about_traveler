import { MapPin, Heart, Tag, Users, BedDouble, DoorOpen, Euro } from "lucide-react";
import { useState } from "react";
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
  };
}

const typeLabels: Record<string, string> = {
  hotel: "Ξενοδοχείο", villa: "Βίλα", apartment: "Διαμέρισμα", studio: "Στούντιο",
  rooms: "Δωμάτια", guesthouse: "Ξενώνας", "fast-food": "Fast food", pub: "Pub",
  "wine-bar": "Wine bar", vegan: "Βίγκαν", restaurant: "Εστιατόριο",
  pastry: "Ζαχαροπλαστείο", italian: "Ιταλικό", coffee: "Καφές και ποτό",
  cafeteria: "Καφετέρια", club: "Κλάμπ", "cocktail-bar": "Κοκτέιλ μπαρ",
  bar: "Μπαρ", "bar-restaurant": "Μπαρ εστιατόριο", burger: "Μπέργκερ",
  pizza: "Πίτσα", breakfast: "Πρωινό", taverna: "Ταβέρνα",
  healthy: "Υγιεινό φαγητό", bakery: "Φούρνος",
  economy: "Οικονομικό",
  suv: "SUV", luxury: "Πολυτελές", van: "Van", convertible: "Κάμπριο",
  automatic: "Αυτόματο", scooter: "Σκούτερ", motorcycle: "Μηχανή",
  atv: "ATV / Γουρούνα", ebike: "Ηλεκτρικό ποδήλατο",
};

const ListingCard = ({ listing }: ListingCardProps) => {
  const image = listing.images?.[0] || catAccommodation;
  const [liked, setLiked] = useState(false);

  const typeLabel = listing.type ? (typeLabels[listing.type] || listing.type) : null;
  const hasDetails = listing.capacity || listing.rooms || listing.beds;

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <a href={`/listing/${listing.slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden relative">
          <img src={image} alt={listing.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
      </a>

      {/* Favorite button */}
      <button
        onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
      >
        <Heart size={18} className={liked ? "fill-primary text-primary" : "text-foreground"} />
      </button>

      {/* Content */}
      <div className="p-5">
        <a href={`/listing/${listing.slug}`}>
          <h3 className="text-base font-display font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {listing.business_name}
          </h3>
        </a>

        {/* Details */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mb-3">
          {/* Inline details row */}
          {hasDetails && (
            <div className="flex items-center gap-3 flex-wrap">
              {listing.capacity && (
                <span className="flex items-center gap-1">
                  <Users size={14} className="shrink-0" />
                  {listing.capacity}
                </span>
              )}
              {listing.rooms && (
                <span className="flex items-center gap-1">
                  <DoorOpen size={14} className="shrink-0" />
                  {listing.rooms}
                </span>
              )}
              {listing.beds && (
                <span className="flex items-center gap-1">
                  <BedDouble size={14} className="shrink-0" />
                  {listing.beds}
                </span>
              )}
            </div>
          )}

          {listing.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" />
              <span className="line-clamp-1">{listing.location}</span>
            </span>
          )}

          {typeLabel && (
            <span className="flex items-center gap-1.5">
              <Tag size={14} className="shrink-0" />
              <span>{typeLabel}</span>
            </span>
          )}
        </div>

        {/* Price */}
        <div className="border-t border-border pt-3">
          {listing.price_from != null ? (
            <span className="text-lg font-bold text-primary">
              {listing.price_to != null
                ? `${listing.price_from.toFixed(2)}€ – ${listing.price_to.toFixed(2)}€`
                : `από ${listing.price_from.toFixed(2)}€`}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Επικοινωνήστε για τιμή</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
