import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";

import { CheckCircle, ArrowRight } from "lucide-react";

const BusinessModelPage = () => {
  const { lang } = useLanguage();

  const benefits = lang === "el"
    ? [
        "0% προμήθεια σε κάθε κράτηση",
        "Πλήρης έλεγχος της τιμολόγησής σας",
        "Απευθείας επικοινωνία με τους πελάτες σας",
        "Προβολή σε χιλιάδες ταξιδιώτες",
        "Εύκολη διαχείριση καταχώρησης",
        "Υποστήριξη σε Ελληνικά & Αγγλικά",
      ]
    : [
        "0% commission on every booking",
        "Full control over your pricing",
        "Direct communication with your customers",
        "Exposure to thousands of travelers",
        "Easy listing management",
        "Support in Greek & English",
      ];

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Το Business Model μας" : "Our Business Model"}
        description={
          lang === "el"
            ? "Μάθετε πώς το About Traveller προσφέρει 0% προμήθεια και βοηθά την επιχείρησή σας να αναπτυχθεί."
            : "Learn how About Traveller offers 0% commission and helps your business grow."
        }
        path="/business-model"
      />
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 text-center">
            {lang === "el" ? "Μηδενικές Προμήθειες. Μέγιστη Αξία." : "Zero Commissions. Maximum Value."}
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {lang === "el"
              ? "Στο About Traveller πιστεύουμε ότι οι επιχειρήσεις δεν πρέπει να πληρώνουν υπέρογκες προμήθειες για κάθε κράτηση. Γι' αυτό προσφέρουμε ένα μοντέλο με 0% προμήθεια."
              : "At About Traveller, we believe businesses shouldn't pay excessive commissions for every booking. That's why we offer a 0% commission model."}
          </p>

          <div className="bg-secondary/50 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {lang === "el" ? "Τι κερδίζετε:" : "What you get:"}
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-base">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <a
              href="/partner-register"
              className="inline-flex items-center gap-2 bg-gradient-sky text-primary-foreground px-8 py-3.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-travel-lg"
            >
              {lang === "el" ? "Ξεκινήστε τώρα" : "Get started now"}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BusinessModelPage;
