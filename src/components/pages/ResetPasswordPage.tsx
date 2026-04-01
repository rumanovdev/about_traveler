import { useState, useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(lang === "el" ? "Ο κωδικός ενημερώθηκε!" : "Password updated!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Νέος Κωδικός" : "New Password"}
        description={lang === "el" ? "Ορίστε νέο κωδικό πρόσβασης" : "Set a new password"}
        path="/reset-password"
        noindex
      />
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-card rounded-xl shadow-travel-lg p-8">
            <h1 className="text-2xl font-display font-bold text-foreground text-center mb-6">
              {lang === "el" ? "Νέος Κωδικός" : "New Password"}
            </h1>
            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">{lang === "el" ? "Νέος Κωδικός" : "New Password"}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? (lang === "el" ? "Αποθήκευση..." : "Saving...")
                    : (lang === "el" ? "Αποθήκευση κωδικού" : "Save password")}
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground text-center">
                {lang === "el" ? "Μη έγκυρος σύνδεσμος επαναφοράς." : "Invalid reset link."}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ResetPasswordPage;
