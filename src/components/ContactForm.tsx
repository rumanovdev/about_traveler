import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { sendContactMessage } from "@/lib/api";
import { z } from "zod";

interface ContactFormProps {
  listingId: string;
  businessName: string;
}

const ContactForm = ({ listingId, businessName }: ContactFormProps) => {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ sender_name: "", sender_email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactSchema = z.object({
    sender_name: z.string().trim().min(1, lang === "el" ? "Συμπληρώστε το όνομά σας" : "Please enter your name").max(100),
    sender_email: z.string().trim().email(lang === "el" ? "Μη έγκυρο email" : "Invalid email").max(255),
    message: z.string().trim().min(1, lang === "el" ? "Γράψτε ένα μήνυμα" : "Please write a message").max(2000),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await sendContactMessage({ listing_id: listingId, sender_name: result.data.sender_name, sender_email: result.data.sender_email, message: result.data.message });
      setSent(true);
      toast({
        title: lang === "el" ? "Το μήνυμά σας στάλθηκε!" : "Your message was sent!",
        description: lang === "el"
          ? `Ο ιδιοκτήτης του ${businessName} θα σας απαντήσει σύντομα.`
          : `The owner of ${businessName} will reply soon.`,
      });
    } catch {
      toast({
        title: lang === "el" ? "Σφάλμα" : "Error",
        description: lang === "el" ? "Κάτι πήγε στραβά. Δοκιμάστε ξανά." : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Send size={20} className="text-primary" />
        </div>
        <p className="font-semibold text-foreground">
          {lang === "el" ? "Μήνυμα εστάλη!" : "Message sent!"}
        </p>
        <p className="text-sm text-muted-foreground">
          {lang === "el" ? "Ο ιδιοκτήτης θα σας απαντήσει σύντομα." : "The owner will reply soon."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-display font-semibold text-foreground">
        {lang === "el" ? "Στείλτε μήνυμα" : "Send a message"}
      </h3>
      <div>
        <Input
          placeholder={lang === "el" ? "Το όνομά σας" : "Your name"}
          value={form.sender_name}
          onChange={(e) => setForm((f) => ({ ...f, sender_name: e.target.value }))}
        />
        {errors.sender_name && <p className="text-xs text-destructive mt-1">{errors.sender_name}</p>}
      </div>
      <div>
        <Input
          type="email"
          placeholder={lang === "el" ? "Το email σας" : "Your email"}
          value={form.sender_email}
          onChange={(e) => setForm((f) => ({ ...f, sender_email: e.target.value }))}
        />
        {errors.sender_email && <p className="text-xs text-destructive mt-1">{errors.sender_email}</p>}
      </div>
      <div>
        <Textarea
          placeholder={lang === "el" ? "Το μήνυμά σας..." : "Your message..."}
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? (lang === "el" ? "Αποστολή..." : "Sending...")
          : (lang === "el" ? "Αποστολή μηνύματος" : "Send message")}
        <Send size={16} />
      </Button>
    </form>
  );
};

export default ContactForm;
