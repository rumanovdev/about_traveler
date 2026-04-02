import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableImage from "./SortableImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getCategories, createListing, updateListing, uploadListingImage } from "@/lib/api";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";

const AMENITIES_BY_CATEGORY: Record<string, { value: string; labelEl: string; icon: string }[]> = {
  diamonh: [
    { value: "wifi", labelEl: "WiFi", icon: "📶" },
    { value: "pool", labelEl: "Πισίνα", icon: "🏊" },
    { value: "parking", labelEl: "Parking", icon: "🅿️" },
    { value: "ac", labelEl: "A/C", icon: "❄️" },
    { value: "kitchen", labelEl: "Κουζίνα", icon: "🍳" },
    { value: "breakfast", labelEl: "Πρωινό", icon: "☕" },
    { value: "sea-view", labelEl: "Θέα θάλασσα", icon: "🌊" },
    { value: "balcony", labelEl: "Μπαλκόνι", icon: "🏠" },
    { value: "pets", labelEl: "Κατοικίδια OK", icon: "🐾" },
    { value: "jacuzzi", labelEl: "Jacuzzi", icon: "🛁" },
    { value: "gym", labelEl: "Γυμναστήριο", icon: "💪" },
    { value: "bbq", labelEl: "BBQ", icon: "🔥" },
  ],
  restaurants: [
    { value: "wifi", labelEl: "WiFi", icon: "📶" },
    { value: "parking", labelEl: "Parking", icon: "🅿️" },
    { value: "outdoor", labelEl: "Εξωτερικός χώρος", icon: "🌿" },
    { value: "sea-view", labelEl: "Θέα θάλασσα", icon: "🌊" },
    { value: "live-music", labelEl: "Live μουσική", icon: "🎵" },
    { value: "delivery", labelEl: "Delivery", icon: "🛵" },
    { value: "takeaway", labelEl: "Take away", icon: "📦" },
    { value: "vegan-options", labelEl: "Vegan επιλογές", icon: "🥗" },
    { value: "pets", labelEl: "Pet friendly", icon: "🐾" },
    { value: "reservation", labelEl: "Κρατήσεις", icon: "📅" },
  ],
  activities: [
    { value: "equipment", labelEl: "Εξοπλισμός included", icon: "🎒" },
    { value: "instructor", labelEl: "Εκπαιδευτής", icon: "👨‍🏫" },
    { value: "transfer", labelEl: "Transfer", icon: "🚌" },
    { value: "photos", labelEl: "Φωτογραφίες included", icon: "📸" },
    { value: "insurance", labelEl: "Ασφάλεια", icon: "🛡️" },
    { value: "kids", labelEl: "Κατάλληλο για παιδιά", icon: "👶" },
    { value: "beginner", labelEl: "Για αρχάριους", icon: "⭐" },
  ],
  "car-rental": [
    { value: "ac", labelEl: "A/C", icon: "❄️" },
    { value: "gps", labelEl: "GPS", icon: "🗺️" },
    { value: "automatic", labelEl: "Αυτόματο", icon: "⚙️" },
    { value: "unlimited-km", labelEl: "Unlimited km", icon: "🛣️" },
    { value: "insurance", labelEl: "Ασφάλεια", icon: "🛡️" },
    { value: "delivery", labelEl: "Παράδοση στο σπίτι", icon: "🚗" },
    { value: "airport", labelEl: "Pickup αεροδρόμιο", icon: "✈️" },
    { value: "child-seat", labelEl: "Παιδικό κάθισμα", icon: "👶" },
  ],
};
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: any;
  userId: string;
}

