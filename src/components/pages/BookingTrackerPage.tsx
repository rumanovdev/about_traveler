import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookingRecords,
  upsertBookingRecord,
  deleteBookingRecord,
  getPartnerUsers,
  type BookingCategory,
  type BookingRecord,
} from "@/lib/api";
import BookingSpreadsheet from "@/components/booking/BookingSpreadsheet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SEOHead from "@/components/SEOHead";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES: { value: BookingCategory; labelEl: string; labelEn: string }[] = [
  { value: "taxi_transfer", labelEl: "ΤΑΞΙ / TRANSFER", labelEn: "TAXI / TRANSFER" },
  { value: "rent_a_car", labelEl: "RENT A CAR", labelEn: "RENT A CAR" },
  { value: "activity", labelEl: "ΔΡΑΣΤΗΡΙΟΤΗΤΑ", labelEn: "ACTIVITY" },
];

const BookingTrackerPage = () => {
  const { user, hasRole, loading } = useAuth();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const isAdmin = hasRole("admin");

  const [activeCategory, setActiveCategory] = useState<BookingCategory>("taxi_transfer");
  const [filterUserId, setFilterUserId] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/auth";
    } else if (!loading && user && !hasRole("partner") && !hasRole("admin")) {
      window.location.href = "/dashboard";
    }
  }, [user, loading, hasRole]);

  // Admin: list of partner hotels for filter
  const { data: partners = [] } = useQuery({
    queryKey: ["partner-users"],
    queryFn: getPartnerUsers,
    enabled: isAdmin,
  });

  // Fetch records for current category
  const recordsQueryKey = [
    "booking-records",
    activeCategory,
    user?.id,
    isAdmin ? filterUserId : undefined,
  ];

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: recordsQueryKey,
    queryFn: () =>
      getBookingRecords(
        user!.id,
        activeCategory,
        isAdmin && filterUserId ? filterUserId : undefined
      ),
    enabled: !!user && (!isAdmin || !!filterUserId),
  });

  const handleSave = useCallback(
    async (record: BookingRecord) => {
      try {
        await upsertBookingRecord(record);
        queryClient.invalidateQueries({ queryKey: recordsQueryKey });
      } catch (err: any) {
        toast.error(err.message || "Error saving record");
        throw err;
      }
    },
    [queryClient, recordsQueryKey]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteBookingRecord(id);
        queryClient.invalidateQueries({ queryKey: recordsQueryKey });
      } catch (err: any) {
        toast.error(err.message || "Error deleting record");
      }
    },
    [queryClient, recordsQueryKey]
  );

  const handleSidebarTabChange = (tab: string) => {
    if (tab === "booking-tracker") return;
    window.location.href = `/dashboard?tab=${tab}`;
  };

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

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Καταμέτρηση" : "Booking Tracker"}
        description={lang === "el" ? "Καταγραφή κρατήσεων συνεργατών" : "Track partner bookings"}
        path="/booking-tracker"
        noindex
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar activeTab="booking-tracker" onTabChange={handleSidebarTabChange} />

          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b bg-background px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h2 className="text-lg font-semibold text-foreground">
                  {lang === "el" ? "Καταμέτρηση" : "Booking Tracker"}
                </h2>
              </div>

              {isAdmin && (
                <Select value={filterUserId} onValueChange={setFilterUserId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue
                      placeholder={lang === "el" ? "Επιλέξτε ξενοδοχείο..." : "Select hotel..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name || p.email || p.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </header>

            <main className="flex-1 p-6">
              {isAdmin && !filterUserId ? (
                <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
                  {lang === "el"
                    ? "Επιλέξτε ξενοδοχείο από το dropdown για να δείτε τις καταγραφές."
                    : "Select a hotel from the dropdown to view records."}
                </div>
              ) : (
                <Tabs
                  value={activeCategory}
                  onValueChange={(v) => setActiveCategory(v as BookingCategory)}
                >
                  <TabsList className="mb-4">
                    {CATEGORIES.map((cat) => (
                      <TabsTrigger key={cat.value} value={cat.value}>
                        {lang === "el" ? cat.labelEl : cat.labelEn}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {CATEGORIES.map((cat) => (
                    <TabsContent key={cat.value} value={cat.value}>
                      {recordsLoading ? (
                        <div className="h-40 animate-pulse bg-muted rounded-xl" />
                      ) : (
                        <BookingSpreadsheet
                          category={cat.value}
                          records={records}
                          userId={isAdmin && filterUserId ? filterUserId : user.id}
                          onSave={handleSave}
                          onDelete={handleDelete}
                        />
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default BookingTrackerPage;
