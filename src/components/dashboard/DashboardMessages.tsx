import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getMyMessages, markMessageRead, deleteMessage } from "@/lib/api";
import { Mail, MailOpen, Clock, Building, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { el, enUS } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const DashboardMessages = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const localeObj = lang === "el" ? el : enUS;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["my-messages", user?.id],
    queryFn: () => getMyMessages(user!.id),
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: markMessageRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        <Mail className="mx-auto mb-3 text-muted-foreground/50" size={40} />
        <p className="font-medium">
          {lang === "el" ? "Δεν υπάρχουν μηνύματα ακόμα." : "No messages yet."}
        </p>
        <p className="text-sm mt-1">
          {lang === "el"
            ? "Τα μηνύματα από τις καταχωρίσεις σας θα εμφανίζονται εδώ."
            : "Messages from your listings will appear here."}
        </p>
      </div>
    );
  }

  const selected = messages.find((m: any) => m.id === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
        {messages.map((msg: any) => (
          <button
            key={msg.id}
            onClick={() => {
              setSelectedId(msg.id);
              if (!msg.is_read) markRead.mutate(msg.id);
            }}
            className={`w-full text-left p-4 rounded-xl border transition-colors ${
              selectedId === msg.id
                ? "border-primary bg-primary/5"
                : msg.is_read
                ? "bg-card hover:bg-accent/50"
                : "bg-primary/5 border-primary/20 hover:bg-primary/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {msg.is_read ? (
                <MailOpen size={14} className="text-muted-foreground" />
              ) : (
                <Mail size={14} className="text-primary" />
              )}
              <span className="font-semibold text-sm text-foreground truncate">{msg.sender_name}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
              <Clock size={11} />
              {format(new Date(msg.created_at), "dd MMM yyyy, HH:mm", { locale: localeObj })}
            </div>
          </button>
        ))}
      </div>

      <div className="md:col-span-2 rounded-xl border bg-card p-6">
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{selected.sender_name}</h3>
              <span className="text-xs text-muted-foreground">
                {format(new Date(selected.created_at), "dd MMM yyyy, HH:mm", { locale: localeObj })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={14} />
              <a href={`mailto:${selected.sender_email}`} className="hover:text-primary transition-colors">
                {selected.sender_email}
              </a>
            </div>
            {selected.listings && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building size={14} />
                <span>{(selected.listings as any).business_name}</span>
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`mailto:${selected.sender_email}?subject=Re: ${(selected.listings as any)?.business_name || (lang === "el" ? "Καταχώριση" : "Listing")}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Mail size={14} />
                {lang === "el" ? "Απάντηση μέσω email" : "Reply via email"}
              </a>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMut.mutate(selected.id)}
                disabled={deleteMut.isPending}
              >
                <Trash2 size={14} />
                {lang === "el" ? "Διαγραφή" : "Delete"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            {lang === "el" ? "Επιλέξτε ένα μήνυμα για να το διαβάσετε." : "Select a message to read it."}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMessages;