// Type options per category slug
const typeOptionsByCategory: Record<string, { value: string; labelEl: string; labelEn: string }[]> = {
  restaurants: [
    { value: "fast-food", labelEl: "Fast food", labelEn: "Fast food" },
    { value: "pub", labelEl: "Pub", labelEn: "Pub" },
    { value: "wine-bar", labelEl: "Wine bar", labelEn: "Wine bar" },
    { value: "vegan", labelEl: "Βίγκαν", labelEn: "Vegan" },
    { value: "restaurant", labelEl: "Εστιατόριο", labelEn: "Restaurant" },
    { value: "pastry", labelEl: "Ζαχαροπλαστείο", labelEn: "Pastry shop" },
    { value: "italian", labelEl: "Ιταλικό", labelEn: "Italian" },
    { value: "coffee", labelEl: "Καφές και ποτό", labelEn: "Coffee & drinks" },
    { value: "cafeteria", labelEl: "Καφετέρια", labelEn: "Cafeteria" },
    { value: "club", labelEl: "Κλάμπ", labelEn: "Club" },
    { value: "cocktail-bar", labelEl: "Κοκτέιλ μπαρ", labelEn: "Cocktail bar" },
    { value: "bar", labelEl: "Μπαρ", labelEn: "Bar" },
    { value: "bar-restaurant", labelEl: "Μπαρ εστιατόριο", labelEn: "Bar restaurant" },
    { value: "burger", labelEl: "Μπέργκερ", labelEn: "Burger" },
    { value: "pizza", labelEl: "Πίτσα", labelEn: "Pizza" },
    { value: "breakfast", labelEl: "Πρωινό", labelEn: "Breakfast" },
    { value: "taverna", labelEl: "Ταβέρνα", labelEn: "Taverna" },
    { value: "healthy", labelEl: "Υγιεινό φαγητό", labelEn: "Healthy food" },
    { value: "bakery", labelEl: "Φούρνος", labelEn: "Bakery" },
  ],
  diamonh: [
    { value: "hotel", labelEl: "Ξενοδοχείο", labelEn: "Hotel" },
    { value: "villa", labelEl: "Βίλα", labelEn: "Villa" },
    { value: "apartment", labelEl: "Διαμέρισμα", labelEn: "Apartment" },
    { value: "studio", labelEl: "Στούντιο", labelEn: "Studio" },
    { value: "rooms", labelEl: "Δωμάτια", labelEn: "Rooms" },
    { value: "guesthouse", labelEl: "Ξενώνας", labelEn: "Guesthouse" },
  ],
  activities: [
    { value: "scuba-diving", labelEl: "Scuba Diving", labelEn: "Scuba Diving" },
    { value: "snorkeling", labelEl: "Snorkeling", labelEn: "Snorkeling" },
    { value: "quad-safari", labelEl: "Quad Safari", labelEn: "Quad Safari" },
    { value: "jeep-safari", labelEl: "Jeep Safari", labelEn: "Jeep Safari" },
    { value: "kayaking", labelEl: "Καγιάκ", labelEn: "Kayaking" },
    { value: "parasailing", labelEl: "Parasailing", labelEn: "Parasailing" },
    { value: "paragliding", labelEl: "Paragliding", labelEn: "Paragliding" },
    { value: "jet-ski", labelEl: "Jet Ski", labelEn: "Jet Ski" },
    { value: "sup", labelEl: "SUP", labelEn: "SUP" },
    { value: "windsurf", labelEl: "Windsurf", labelEn: "Windsurf" },
    { value: "boat-tour", labelEl: "Βόλτα με σκάφος", labelEn: "Boat Tour" },
    { value: "fishing", labelEl: "Ψάρεμα", labelEn: "Fishing Trip" },
    { value: "hiking", labelEl: "Πεζοπορία", labelEn: "Hiking" },
    { value: "horse-riding", labelEl: "Ιππασία", labelEn: "Horse Riding" },
    { value: "cycling-tour", labelEl: "Ποδηλατική ξενάγηση", labelEn: "Cycling Tour" },
    { value: "wine-tasting", labelEl: "Γευσιγνωσία κρασιού", labelEn: "Wine Tasting" },
    { value: "cooking-class", labelEl: "Μαθήματα μαγειρικής", labelEn: "Cooking Class" },
    { value: "spa-wellness", labelEl: "Spa & Wellness", labelEn: "Spa & Wellness" },
    { value: "bungee-jumping", labelEl: "Bungee Jumping", labelEn: "Bungee Jumping" },
    { value: "rock-climbing", labelEl: "Αναρρίχηση", labelEn: "Rock Climbing" },
  ],
  "car-rental": [
    { value: "economy", labelEl: "Economy", labelEn: "Economy" },
    { value: "suv", labelEl: "SUV", labelEn: "SUV" },
    { value: "luxury", labelEl: "Πολυτελές", labelEn: "Luxury" },
    { value: "van", labelEl: "Van", labelEn: "Van" },
    { value: "convertible", labelEl: "Κάμπριο", labelEn: "Convertible" },
    { value: "automatic", labelEl: "Αυτόματο", labelEn: "Automatic" },
  ],
  "moto-rental": [
    { value: "scooter", labelEl: "Scooter", labelEn: "Scooter" },
    { value: "motorcycle", labelEl: "Μοτοσυκλέτα", labelEn: "Motorcycle" },
    { value: "atv", labelEl: "ATV / Quad", labelEn: "ATV / Quad" },
    { value: "ebike", labelEl: "E-bike", labelEn: "E-bike" },
  ],
};

