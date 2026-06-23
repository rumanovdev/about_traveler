
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { Phone, Mail, MapPin, ChevronLeft, ChevronRight, User, Users, BedDouble, DoorOpen, Euro, Tag, MessageCircle, Globe } from "lucide-react";
import ListingChat, { type ListingChatHandle } from "@/components/ListingChat";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ContactForm from "@/components/ContactForm";
import { getListingBySlug, trackListingEvent } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
const catAccommodation = "/assets/cat-accommodation.jpg";
import useEmblaCarousel from "embla-carousel-react";

const ListingPage = ({ slug }: { slug: string }) => {
  const { user } = useAuth();
  const chatRef = useRef<ListingChatHandle>(null);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", slug],
    queryFn: () => getListingBySlug(slug || ""),
    enabled: !!slug,
  });

  useEffect(() => {
    if (listing?.id) {
      trackListingEvent(listing.id, "view");
    }
  }, [listing?.id]);

  const handlePhoneClick = () => {
    if (listing?.id) trackListingEvent(listing.id, "phone_click");
  };

  const handleEmailClick = () => {
    if (listing?.id) trackListingEvent(listing.id, "email_click");
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 container animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-6 bg-muted rounded w-1/4 mb-6" />
          <div className="w-full aspect-[16/9] max-h-[500px] bg-muted rounded-2xl mb-8" />
          <div className="h-24 bg-muted rounded w-2/3" />
        </main>
        <Footer />
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 container text-center">
          <h1 className="text-3xl font-display font-bold text-foreground">Η καταχώριση δεν βρέθηκε</h1>
        </main>
        <Footer />
      </>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [catAccommodation];
  const category = listing.categories as { title: string; slug: string } | null;
  const catLabel = category?.title || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.business_name,
    description: listing.description,
    telephone: listing.phone,
    email: listing.email,
    image: images[0],
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.location,
      addressCountry: "GR",
    },
    category: catLabel,
  };

  return (
    <>
      <SEOHead
        title={`${listing.business_name} | ${catLabel}`}
        description={`Δείτε πληροφορίες για το ${listing.business_name}. Φωτογραφίες, περιγραφή και στοιχεία επικοινωνίας για την υπηρεσία ${catLabel}.`}
        path={`/listing/${listing.slug}`}
        image={images[0]}
        jsonLd={jsonLd}
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header info */}
          <div className="max-w-4xl mx-auto mb-8">
            {catLabel && (
              <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-4">
                {catLabel}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              {listing.business_name}
            </h1>
            {listing.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>{listing.location}</span>
              </div>
            )}
          </div>

          {/* Image Carousel */}
          <div className="max-w-4xl mx-auto mb-10">
            <ImageCarousel images={images} alt={listing.business_name} />
          </div>

          {/* Details, Description, Owner & Contact */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Quick details */}
              <DetailsBadges listing={listing} />

              {listing.description && (
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">Περιγραφή</h2>
                  <p className="text-foreground/80 text-lg leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Owner section */}
              <OwnerSection userId={listing.user_id} />
            </div>

            <div>
              <div className="bg-secondary/50 rounded-2xl p-8 space-y-4 sticky top-24 mb-8">
                {/* Book Now + WhatsApp */}
                <h2 className="text-lg font-display font-semibold text-foreground">Book Now</h2>
                {listing.phone && (
                  <div className="flex gap-2">
                    <a
                      href={`tel:${listing.phone}`}
                      onClick={handlePhoneClick}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Phone size={18} />
                      <span>{listing.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${listing.phone.replace(/[^0-9+]/g, "").replace(/^\+/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                )}

                {listing.email && (
                  <a
                    href={`mailto:${listing.email}`}
                    onClick={handleEmailClick}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <span className="font-medium text-sm">{listing.email}</span>
                  </a>
                )}

                {listing.website && (
                  <a
                    href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors min-w-0 overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe size={18} className="text-primary" />
                    </div>
                    <span className="font-medium text-sm truncate">{listing.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}

                {/* Chat button - only for logged-in non-owners */}
                {user && user.id !== listing.user_id && (
                  <button
                    onClick={() => chatRef.current?.openChat()}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors w-full"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle size={18} className="text-primary" />
                    </div>
                    <span className="font-medium text-sm">Chat</span>
                  </button>
                )}

                {/* OR divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OR</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                {/* Request Booking form */}
                <div>
                  <h3 className="text-base font-display font-semibold text-foreground mb-3">Request Booking</h3>
                  <ContactForm listingId={listing.id} businessName={listing.business_name} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ListingChat
        ref={chatRef}
        listingId={listing.id}
        listingOwnerId={listing.user_id}
        businessName={listing.business_name}
      />
      <Footer />
    </>
  );
};

/* ── Owner Section ── */
function OwnerSection({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ["owner-profile", userId],
    queryFn: async () => {
      const [profileRes, roleRes] = await Promise.all([
        supabase
          .from("profiles_public" as any)
          .select("display_name")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
      ]);
      const profile = profileRes.data as unknown as { display_name: string | null } | null;
      const isAdmin = !!roleRes.data;
      return { profile, isAdmin };
    },
    enabled: !!userId,
  });

  const name = data?.isAdmin ? "Aboutraveller" : (data?.profile?.display_name || "Ιδιοκτήτης");

  return (
    <div>
      <h2 className="text-xl font-display font-semibold text-foreground mb-3">Ιδιοκτήτης</h2>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={20} className="text-primary" />
        </div>
        <span className="font-medium text-foreground">{name}</span>
      </div>
    </div>
  );
}

const typeLabels: Record<string, string> = {
  hotel: "Ξενοδοχείο", villa: "Βίλα", apartment: "Διαμέρισμα", studio: "Στούντιο",
  rooms: "Δωμάτια", guesthouse: "Ξενώνας", "fast-food": "Fast food", pub: "Pub",
  "wine-bar": "Wine bar", vegan: "Βίγκαν", restaurant: "Εστιατόριο",
  pastry: "Ζαχαροπλαστείο", italian: "Ιταλικό", coffee: "Καφές και ποτό",
  cafeteria: "Καφετέρια", club: "Κλάμπ", "cocktail-bar": "Κοκτέιλ μπαρ",
  bar: "Μπαρ", "bar-restaurant": "Μπαρ εστιατόριο", burger: "Μπέργκερ",
  pizza: "Πίτσα", breakfast: "Πρωινό", taverna: "Ταβέρνα",
  healthy: "Υγιεινό φαγητό", bakery: "Φούρνος", economy: "Οικονομικό",
  suv: "SUV", luxury: "Πολυτελές", van: "Van", convertible: "Κάμπριο",
  automatic: "Αυτόματο", scooter: "Σκούτερ", motorcycle: "Μηχανή",
  atv: "ATV / Γουρούνα", ebike: "Ηλεκτρικό ποδήλατο",
};

/* ── Details Badges ── */
function DetailsBadges({ listing }: { listing: any }) {
  const items: { icon: React.ReactNode; label: string }[] = [];

  if (listing.type) {
    const label = typeLabels[listing.type] || listing.type;
    items.push({ icon: <Tag size={16} />, label });
  }
  if (listing.capacity) {
    items.push({ icon: <Users size={16} />, label: `${listing.capacity} άτομα` });
  }
  if (listing.rooms) {
    items.push({ icon: <DoorOpen size={16} />, label: `${listing.rooms} δωμάτια` });
  }
  if (listing.beds) {
    items.push({ icon: <BedDouble size={16} />, label: `${listing.beds} κρεβάτια` });
  }
  if (listing.price_from != null) {
    const priceLabel = listing.price_to != null
      ? `${listing.price_from.toFixed(2)}€ – ${listing.price_to.toFixed(2)}€`
      : `από ${listing.price_from.toFixed(2)}€`;
    items.push({ icon: <Euro size={16} />, label: priceLabel });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/60 text-foreground text-sm font-medium"
        >
          <span className="text-primary">{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ── Image Carousel Component ── */
function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-muted shadow-lg">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-[16/9]">
                <img
                  src={src}
                  alt={`${alt} - ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md"
          >
            <ChevronRight size={20} className="text-foreground" />
          </button>
        </div>
      )}

    </div>
  );
}

export default ListingPage;
