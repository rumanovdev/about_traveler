import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { lang } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success(lang === "el" ? "Ελέγξτε το email σας για οδηγίες." : "Check your email for instructions.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Ξεχάσατε τον κωδικό" : "Forgot Password"}
        description={lang === "el" ? "Επαναφορά κωδικού πρόσβασης" : "Reset your password"}
        path="/forgot-password"
        noindex
      />
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-card rounded-xl shadow-travel-lg p-8 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {lang === "el" ? "Επαναφορά Κωδικού" : "Reset Password"}
            </h1>
            {sent ? (
              <p className="text-muted-foreground">
                {lang === "el" ? "Ελέγξτε το email σας για τον σύνδεσμο επαναφοράς." : "Check your email for the reset link."}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? (lang === "el" ? "Αποστολή..." : "Sending...")
                    : (lang === "el" ? "Αποστολή συνδέσμου" : "Send reset link")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;