const recommendedOptionsByCategory: Record<string, { value: string; labelEl: string; labelEn: string }[]> = {
  restaurants: [
    { value: "unique-environment", labelEl: "Μοναδικό περιβάλλον", labelEn: "Unique atmosphere" },
    { value: "family", labelEl: "Οικογένεια", labelEn: "Family" },
    { value: "romantic", labelEl: "Ρομαντικό", labelEn: "Romantic" },
    { value: "group", labelEl: "Παρέα", labelEn: "Group" },
    { value: "sea-view", labelEl: "Θέα θάλασσα", labelEn: "Sea view" },
    { value: "live-music", labelEl: "Live μουσική", labelEn: "Live music" },
  ],
  diamonh: [
    { value: "family", labelEl: "Οικογένεια", labelEn: "Family" },
    { value: "couples", labelEl: "Ζευγάρια", labelEn: "Couples" },
    { value: "luxury", labelEl: "Πολυτέλεια", labelEn: "Luxury" },
    { value: "budget", labelEl: "Οικονομικό", labelEn: "Budget" },
    { value: "sea-view", labelEl: "Θέα θάλασσα", labelEn: "Sea view" },
    { value: "pool", labelEl: "Πισίνα", labelEn: "Pool" },
  ],
  activities: [
    { value: "family", labelEl: "Οικογένεια", labelEn: "Family" },
    { value: "couples", labelEl: "Ζευγάρια", labelEn: "Couples" },
    { value: "group", labelEl: "Παρέα", labelEn: "Group" },
    { value: "adrenaline", labelEl: "Αδρεναλίνη", labelEn: "Adrenaline" },
    { value: "relaxation", labelEl: "Χαλάρωση", labelEn: "Relaxation" },
    { value: "nature", labelEl: "Φύση", labelEn: "Nature" },
  ],
};

