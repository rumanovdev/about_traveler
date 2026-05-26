import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyEmailPage = () => {
  const { lang } = useLanguage();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const hash = window.location.hash;

    // Supabase appends #access_token=...&type=signup (or type=magiclink)
    if (hash.includes("type=signup") || hash.includes("type=magiclink")) {
      setStatus("success");
      return;
    }

    // Also listen for auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setStatus("success");
      }
    });

    // If no hash token found after a short delay, mark as error
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Επιβεβαίωση Email" : "Email Verification"}
        description={lang === "el" ? "Επιβεβαίωση διεύθυνσης email" : "Email address verification"}
        path="/verify"
        noindex
      />
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-card rounded-xl shadow-travel-lg p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
                <h1 className="text-xl font-display font-bold text-foreground mb-2">
                  {lang === "el" ? "Επιβεβαίωση..." : "Verifying..."}
                </h1>
                <p className="text-muted-foreground">
                  {lang === "el" ? "Παρακαλώ περιμένετε" : "Please wait"}
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                <h1 className="text-xl font-display font-bold text-foreground mb-2">
                  {lang === "el" ? "Το email επιβεβαιώθηκε!" : "Email verified!"}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {lang === "el"
                    ? "Ο λογαριασμός σας είναι έτοιμος."
                    : "Your account is ready."}
                </p>
                <Button onClick={() => (window.location.href = "/auth")} className="w-full">
                  {lang === "el" ? "Σύνδεση" : "Sign in"}
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle size={48} className="mx-auto text-destructive mb-4" />
                <h1 className="text-xl font-display font-bold text-foreground mb-2">
                  {lang === "el" ? "Μη έγκυρος σύνδεσμος" : "Invalid link"}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {lang === "el"
                    ? "Ο σύνδεσμος επιβεβαίωσης έχει λήξει ή δεν είναι έγκυρος."
                    : "The verification link has expired or is invalid."}
                </p>
                <Button variant="outline" onClick={() => (window.location.href = "/auth")} className="w-full">
                  {lang === "el" ? "Πίσω στη σύνδεση" : "Back to sign in"}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VerifyEmailPage;
