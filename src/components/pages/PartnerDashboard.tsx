import { useState, useEffect, lazy, Suspense } from "react";

import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ListingCard from "@/components/ListingCard";
import { Heart, Plus } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const DashboardOverview = lazy(() => import("@/components/dashboard/DashboardOverview"));
import DashboardListings from "@/components/dashboard/DashboardListings";
import DashboardSubscription from "@/components/dashboard/DashboardSubscription";
import DashboardInvoices from "@/components/dashboard/DashboardInvoices";
import DashboardAccount from "@/components/dashboard/DashboardAccount";
import DashboardMessages from "@/components/dashboard/DashboardMessages";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardChats from "@/components/dashboard/DashboardChats";
import ListingFormDialog from "@/components/dashboard/ListingFormDialog";
import { getMyListings, getMyAnalytics, getMySubscription } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const PartnerFavorites = ({ userId, lang }: { userId: string; lang: string }) => {
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*, listings(*, categories(title, slug))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-muted rounded-lg w-3/4" />
              <div className="h-4 bg-muted rounded-lg w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Heart size={40} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          {lang === "el" ? "Δεν έχετε αγαπημένες καταχωρίσεις ακόμα." : "You don't have any favorite listings yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav: any) => fav.listings && (
        <ListingCard key={fav.id} listing={fav.listings} />
      ))}
    </div>
  );
};

const PartnerDashboard = () => {
  const { user, hasRole, loading } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [formOpen, setFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const { lang } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/auth";
    } else if (!loading && user && !hasRole("partner") && !hasRole("admin")) {
      window.location.href = "/my-account";
    }
  }, [user, loading, hasRole]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: () => getMyListings(user!.id),
    enabled: !!user,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["my-analytics", user?.id],
    queryFn: () => getMyAnalytics(user!.id),
    enabled: !!user,
  });

  const { data: subscription } = useQuery({
    queryKey: ["my-subscription", user?.id],
    queryFn: () => getMySubscription(user!.id),
    enabled: !!user,
  });

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </main>
    );
  }

  const handleEdit = (listing: any) => {
    setEditingListing(listing);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingListing(null);
    setFormOpen(true);
  };

  const tabTitles: Record<string, string> = {
    overview: lang === "el" ? "Επισκόπηση" : "Overview",
    messages: lang === "el" ? "Μηνύματα" : "Messages",
    chats: "Chat",
    listings: lang === "el" ? "Καταχωρίσεις" : "Listings",
    favorites: lang === "el" ? "Αγαπημένα" : "Favorites",
    subscription: lang === "el" ? "Συνδρομή & Πληρωμές" : "Subscription & Payments",
    account: lang === "el" ? "Στοιχεία Λογαριασμού" : "Account Details",
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
            <DashboardOverview listings={listings} analytics={analytics} subscription={subscription} />
          </Suspense>
        );
      case "listings":
        return <DashboardListings listings={listings} loading={listingsLoading} onEdit={handleEdit} subscription={subscription} />;
      case "subscription":
        return <DashboardSubscription subscription={subscription} />;
      case "invoices":
        return <DashboardInvoices />;
      case "messages":
        return <DashboardMessages />;
      case "chats":
        return <DashboardChats />;
      case "favorites":
        return <PartnerFavorites userId={user.id} lang={lang} />;
      case "account":
        return <DashboardAccount />;
      default:
        return null;
    }
  };

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Πίνακας Ελέγχου" : "Dashboard"}
        description={lang === "el" ? "Διαχειριστείτε τις καταχωρίσεις σας στο About Traveller" : "Manage your listings on About Traveller"}
        path="/dashboard"
        noindex
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b bg-background px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h2 className="text-lg font-semibold text-foreground">
                  {tabTitles[activeTab] || "Dashboard"}
                </h2>
              </div>
              {activeTab === "listings" && (
                <Button onClick={handleCreate} size="sm" className="bg-gradient-sky text-primary-foreground">
                  <Plus size={16} className="mr-1.5" />
                  {lang === "el" ? "Νέα Καταχώριση" : "New Listing"}
                </Button>
              )}
            </header>

            <main className="flex-1 p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </SidebarProvider>

      <ListingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        listing={editingListing}
        userId={user.id}
      />
    </>
  );
};

export default PartnerDashboard;
