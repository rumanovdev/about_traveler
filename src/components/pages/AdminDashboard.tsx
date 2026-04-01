import { useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  LayoutList,
  CreditCard,
  Shield,
  LogOut,
  Home,
  FileText,
} from "lucide-react";
import AdminBlogManager from "@/components/admin/AdminBlogManager";
import {
  getAllListings,
  updateListingStatus,
  deleteListing,
  getAllProfiles,
  getAllUserRoles,
  getAllSubscriptions,
  deleteUser,
} from "@/lib/api";
const catAccommodation = "/assets/cat-accommodation.jpg";

const AdminDashboard = () => {
  const { user, hasRole, loading, signOut } = useAuth();
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();

  const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: t.adActive, className: "bg-green-100 text-green-700" },
    pending: { label: t.adPending, className: "bg-yellow-100 text-yellow-700" },
    hidden: { label: t.adHidden, className: "bg-muted text-muted-foreground" },
    rejected: { label: t.adRejected, className: "bg-red-100 text-red-700" },
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { window.location.href = "/auth?redirect=/admin"; return; }
    if (!hasRole("admin")) window.location.href = "/";
  }, [user, loading, hasRole]);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: getAllListings,
    enabled: !!user && hasRole("admin"),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: getAllProfiles,
    enabled: !!user && hasRole("admin"),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllUserRoles,
    enabled: !!user && hasRole("admin"),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: getAllSubscriptions,
    enabled: !!user && hasRole("admin"),
  });

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateListingStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success(`${t.adStatusChanged} "${statusLabels[status]?.label || status}"`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t.adDeleteConfirm} "${name}";`)) return;
    try {
      await deleteListing(id);
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success(t.adDeleted);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`${lang === "el" ? "Διαγραφή χρήστη" : "Delete user"} "${name}"; ${lang === "el" ? "Αυτή η ενέργεια είναι μη αναστρέψιμη!" : "This action is irreversible!"}`)) return;
    try {
      await deleteUser(userId);
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success(lang === "el" ? "Ο χρήστης διαγράφηκε" : "User deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
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

  const getRolesForUser = (userId: string) =>
    roles.filter((r) => r.user_id === userId).map((r) => r.role);

  const getSubForUser = (userId: string) =>
    subscriptions.find((s) => s.user_id === userId);

  const dateFmt = lang === "el" ? "el-GR" : "en-GB";

  return (
    <>
      <SEOHead title={t.adTitle} description={t.adSubtitle} path="/admin" noindex />
      <main className="min-h-screen bg-background py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield size={28} className="text-primary" />
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">{t.adTitle}</h1>
                <p className="text-muted-foreground mt-1">{t.adSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                <Home size={16} className="mr-2" />
                {lang === "el" ? "Αρχική" : "Home"}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                {t.signOut}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: t.adListings, value: listings.length, icon: LayoutList, color: "text-primary" },
              { label: t.adUsers, value: profiles.length, icon: Users, color: "text-blue-600" },
              { label: t.adActiveSubscriptions, value: subscriptions.filter((s) => s.status === "active").length, icon: CreditCard, color: "text-green-600" },
              { label: t.adHiddenListings, value: listings.filter((l) => l.status === "hidden").length, icon: EyeOff, color: "text-orange-500" },
              { label: "Blog", value: "—", icon: FileText, color: "text-purple-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-5 shadow-travel">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon size={20} className={stat.color} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="listings">{t.adListings}</TabsTrigger>
              <TabsTrigger value="users">{t.adUsers}</TabsTrigger>
              <TabsTrigger value="subscriptions">{t.adSubscriptions}</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
            </TabsList>

            {/* ── Listings Tab ── */}
            <TabsContent value="listings">
              {listingsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-xl" />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">{t.adNoListings}</p>
              ) : (
                <div className="space-y-3">
                  {listings.map((listing) => {
                    const image = listing.images?.[0] || catAccommodation;
                    const catTitle = (listing.categories as any)?.title || "";
                    const st = statusLabels[listing.status] || { label: listing.status, className: "bg-muted text-muted-foreground" };

                    return (
                      <div
                        key={listing.id}
                        className="bg-card rounded-xl p-4 shadow-travel flex flex-col sm:flex-row items-start sm:items-center gap-4"
                      >
                        <img
                          src={image}
                          alt={listing.business_name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground truncate">
                            {listing.business_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {catTitle} · {listing.location || "—"}
                          </p>
                          <Badge className={`mt-1 ${st.className}`} variant="secondary">
                            {st.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {listing.status !== "active" && (
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatus(listing.id, "active")}>
                              <CheckCircle size={14} className="mr-1" />
                              {t.adApprove}
                            </Button>
                          )}
                          {listing.status !== "hidden" && (
                            <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => handleStatus(listing.id, "hidden")}>
                              <EyeOff size={14} className="mr-1" />
                              {t.adHide}
                            </Button>
                          )}
                          {listing.status !== "rejected" && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatus(listing.id, "rejected")}>
                              <XCircle size={14} className="mr-1" />
                              {t.adReject}
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(listing.id, listing.business_name)}>
                            <Trash2 size={14} className="mr-1" />
                            {t.adDelete}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Users Tab ── */}
            <TabsContent value="users">
              {profiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">{t.adNoUsers}</p>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => {
                    const userRoles = getRolesForUser(profile.user_id);
                    const sub = getSubForUser(profile.user_id);

                    return (
                      <div
                        key={profile.id}
                        className="bg-card rounded-xl p-4 shadow-travel flex flex-col sm:flex-row items-start sm:items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {profile.display_name || profile.email || "—"}
                          </p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {userRoles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className={
                                role === "admin"
                                  ? "bg-primary/10 text-primary"
                                  : role === "partner"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {role}
                            </Badge>
                          ))}
                          {sub && (
                            <Badge
                              variant="secondary"
                              className={
                                sub.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }
                            >
                              Sub: {sub.status}
                            </Badge>
                          )}
                          {!userRoles.includes("admin") && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(profile.user_id, profile.display_name || profile.email || "—")}
                            >
                              <Trash2 size={14} className="mr-1" />
                              {lang === "el" ? "Διαγραφή" : "Delete"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Subscriptions Tab ── */}
            <TabsContent value="subscriptions">
              {subscriptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">{t.adNoSubscriptions}</p>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => {
                    const profile = profiles.find((p) => p.user_id === sub.user_id);
                    return (
                      <div
                        key={sub.id}
                        className="bg-card rounded-xl p-4 shadow-travel flex flex-col sm:flex-row items-start sm:items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CreditCard size={18} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {profile?.display_name || profile?.email || sub.user_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sub.current_period_start
                              ? `${t.adPeriod}: ${new Date(sub.current_period_start).toLocaleDateString(dateFmt)} - ${sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString(dateFmt) : "—"}`
                              : t.adNotStarted}
                          </p>
                          {sub.grace_period_end && (
                            <p className="text-xs text-orange-600">
                              {t.adGracePeriod}: {new Date(sub.grace_period_end).toLocaleDateString(dateFmt)}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            sub.status === "active"
                              ? "bg-green-100 text-green-700"
                              : sub.status === "past_due"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {sub.status === "active" ? t.adSubActive : sub.status === "past_due" ? t.adSubPastDue : sub.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Blog Tab ── */}
            <TabsContent value="blog">
              <AdminBlogManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
