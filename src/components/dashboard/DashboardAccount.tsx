import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, User } from "lucide-react";

const DashboardAccount = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        const nameParts = (data.display_name || "").split(" ");
        setForm({
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
        });
      } else {
        setForm((f) => ({ ...f, email: user.email || "" }));
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const displayName = [form.first_name, form.last_name].filter(Boolean).join(" ");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        email: form.email,
        phone: form.phone,
      })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      toast.error(lang === "el" ? "Σφάλμα κατά την αποθήκευση" : "Error saving changes");
    } else {
      toast.success(lang === "el" ? "Τα στοιχεία αποθηκεύτηκαν επιτυχώς" : "Details saved successfully");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          {lang === "el" ? "Προσωπικά Στοιχεία" : "Personal Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2 max-w-xl">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">{lang === "el" ? "Όνομα" : "First Name"}</Label>
            <Input
              id="first_name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder={lang === "el" ? "Γιάννης" : "John"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">{lang === "el" ? "Επίθετο" : "Last Name"}</Label>
            <Input
              id="last_name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder={lang === "el" ? "Παπαδόπουλος" : "Smith"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{lang === "el" ? "Κινητό" : "Phone"}</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="69XXXXXXXX"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="mt-6">
          <Save size={16} className="mr-1.5" />
          {loading
            ? (lang === "el" ? "Αποθήκευση..." : "Saving...")
            : (lang === "el" ? "Αποθήκευση" : "Save")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardAccount;
