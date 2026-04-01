import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  MessageCircle,
  List,
  Store,
  CreditCard,
  UserCog,
  LogOut,
  Home,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const { lang } = useLanguage();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      if (!user) return 0;
      const { data: listings } = await supabase
        .from("listings")
        .select("id")
        .eq("user_id", user.id);

      if (!listings || listings.length === 0) return 0;

      const listingIds = listings.map((l) => l.id);

      const { count } = await supabase
        .from("contact_messages" as any)
        .select("*", { count: "exact", head: true })
        .in("listing_id", listingIds)
        .eq("is_read", false);

      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: unreadChatCount = 0 } = useQuery({
    queryKey: ["unread-chat-count"],
    queryFn: async () => {
      if (!user) return 0;
      const { data: listings } = await supabase
        .from("listings")
        .select("id")
        .eq("user_id", user.id);

      if (!listings || listings.length === 0) return 0;

      const listingIds = listings.map((l) => l.id);

      const { data: rooms } = await supabase
        .from("chat_rooms" as any)
        .select("id")
        .in("listing_id", listingIds);

      if (!rooms || rooms.length === 0) return 0;

      const roomIds = (rooms as any[]).map((r) => r.id);

      const { count } = await supabase
        .from("chat_messages" as any)
        .select("*", { count: "exact", head: true })
        .in("room_id", roomIds)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  const partnerItems = [
    { title: "Listings", icon: Store, value: "listings" },
    { title: lang === "el" ? "Πληρωμές" : "Payments", icon: CreditCard, value: "subscription" },
  ];

  const accountItems = [
    { title: lang === "el" ? "Στοιχεία λογαριασμού" : "Account Details", icon: UserCog, value: "account" },
  ];

  const mainItems = [
    { title: "Dashboard", icon: LayoutDashboard, value: "overview", badge: 0 },
    { title: lang === "el" ? "Μηνύματα" : "Messages", icon: MessageSquare, value: "messages", badge: unreadCount },
    { title: "Chat", icon: MessageCircle, value: "chats", badge: unreadChatCount },
    { title: lang === "el" ? "Καταχωρίσεις" : "Listings", icon: List, value: "listings", badge: 0 },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <button
          onClick={() => window.location.href = "/"}
          className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground hover:text-primary transition-colors"
        >
          <Home size={18} />
          {!collapsed && <span>About Traveller</span>}
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{lang === "el" ? "Μενού" : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    tooltip={item.title}
                  >
                    <div className="relative">
                      <item.icon size={18} />
                      {item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{lang === "el" ? "Διαχείριση" : "Management"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {partnerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    tooltip={item.title}
                  >
                    <item.icon size={18} />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{lang === "el" ? "Λογαριασμός" : "Account"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    tooltip={item.title}
                  >
                    <item.icon size={18} />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip={lang === "el" ? "Αποσύνδεση" : "Sign out"}>
              <LogOut size={18} />
              {!collapsed && <span>{lang === "el" ? "Αποσύνδεση" : "Sign out"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
