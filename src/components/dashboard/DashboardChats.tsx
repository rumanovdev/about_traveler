import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Clock, Send } from "lucide-react";
import { format } from "date-fns";
import { el, enUS } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatRoom {
  id: string;
  listing_id: string;
  visitor_id: string;
  created_at: string;
  listing_name?: string;
  visitor_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const DashboardChats = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const localeObj = lang === "el" ? el : enUS;
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms for partner's listings
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["partner-chat-rooms", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get partner's listing IDs
      const { data: listings } = await supabase
        .from("listings")
        .select("id, business_name")
        .eq("user_id", user.id);

      if (!listings || listings.length === 0) return [];

      const listingIds = listings.map((l) => l.id);
      const listingMap = Object.fromEntries(listings.map((l) => [l.id, l.business_name]));

      // Get chat rooms
      const { data: chatRooms } = await supabase
        .from("chat_rooms" as any)
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      if (!chatRooms || chatRooms.length === 0) return [];

      // Get visitor profiles
      const visitorIds = [...new Set((chatRooms as any[]).map((r) => r.visitor_id))];
      const { data: profiles } = await supabase
        .from("profiles_public" as any)
        .select("user_id, display_name")
        .in("user_id", visitorIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.user_id, p.display_name || "Visitor"])
      );

      // Get last message and unread count for each room
      const roomIds = (chatRooms as any[]).map((r) => r.id);
      const { data: allMessages } = await supabase
        .from("chat_messages" as any)
        .select("*")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false });

      const enriched: ChatRoom[] = (chatRooms as any[]).map((room) => {
        const roomMsgs = (allMessages as any[] || []).filter((m) => m.room_id === room.id);
        const lastMsg = roomMsgs[0];
        const unread = roomMsgs.filter((m) => m.sender_id !== user.id && !m.is_read).length;

        return {
          ...room,
          listing_name: listingMap[room.listing_id] || "",
          visitor_name: profileMap[room.visitor_id] || "Visitor",
          last_message: lastMsg?.message || "",
          last_message_at: lastMsg?.created_at || room.created_at,
          unread_count: unread,
        };
      });

      // Sort by last message
      enriched.sort((a, b) => new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime());
      return enriched;
    },
    enabled: !!user,
  });

  // Load messages for selected room
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages" as any)
        .select("*")
        .eq("room_id", selectedRoomId)
        .order("created_at", { ascending: true });

      setMessages((data as any as ChatMessage[]) || []);

      // Mark unread as read
      if (user && data) {
        const unread = (data as any[]).filter((m) => m.sender_id !== user.id && !m.is_read);
        if (unread.length > 0) {
          await supabase
            .from("chat_messages" as any)
            .update({ is_read: true } as any)
            .in("id", unread.map((m) => m.id));
          queryClient.invalidateQueries({ queryKey: ["unread-chat-count"] });
          queryClient.invalidateQueries({ queryKey: ["partner-chat-rooms"] });
        }
      }
    };

    loadMessages();
  }, [selectedRoomId, user]);

  // Realtime
  useEffect(() => {
    if (!selectedRoomId) return;

    const channel = supabase
      .channel(`dashboard-chat-${selectedRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${selectedRoomId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Mark as read
          if (user && msg.sender_id !== user.id) {
            supabase
              .from("chat_messages" as any)
              .update({ is_read: true } as any)
              .eq("id", msg.id)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ["unread-chat-count"] });
                queryClient.invalidateQueries({ queryKey: ["partner-chat-rooms"] });
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoomId, user]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedRoomId || !user || sending) return;

    setSending(true);
    try {
      await supabase
        .from("chat_messages" as any)
        .insert({
          room_id: selectedRoomId,
          sender_id: user.id,
          message: newMsg.trim(),
        } as any);
      setNewMsg("");
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        <MessageCircle className="mx-auto mb-3 text-muted-foreground/50" size={40} />
        <p className="font-medium">
          {lang === "el" ? "Δεν υπάρχουν συνομιλίες ακόμα." : "No chats yet."}
        </p>
        <p className="text-sm mt-1">
          {lang === "el"
            ? "Όταν κάποιος πελάτης σας στείλει μήνυμα μέσω chat, θα εμφανιστεί εδώ."
            : "When a customer sends you a chat message, it will appear here."}
        </p>
      </div>
    );
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
      {/* Room list */}
      <div className="md:col-span-1 space-y-2 overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-colors",
              selectedRoomId === room.id
                ? "border-primary bg-primary/5"
                : room.unread_count && room.unread_count > 0
                ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                : "bg-card hover:bg-accent/50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-foreground truncate">
                {room.visitor_name}
              </span>
              {room.unread_count ? (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {room.unread_count}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground truncate">{room.listing_name}</p>
            {room.last_message && (
              <p className="text-xs text-muted-foreground truncate mt-1">{room.last_message}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
              <Clock size={11} />
              {format(new Date(room.last_message_at || room.created_at), "dd MMM, HH:mm", { locale: localeObj })}
            </div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="md:col-span-2 rounded-xl border bg-card flex flex-col overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-secondary/30">
              <p className="font-semibold text-sm text-foreground">{selectedRoom.visitor_name}</p>
              <p className="text-xs text-muted-foreground">{selectedRoom.listing_name}</p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {format(new Date(msg.created_at), "HH:mm", { locale: localeObj })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder={lang === "el" ? "Γράψτε μήνυμα..." : "Type a message..."}
                className="flex-1 h-10 text-sm"
                autoFocus
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!newMsg.trim() || sending}>
                <Send size={16} />
              </Button>
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

export default DashboardChats;
