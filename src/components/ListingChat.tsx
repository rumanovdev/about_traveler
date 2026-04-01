import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { el, enUS } from "date-fns/locale";

interface ListingChatProps {
  listingId: string;
  listingOwnerId: string;
  businessName: string;
}

export interface ListingChatHandle {
  openChat: () => void;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ListingChat = forwardRef<ListingChatHandle, ListingChatProps>(({ listingId, listingOwnerId, businessName }, ref) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localeObj = lang === "el" ? el : enUS;
  const isOwner = !user || user.id === listingOwnerId;

  useImperativeHandle(ref, () => ({
    openChat: () => {
      if (!isOwner) handleOpen();
    },
  }));

  const getOrCreateRoom = useCallback(async () => {
    if (!user) return null;

    // Try to find existing room
    const { data: existing } = await supabase
      .from("chat_rooms" as any)
      .select("id")
      .eq("listing_id", listingId)
      .eq("visitor_id", user.id)
      .maybeSingle();

    if (existing) return (existing as any).id as string;

    // Create new room
    const { data: created, error } = await supabase
      .from("chat_rooms" as any)
      .insert({ listing_id: listingId, visitor_id: user.id } as any)
      .select("id")
      .single();

    if (error) throw error;
    return (created as any).id as string;
  }, [listingId, user]);

  const loadMessages = useCallback(async (rId: string) => {
    const { data } = await supabase
      .from("chat_messages" as any)
      .select("*")
      .eq("room_id", rId)
      .order("created_at", { ascending: true });

    setMessages((data as any as ChatMessage[]) || []);

    // Mark unread messages from other user as read
    if (user && data) {
      const unread = (data as any[]).filter((m) => m.sender_id !== user.id && !m.is_read);
      if (unread.length > 0) {
        await supabase
          .from("chat_messages" as any)
          .update({ is_read: true } as any)
          .in("id", unread.map((m) => m.id));
      }
    }
  }, [user]);

  // Open chat & load
  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const rId = await getOrCreateRoom();
      if (rId) {
        setRoomId(rId);
        await loadMessages(rId);
      }
    } catch (e) {
      console.error("Chat error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!roomId || !open) return;

    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Auto-mark as read if from the other user
          if (user && newMessage.sender_id !== user.id) {
            supabase
              .from("chat_messages" as any)
              .update({ is_read: true } as any)
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, open, user]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !roomId || !user || sending) return;

    setSending(true);
    try {
      await supabase
        .from("chat_messages" as any)
        .insert({
          room_id: roomId,
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

  // Don't show chat to the listing owner or if not logged in
  if (isOwner) return null;

  return (
    <>
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2 min-w-0">
              <MessageCircle size={18} className="text-primary shrink-0" />
              <span className="font-semibold text-sm text-foreground truncate">
                {lang === "el" ? "Chat με" : "Chat with"} {businessName}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-sm text-muted-foreground">
                  {lang === "el"
                    ? "Ξεκινήστε τη συζήτηση! Στείλτε ένα μήνυμα στην επιχείρηση."
                    : "Start the conversation! Send a message to the business."}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn("flex", isMine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                        )}
                      >
                        {format(new Date(msg.created_at), "HH:mm", { locale: localeObj })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder={lang === "el" ? "Γράψτε μήνυμα..." : "Type a message..."}
              className="flex-1 h-10 text-sm"
              disabled={loading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={!newMsg.trim() || sending || loading}
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
});

ListingChat.displayName = "ListingChat";

export default ListingChat;
