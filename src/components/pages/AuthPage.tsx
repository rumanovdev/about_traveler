import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UserRound, Store } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import GoogleLoginButton from "@/components/GoogleLoginButton";

type RegisterType = null | "customer" | "business";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registerType, setRegisterType] = useState<RegisterType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const { lang } = useLanguage();
  const redirectParam = searchParams.get("redirect");
  const redirectTo = redirectParam?.startsWith("/") ? redirectParam : "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(lang === "el" ? "Επιτυχής σύνδεση!" : "Logged in successfully!");
        window.location.href = redirectTo;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success(lang === "el" ? "Ελέγξτε το email σας για επιβεβαίωση!" : "Check your email for confirmation!");
      }
    } catch (error: any) {
      toast.error(error.message || (lang === "el" ? "Κάτι πήγε στραβά" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setRegisterType(null);
  };

  const handleRegisterTypeSelect = (type: RegisterType) => {
    if (type === "business") {
      window.location.href = "/partner-register";
      return;
    }
    setRegisterType(type);
  };

  return (
    <>
      <SEOHead
        title={activeTab === "login" ? "Σύνδεση" : "Εγγραφή"}
        description="Συνδεθείτε ή εγγραφείτε στο About Traveller"
        path="/auth"
        noindex
      />
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-card rounded-2xl shadow-travel-lg border border-border overflow-hidden">
            {/* Header with close */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h1 className="text-xl font-display font-bold text-foreground">
                {lang === "el" ? "Σύνδεση" : "Sign in"}
              </h1>
              <button
                onClick={() => window.location.href = "/"}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Tabs */}
            <div className="flex px-6 pt-4">
              <button
                type="button"
                onClick={() => { setActiveTab("login"); resetForm(); }}
                className={`pb-3 px-1 mr-6 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "login"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "el" ? "Σύνδεση" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("register"); resetForm(); }}
                className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "register"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "el" ? "Δημιουργία λογαριασμού" : "Create account"}
              </button>
            </div>

            {/* Register type selection */}
            {activeTab === "register" && !registerType && (
              <div className="px-6 py-8">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRegisterTypeSelect("customer")}
                    className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 hover:shadow-md"
                  >
                    <UserRound size={44} className="text-foreground group-hover:text-primary transition-colors" />
                    <span className="text-base font-semibold text-primary">
                      {lang === "el" ? "Πελάτης" : "Customer"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegisterTypeSelect("business")}
                    className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 hover:shadow-md"
                  >
                    <Store size={44} className="text-foreground group-hover:text-primary transition-colors" />
                    <span className="text-base font-semibold text-primary">
                      {lang === "el" ? "Επιχείρηση" : "Business"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Login form OR customer register form */}
            {(activeTab === "login" || (activeTab === "register" && registerType === "customer")) && (
              <>
                {/* Google Login */}
                <div className="px-6 pt-4">
                  <GoogleLoginButton />
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">{lang === "el" ? "ή με email" : "or with email"}</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                  {activeTab === "register" && (
                    <div>
                      <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
                        {lang === "el" ? "Όνομα" : "Name"}
                      </Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={lang === "el" ? "Το όνομά σας" : "Your name"}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      {lang === "el" ? "Κωδικός" : "Password"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="mt-1.5"
                    />
                  </div>

                  {activeTab === "login" && (
                    <div className="text-right">
                      <a href="/forgot-password" className="text-sm text-primary hover:underline">
                        {lang === "el" ? "Ξεχάσατε τον κωδικό;" : "Forgot password?"}
                      </a>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? (lang === "el" ? "Παρακαλώ περιμένετε..." : "Please wait...")
                      : activeTab === "login"
                        ? (lang === "el" ? "Σύνδεση" : "Sign in")
                        : (lang === "el" ? "Δημιουργία λογαριασμού" : "Create account")}
                  </Button>

                  {activeTab === "register" && (
                    <button
                      type="button"
                      onClick={() => setRegisterType(null)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← {lang === "el" ? "Πίσω" : "Back"}
                    </button>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AuthPage;
