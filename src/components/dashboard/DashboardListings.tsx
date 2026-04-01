import { useState } from "react";
import { Eye, Pencil, Trash2, Rocket } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
const catAccommodation = "/assets/cat-accommodation.jpg";
import { deleteListing, updateListingStatus } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import PaywallDialog from "./PaywallDialog";

interface DashboardListingsProps {
  listings: any[];
  loading: boolean;
  onEdit: (listing: any) => void;
  subscription?: any;
}

const DashboardListings = ({ listings, loading, onEdit, subscription }: DashboardListingsProps) => {
  const queryClient = useQueryClient();
  const { lang } = useLanguage();
  const { hasRole } = useAuth();
  const [paywallListing, setPaywallListing] = useState<any>(null);

  const isAdmin = hasRole("admin");
  const hasActiveSubscription = isAdmin || subscription?.status === "active";

  const deleteMut = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success(lang === "el" ? "Η καταχώριση διαγράφηκε" : "Listing deleted");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: () => toast.error(lang === "el" ? "Σφάλμα κατά τη διαγραφή" : "Error deleting listing"),
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => updateListingStatus(id, "active"),
    onSuccess: () => {
      toast.success(lang === "el" ? "Η καταχώριση δημοσιεύτηκε!" : "Listing published!");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      setPaywallListing(null);
    },
    onError: () => toast.error(lang === "el" ? "Σφάλμα κατά τη δημοσίευση" : "Error publishing listing"),
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(lang === "el" ? `Σίγουρα θέλετε να διαγράψετε "${name}";` : `Are you sure you want to delete "${name}"?`)) {
      deleteMut.mutate(id);
    }
  };

  const handlePublishClick = (listing: any) => {
    if (hasActiveSubscription) {
      // Already paid — publish directly
      publishMut.mutate(listing.id);
    } else {
      // Show paywall
      setPaywallListing(listing);
    }
  };

  const handlePayment = () => {
    // Navigate to subscription tab for payment
    // Close paywall and redirect
    setPaywallListing(null);
    toast.info(lang === "el" ? "Ενεργοποιήστε τη συνδρομή σας για να δημοσιεύσετε" : "Activate your subscription to publish");
    // Trigger tab change via URL
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "subscription");
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    // Fallback: direct navigation
    window.location.search = "?tab=subscription";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-travel animate-pulse flex gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-card rounded-xl p-10 shadow-travel text-center">
        <p className="text-lg text-muted-foreground">
          {lang === "el" ? "Δεν έχετε δημιουργήσει καταχωρίσεις ακόμα." : "You haven't created any listings yet."}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "el" ? 'Πατήστε "Νέα Καταχώριση" για να ξεκινήσετε.' : 'Click "New Listing" to get started.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {listings.map((listing) => {
          const image = listing.images?.[0] || catAccommodation;
          const catTitle = (listing.categories as any)?.title || "";
          const isDraft = listing.status !== "active";

          return (
            <div
              key={listing.id}
              className="bg-card rounded-xl p-4 shadow-travel flex items-center gap-4"
            >
              <img
                src={image}
                alt={listing.business_name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground truncate">
                  {listing.business_name}
                </h3>
                <p className="text-sm text-muted-foreground">{catTitle} · {listing.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      listing.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {listing.status === "active"
                      ? (lang === "el" ? "Ενεργή" : "Active")
                      : (lang === "el" ? "Πρόχειρο" : "Draft")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isDraft && (
                  <Button
                    size="sm"
                    className="bg-gradient-sky text-primary-foreground"
                    onClick={() => handlePublishClick(listing)}
                    disabled={publishMut.isPending}
                  >
                    <Rocket size={14} className="mr-1" />
                    {lang === "el" ? "Δημοσίευση" : "Publish"}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onEdit(listing)}>
                  <Pencil size={14} className="mr-1" />
                  <span className="hidden sm:inline">{lang === "el" ? "Επεξεργασία" : "Edit"}</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(listing.id, listing.business_name)}
                  disabled={deleteMut.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <PaywallDialog
        open={!!paywallListing}
        onOpenChange={(open) => !open && setPaywallListing(null)}
        listingName={paywallListing?.business_name || ""}
        onPayment={handlePayment}
      />
    </>
  );
};

export default DashboardListings;