const ListingFormDialog = ({ open, onOpenChange, listing, userId }: ListingFormDialogProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!listing;
  const locationRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useLanguage();
  const { hasRole } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const { query: locationQuery, predictions, isOpen: suggestionsOpen, search: searchLocation, select: selectLocation, close: closeSuggestions, setQuery: setLocationQuery, getPlaceDetails } = usePlacesAutocomplete();
  const [images, setImages] = useState<string[]>([]);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listingType, setListingType] = useState("");
  const [recommendedFor, setRecommendedFor] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>("");
  const [rooms, setRooms] = useState<string>("");
  const [beds, setBeds] = useState<string>("");
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);

  const normalizeUrl = (url: string): string | null => {
    if (!url || !url.trim()) return null;
    let trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = "https://" + trimmed;
    }
    return trimmed;
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const selectedCategorySlug = categories.find((c) => c.id === categoryId)?.slug || "";
  const typeOptions = selectedCategorySlug === "car-rental"
    ? [...(typeOptionsByCategory["car-rental"] || []), ...(typeOptionsByCategory["moto-rental"] || [])]
    : typeOptionsByCategory[selectedCategorySlug] || [];
  const recommendedOptions = recommendedOptionsByCategory[selectedCategorySlug] || [];

  const optLabel = (opt: { labelEl: string; labelEn: string }) => lang === "el" ? opt.labelEl : opt.labelEn;

  useEffect(() => {
    if (listing) {
      setBusinessName(listing.business_name || "");
      setCategoryId(listing.category_id || "");
      setDescription(listing.description || "");
      setPhone(listing.phone || "");
      setEmail(listing.email || "");
      setLocation(listing.location || "");
      setLocationQuery(listing.address || listing.location || "");
      setImages(listing.images || []);
      setPolicyAccepted(true);
      setListingType(listing.type || "");
      setRecommendedFor(listing.recommended_for || []);
      setCapacity(listing.capacity?.toString() || "");
      setRooms(listing.rooms?.toString() || "");
      setBeds(listing.beds?.toString() || "");
      setPriceFrom(listing.price_from?.toString() || "");
      setPriceTo(listing.price_to?.toString() || "");
      setWebsite(listing.website || "");
      setAddress(listing.address || "");
      setLatitude(listing.latitude ?? null);
      setLongitude(listing.longitude ?? null);
      setAmenities(listing.amenities || []);
    } else {
      setBusinessName("");
      setCategoryId("");
      setDescription("");
      setPhone("");
      setEmail("");
      setLocation("");
      setImages([]);
      setPolicyAccepted(false);
      setListingType("");
      setRecommendedFor([]);
      setCapacity("");
      setRooms("");
      setBeds("");
      setPriceFrom("");
      setPriceTo("");
      setWebsite("");
      setAddress("");
      setLatitude(null);
      setLongitude(null);
      setAmenities([]);
    }
  }, [listing, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} ${t.lfFileTooBig}`);
          continue;
        }
        const url = await uploadListingImage(userId, file);
        urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} ${t.lfPhotosUploaded}`);
    } catch (error: any) {
      toast.error(`${t.lfUploadError}: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);
  const toggleRecommended = (value: string) => {
    setRecommendedFor((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleAmenity = (value: string) => {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const geocodeAddress = async (addr: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      if (!window.google?.maps) return null;
      const geocoder = new google.maps.Geocoder();
      return await new Promise((resolve) => {
        geocoder.geocode({ address: addr, region: "gr" }, (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyAccepted && !isEditing) {
      toast.error(t.lfPolicyRequired);
      return;
    }
    if (images.length === 0) {
      toast.error(lang === "el" ? "Προσθέστε τουλάχιστον μία φωτογραφία" : "Add at least one photo");
      return;
    }

    setSaving(true);

    let finalLat = latitude;
    let finalLng = longitude;

    // If address is set but no lat/lng (user didn't select from autocomplete), geocode it
    if (address && !finalLat && !finalLng) {
      const coords = await geocodeAddress(address);
      if (coords) {
        finalLat = coords.lat;
        finalLng = coords.lng;
        setLatitude(coords.lat);
        setLongitude(coords.lng);
      }
    }

    try {
      if (isEditing) {
        await updateListing(listing.id, {
          business_name: businessName,
          category_id: categoryId,
          description,
          phone,
          email,
          location,
          address: address || null,
          latitude: finalLat,
          longitude: finalLng,
          amenities: amenities.length ? amenities : null,
          images,
          type: listingType || undefined,
          recommended_for: recommendedFor,
          capacity: capacity ? parseInt(capacity) : null,
          rooms: rooms ? parseInt(rooms) : null,
          beds: beds ? parseInt(beds) : null,
          price_from: priceFrom ? parseFloat(priceFrom) : null,
          price_to: priceTo ? parseFloat(priceTo) : null,
          website: normalizeUrl(website),
        } as any);
        toast.success(t.lfUpdated);
      } else {
        const slug = generateSlug(businessName) + "-" + Date.now().toString(36);
        await createListing({
          user_id: userId,
          business_name: businessName,
          slug,
          category_id: categoryId,
          description,
          phone,
          email,
          location,
          address: address || null,
          latitude: finalLat,
          longitude: finalLng,
          amenities: amenities.length ? amenities : null,
          images,
          content_policy_accepted: policyAccepted,
          status: hasRole("admin") ? "active" : "draft",
          type: listingType || undefined,
          recommended_for: recommendedFor,
          capacity: capacity ? parseInt(capacity) : null,
          rooms: rooms ? parseInt(rooms) : null,
          beds: beds ? parseInt(beds) : null,
          price_from: priceFrom ? parseFloat(priceFrom) : null,
          price_to: priceTo ? parseFloat(priceTo) : null,
          website: normalizeUrl(website),
        } as any);
        toast.success(lang === "el" ? "Η καταχώριση αποθηκεύτηκε! Πατήστε 'Δημοσίευση' για να γίνει ορατή." : "Listing saved! Click 'Publish' to make it visible.");
      }
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t.lfError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? t.lfEditListing : t.lfNewListing}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="businessName">{t.lfBusinessName} *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t.lfBusinessNamePlaceholder}
              required
            />
          </div>

          <div>
            <Label>{t.lfCategory} *</Label>
            <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setListingType(""); setRecommendedFor([]); }} required>
              <SelectTrigger>
                <SelectValue placeholder={t.lfSelectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.slug !== "moto-rental")
                  .map((cat) => {
                    const isCar = cat.slug === "car-rental";
                    const label = isCar ? "Car & Moto" : cat.title;
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        {label}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* Type selector */}
          {typeOptions.length > 0 && (
            <div>
              <Label>{t.lfType}</Label>
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger>
                  <SelectValue placeholder={t.lfSelectType} />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {optLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recommended for checkboxes */}
          {recommendedOptions.length > 0 && (
            <div>
              <Label>{t.lfRecommendedFor}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {recommendedOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={recommendedFor.includes(opt.value)}
                      onCheckedChange={() => toggleRecommended(opt.value)}
                    />
                    {optLabel(opt)}
                  </label>
                ))}
              </div>
            </div>
           )}

          {/* Detail fields - conditional by category */}
          {selectedCategorySlug === "diamonh" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rooms">{t.lfRooms}</Label>
                <Input id="rooms" type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="3" />
              </div>
              <div>
                <Label htmlFor="beds">{t.lfBeds}</Label>
                <Input id="beds" type="number" min="0" value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="4" />
              </div>
              <div>
                <Label htmlFor="capacity">{t.lfPersons}</Label>
                <Input id="capacity" type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="6" />
              </div>
            </div>
          )}

          {selectedCategorySlug === "restaurants" && (
            <div>
              <Label htmlFor="capacity">{t.lfCapacity}</Label>
              <Input id="capacity" type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="50" />
            </div>
          )}

          {selectedCategorySlug === "activities" && (
            <div>
              <Label htmlFor="capacity">{lang === "el" ? "Μέγεθος ομάδας (άτομα)" : "Group size (persons)"}</Label>
              <Input id="capacity" type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="10" />
            </div>
          )}

          {selectedCategorySlug !== "car-rental" && selectedCategorySlug !== "moto-rental" && selectedCategorySlug !== "car-moto" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="priceFrom">{t.lfPriceFrom}</Label>
                <Input id="priceFrom" type="number" min="0" step="0.01" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="50.00" />
              </div>
              <div>
                <Label htmlFor="priceTo">{t.lfPriceTo}</Label>
                <Input id="priceTo" type="number" min="0" step="0.01" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} placeholder="150.00" />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">{t.lfDescription}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.lfDescriptionPlaceholder}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t.lfPhone}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+30 210 1234567"
              />
            </div>
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@business.gr"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="www.example.com"
            />
          </div>

          {/* Address with autocomplete → auto sets lat/lng + location city */}
          <div className="relative" ref={locationRef}>
            <Label htmlFor="address">
              {lang === "el" ? "Διεύθυνση επιχείρησης *" : "Business address *"}
            </Label>
            <p className="text-xs text-muted-foreground mb-1.5">
              {lang === "el"
                ? "Γράψτε τη διεύθυνσή σας και επιλέξτε από τις προτάσεις για ακριβή τοποθεσία στον χάρτη"
                : "Type your address and select from suggestions for accurate map placement"}
            </p>
            <Input
              id="address"
              value={locationQuery}
              onChange={(e) => {
                searchLocation(e.target.value);
                setAddress(e.target.value);
              }}
              onBlur={() => setTimeout(closeSuggestions, 200)}
              placeholder={lang === "el" ? "π.χ. Λεωφόρος Νίκης 12, Θεσσαλονίκη" : "e.g. Nikis Ave 12, Thessaloniki"}
              autoComplete="off"
            />
            {suggestionsOpen && predictions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {predictions.map((p) => (
                  <li
                    key={p.place_id}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                    onMouseDown={async () => {
                      selectLocation(p);
                      setAddress(p.description);
                      const details = await getPlaceDetails(p.place_id);
                      if (details) {
                        setLatitude(details.lat);
                        setLongitude(details.lng);
                        if (details.address) setAddress(details.address);
                        // Extract city from address for display on card
                        const parts = (details.address || p.description).split(",");
                        const city = parts.find((part) =>
                          !part.trim().match(/^\d/) && part.trim().length > 2
                        )?.trim() || parts[0]?.trim() || p.description;
                        setLocation(city);
                      } else {
                        setLocation(p.description);
                      }
                    }}
                  >
                    <span className="font-medium">{p.description.split(",")[0]}</span>
                    <span className="text-muted-foreground">{p.description.includes(",") ? ", " + p.description.split(",").slice(1).join(",") : ""}</span>
                  </li>
                ))}
              </ul>
            )}
            {latitude && longitude ? (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                ✓ {lang === "el" ? "Βρέθηκε στον χάρτη" : "Found on map"}
                {location && <span className="text-muted-foreground">· Εμφανίζεται ως: <b>{location}</b></span>}
              </p>
            ) : address && (
              <p className="text-xs text-amber-600 mt-1.5">
                ⚠ {lang === "el" ? "Επιλέξτε από τις προτάσεις για να εντοπιστεί στον χάρτη" : "Select from suggestions to place on map"}
              </p>
            )}
          </div>

          {/* Amenities */}
          {(AMENITIES_BY_CATEGORY[selectedCategorySlug] || AMENITIES_BY_CATEGORY["car-rental"])?.length > 0 && (
            <div>
              <Label>{lang === "el" ? "Ανέσεις & Υπηρεσίες" : "Amenities & Services"}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(AMENITIES_BY_CATEGORY[selectedCategorySlug] || AMENITIES_BY_CATEGORY["car-rental"] || []).map((a) => (
                  <label key={a.value} className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded-lg border border-border hover:border-primary transition-colors">
                    <Checkbox
                      checked={amenities.includes(a.value)}
                      onCheckedChange={() => toggleAmenity(a.value)}
                    />
                    <span>{a.icon} {a.labelEl}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Image upload with drag & drop reorder */}
          <div>
            <Label>{t.lfPhotos} *</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              {lang === "el" ? "Σύρετε για αλλαγή σειράς. Η πρώτη εικόνα είναι το εξώφυλλο." : "Drag to reorder. The first image is the cover."}
            </p>
            <div className="mt-2">
              {images.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {images.map((url, i) => (
                        <SortableImage key={url} url={url} index={i} onRemove={removeImage} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                {uploading ? (
                  <span className="text-sm text-muted-foreground">{t.lfUploading}</span>
                ) : (
                  <>
                    <Upload size={18} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t.lfSelectPhotos}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="policy"
                checked={policyAccepted}
                onCheckedChange={(checked) => setPolicyAccepted(checked === true)}
              />
              <label htmlFor="policy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {t.lfPolicyAccept}
              </label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saving || uploading || (!policyAccepted && !isEditing)}>
            {saving ? t.lfSaving : isEditing ? t.lfUpdate : (lang === "el" ? "Αποθήκευση" : "Save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListingFormDialog;
