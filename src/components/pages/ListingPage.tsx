
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
              <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 sticky top-24">
                <h2 className="text-lg font-display font-semibold text-foreground">Επικοινωνία</h2>
                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    onClick={handlePhoneClick}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <span className="font-medium text-sm">{listing.phone}</span>
                  </a>
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
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe size={18} className="text-primary" />
                    </div>
                    <span className="font-medium text-sm">{listing.website.replace(/^https?:\/\//, "")}</span>
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

                <div className="border-t pt-4 mt-4">
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
