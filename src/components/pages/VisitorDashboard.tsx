import { useState, useEffect, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/SEOHead";
import DashboardAccount from "@/components/dashboard/DashboardAccount";
import {
  LayoutDashboard, Heart, UserCog, MessageSquare, MessageCircle, LogOut, Home, Clock, Send,
} from "lucide-react";
import {
  SidebarProvider, SidebarTrigger,
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { el, enUS } from "date-fns/locale";

const VisitorSidebar = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const items = [
    { title: t.vFavorites, icon: Heart, value: "favorites" },
    { title: t.vMessages, icon: MessageSquare, value: "messages" },
    { title: "Chat", icon: MessageCircle, value: "chats" },
    { title: t.vAccount, icon: UserCog, value: "account" },
  ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground hover:text-primary transition-colors">
          <Home size={18} />
          {!collapsed && <span>About Traveller</span>}
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.vMenu}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton isActive={activeTab === item.value} onClick={() => onTabChange(item.value)} tooltip={item.title}>
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
            <SidebarMenuButton onClick={handleLogout} tooltip={t.signOut}>
              <LogOut size={18} />
              {!collapsed && <span>{t.signOut}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const VisitorFavorites = ({ userId }: { userId: string }) => {
  const { t } = useLanguage();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites" as any)
        .select("*, listings(*, categories(title, slug))" as any)
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
        <p className="text-muted-foreground">{t.vNoFavorites}</p>
        <p className="text-sm text-muted-foreground mt-1">{t.vExploreFavorites}</p>
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

const VisitorMessages = ({ userId }: { userId: string }) => {
  const { lang, t } = useLanguage();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["visitor-messages", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages" as any)
        .select("*, listings(business_name, slug)" as any)
        .eq("sender_email", (await supabase.from("profiles").select("email").eq("user_id", userId).single()).data?.email || "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="animate-pulse h-40 bg-muted rounded-xl" />;

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <MessageSquare size={40} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">{t.vNoMessages}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg: any) => (
        <div key={msg.id} className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              {t.vTo}: {msg.listings?.business_name || "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(msg.created_at).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{msg.message}</p>
        </div>
      ))}
    </div>
  );
};

const VisitorChats = ({ userId }: { userId: string }) => {
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();
  const localeObj = lang === "el" ? el : enUS;
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["visitor-chat-rooms", userId],
    queryFn: async () => {
      const { data: chatRooms } = await supabase
        .from("chat_rooms" as any)
        .select("*")
        .eq("visitor_id", userId)
        .order("created_at", { ascending: false });

      if (!chatRooms || chatRooms.length === 0) return [];

      const listingIds = [...new Set((chatRooms as any[]).map((r) => r.listing_id))];
      const { data: listings } = await supabase
        .from("listings")
        .select("id, business_name")
        .in("id", listingIds);

      const listingMap = Object.fromEntries((listings || []).map((l) => [l.id, l.business_name]));

      const roomIds = (chatRooms as any[]).map((r) => r.id);
      const { data: allMessages } = await supabase
        .from("chat_messages" as any)
        .select("*")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false });

      return (chatRooms as any[]).map((room) => {
        const roomMsgs = (allMessages as any[] || []).filter((m) => m.room_id === room.id);
        const lastMsg = roomMsgs[0];
        const unread = roomMsgs.filter((m) => m.sender_id !== userId && !m.is_read).length;
        return {
          ...room,
          listing_name: listingMap[room.listing_id] || "",
          last_message: lastMsg?.message || "",
          last_message_at: lastMsg?.created_at || room.created_at,
          unread_count: unread,
        };
      }).sort((a: any, b: any) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    },
    enabled: !!userId,
  });

  // Load messages
  useEffect(() => {
    if (!selectedRoomId) { setMessages([]); return; }
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages" as any)
        .select("*")
        .eq("room_id", selectedRoomId)
        .order("created_at", { ascending: true });
      setMessages((data as any[]) || []);
      // Mark as read
      const unread = (data as any[] || []).filter((m) => m.sender_id !== userId && !m.is_read);
      if (unread.length > 0) {
        await supabase.from("chat_messages" as any).update({ is_read: true } as any).in("id", unread.map((m) => m.id));
        queryClient.invalidateQueries({ queryKey: ["visitor-chat-rooms"] });
      }
    };
    load();
  }, [selectedRoomId, userId]);

  // Realtime
  useEffect(() => {
    if (!selectedRoomId) return;
    const channel = supabase
      .channel(`visitor-chat-${selectedRoomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${selectedRoomId}` }, (payload) => {
        const msg = payload.new as any;
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        if (msg.sender_id !== userId) {
          supabase.from("chat_messages" as any).update({ is_read: true } as any).eq("id", msg.id)
            .then(() => queryClient.invalidateQueries({ queryKey: ["visitor-chat-rooms"] }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedRoomId, userId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedRoomId || sending) return;
    setSending(true);
    try {
      await supabase.from("chat_messages" as any).insert({ room_id: selectedRoomId, sender_id: userId, message: newMsg.trim() } as any);
      setNewMsg("");
    } finally { setSending(false); }
  };

  if (isLoading) return <div className="animate-pulse h-40 bg-muted rounded-xl" />;

  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <MessageCircle size={40} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">{lang === "el" ? "Δεν υπάρχουν συνομιλίες ακόμα." : "No chats yet."}</p>
        <p className="text-sm text-muted-foreground mt-1">{lang === "el" ? "Ξεκινήστε μια συνομιλία από τη σελίδα μιας καταχώρισης." : "Start a chat from a listing page."}</p>
      </div>
    );
  }

  const selectedRoom = rooms.find((r: any) => r.id === selectedRoomId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
      <div className="md:col-span-1 space-y-2 overflow-y-auto">
        {rooms.map((room: any) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-colors",
              selectedRoomId === room.id ? "border-primary bg-primary/5"
                : room.unread_count > 0 ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                : "bg-card hover:bg-accent/50"
            )}
          >
            <span className="font-semibold text-sm text-foreground truncate block">{room.listing_name}</span>
            {room.last_message && <p className="text-xs text-muted-foreground truncate mt-1">{room.last_message}</p>}
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock size={11} />
                {format(new Date(room.last_message_at), "dd MMM, HH:mm", { locale: localeObj })}
              </span>
              {room.unread_count > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{room.unread_count}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="md:col-span-2 rounded-xl border bg-card flex flex-col overflow-hidden">
        {selectedRoom ? (
          <>
            <div className="px-4 py-3 border-b border-border bg-secondary/30">
              <p className="font-semibold text-sm text-foreground">{selectedRoom.listing_name}</p>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => {
                const isMine = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm", isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md")}>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {format(new Date(msg.created_at), "HH:mm", { locale: localeObj })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
              <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder={lang === "el" ? "Γράψτε μήνυμα..." : "Type a message..."} className="flex-1 h-10 text-sm" autoFocus />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!newMsg.trim() || sending}><Send size={16} /></Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {lang === "el" ? "Επιλέξτε μια συνομιλία." : "Select a chat."}
          </div>
        )}
      </div>
    </div>
  );
};

const VisitorDashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("favorites");

  useEffect(() => {
    if (!loading && !user) window.location.href = "/auth";
  }, [user, loading]);

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

  const tabTitles: Record<string, string> = {
    favorites: t.vFavorites,
    messages: t.vMessages,
    chats: "Chat",
    account: t.vAccountDetails,
  };

  return (
    <>
      <SEOHead title={t.vMyAccount} description={t.vMyAccountDesc} path="/my-account" noindex />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <VisitorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background px-4 gap-3">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{tabTitles[activeTab]}</h2>
            </header>
            <main className="flex-1 p-6">
              {activeTab === "favorites" && <VisitorFavorites userId={user.id} />}
              {activeTab === "messages" && <VisitorMessages userId={user.id} />}
              {activeTab === "chats" && <VisitorChats userId={user.id} />}
              {activeTab === "account" && <DashboardAccount />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default VisitorDashboard;
