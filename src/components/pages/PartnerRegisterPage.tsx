import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth } from "@/hooks/useAuth";

const PartnerRegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleProcessing, setGoogleProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const { lang } = useLanguage();
  const { user, hasRole, loading: authLoading } = useAuth();
  const isGooglePartnerSignup = searchParams.get("googleSignup") === "partner";
  const googlePartnerRedirectUri = typeof window !== 'undefined' ? `${window.location.origin}/partner-register?googleSignup=partner` : '';

  const features = [
    lang === "el" ? "1 Καταχώρηση" : "1 Listing",
    lang === "el" ? "0% Προμήθειες κρατήσεων" : "0% Booking fees",
    lang === "el" ? "Free instant booking ή request" : "Free instant booking or request",
    lang === "el" ? "Free channel manager" : "Free channel manager",
    lang === "el" ? "Στατιστικά" : "Analytics",
  ];

  useEffect(() => {
    if (!isGooglePartnerSignup || authLoading || !user || googleProcessing) return;

    let active = true;

    const finalizeGooglePartnerSignup = async () => {
      setGoogleProcessing(true);

      try {
        if (!hasRole("partner")) {
          const { error: roleError } = await supabase.rpc("assign_partner_role", {
            _user_id: user.id,
          });

          if (roleError) throw roleError;
        }

        const profileUpdate: { display_name?: string; phone?: string } = {};
        const displayName =
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name;
        const googlePhone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : undefined;

        if (displayName) profileUpdate.display_name = displayName;
        if (googlePhone) profileUpdate.phone = googlePhone;

        if (Object.keys(profileUpdate).length > 0) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update(profileUpdate)
            .eq("user_id", user.id);

          if (profileError) throw profileError;
        }

        toast.success(lang === "el" ? "Η εγγραφή επιχείρησης με Google ολοκληρώθηκε!" : "Business registration with Google completed!");
        window.location.replace("/dashboard");
      } catch (error: any) {
        toast.error(error.message || (lang === "el" ? "Η εγγραφή με Google απέτυχε" : "Google signup failed"));
      } finally {
        if (active) setGoogleProcessing(false);
      }
    };

    void finalizeGooglePartnerSignup();

    return () => {
      active = false;
    };
  // Redirect uses window.location.replace
  }, [authLoading, googleProcessing, hasRole, isGooglePartnerSignup, lang, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyAccepted) {
      toast.error(lang === "el" ? "Πρέπει να αποδεχθείτε την πολιτική περιεχομένου" : "You must accept the content policy");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: businessName,
            phone,
            is_partner: true,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase.rpc("assign_partner_role", {
          _user_id: data.user.id,
        });
        if (roleError) console.error("Role assignment error:", roleError);

        await supabase.from("profiles").update({
          display_name: businessName,
          phone,
        }).eq("user_id", data.user.id);
      }

      toast.success(lang === "el" ? "Εγγραφή επιτυχής!" : "Registration successful!");
      window.location.href = "/auth";
    } catch (error: any) {
      toast.error(error.message || (lang === "el" ? "Κάτι πήγε στραβά" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Εγγραφή Επιχείρησης"
        description="Εγγραφείτε ως επιχείρηση στο About Traveller και προβάλετε τις υπηρεσίες σας."
        path="/partner-register"
      />
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 md:hidden"
          >
            <ArrowLeft size={18} />
            {lang === "el" ? "Πίσω" : "Back"}
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-3">
            {lang === "el" ? "Εγγραφή Επιχείρησης" : "Business Registration"}
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            {lang === "el" ? "Προβάλετε την επιχείρησή σας στο About Traveller" : "Showcase your business on About Traveller"}
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Plan selection */}
            <div className="order-2 md:order-1 space-y-4">
              <h3 className="text-lg font-bold text-foreground text-center mb-2">
                {lang === "el" ? "Επιλέξτε πλάνο" : "Select a plan"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan("monthly")}
                  className={`text-left bg-card rounded-2xl border-2 p-5 transition-all duration-200 flex flex-col ${
                    selectedPlan === "monthly"
                      ? "border-primary shadow-travel-lg"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="h-14 flex flex-col justify-end mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">15€</span>
                      <span className="text-[10px] text-muted-foreground font-medium">/μήνα</span>
                    </div>
                    <span className="text-[10px] text-foreground mt-0.5 font-bold">+ΦΠΑ</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground mb-4 whitespace-nowrap">
                    {lang === "el" ? "Πακέτο (1 Μήνας)" : "Monthly Plan"}
                  </h4>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>

                {/* Yearly */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan("yearly")}
                  className={`text-left bg-card rounded-2xl border-2 p-5 transition-all duration-200 flex flex-col ${
                    selectedPlan === "yearly"
                      ? "border-primary shadow-travel-lg"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="h-14 flex flex-col justify-end mb-3">
                    <span className="text-xs line-through text-muted-foreground/60 font-medium">180€</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">150€</span>
                      <span className="text-[10px] text-muted-foreground font-medium">/χρόνο</span>
                    </div>
                    <span className="text-[10px] text-foreground mt-0.5 font-bold">+ΦΠΑ</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground mb-4 whitespace-nowrap">
                    {lang === "el" ? "Πακέτο (1 Χρόνος)" : "Yearly Plan"}
                  </h4>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              </div>
            </div>

            {/* Registration form */}
            <div className="bg-card rounded-2xl shadow-travel-lg border border-border p-7 order-1 md:order-2">
              <h2 className="text-lg font-bold text-foreground mb-5">
                {lang === "el" ? "Στοιχεία Εγγραφής" : "Registration Details"}
              </h2>
              <GoogleLoginButton redirectUri={googlePartnerRedirectUri} />
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">{lang === "el" ? "ή με email" : "or with email"}</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="businessName">
                    {lang === "el" ? "Επωνυμία Επιχείρησης" : "Business Name"}
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={lang === "el" ? "Η επιχείρησή σας" : "Your business"}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="business@example.com"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {lang === "el" ? "Τηλέφωνο" : "Phone"}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+30 210 1234567"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="password">
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

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="policy"
                    checked={policyAccepted}
                    onCheckedChange={(checked) => setPolicyAccepted(checked === true)}
                  />
                  <label htmlFor="policy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    {lang === "el"
                      ? "Αποδέχομαι την πολιτική περιεχομένου. Απαγορεύεται η ανάρτηση spam, πορνογραφικού υλικού, παράνομων υπηρεσιών ή παραπλανητικών πληροφοριών."
                      : "I accept the content policy. Posting spam, pornographic material, illegal services or misleading information is prohibited."}
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !policyAccepted || googleProcessing}>
                  {loading
                    ? (lang === "el" ? "Παρακαλώ περιμένετε..." : "Please wait...")
                    : (lang === "el" ? "Εγγραφή ως Επιχείρηση" : "Register as Business")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PartnerRegisterPage;
