import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";

import { CheckCircle, ArrowRight } from "lucide-react";

const BusinessModelPage = () => {
  const { lang } = useLanguage();

  const benefits = lang === "el"
    ? [
        "Πλήρης έλεγχος της τιμολόγησής σας",
        "Απευθείας επικοινωνία με τους πελάτες σας",
        "Προβολή σε χιλιάδες ταξιδιώτες",
        "Εύκολη διαχείριση καταχώρησης",
        "Υποστήριξη σε Ελληνικά & Αγγλικά",
      ]
    : [
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
            ? "Μάθετε πώς το About Traveller βοηθά την επιχείρησή σας να αναπτυχθεί."
            : "Learn how About Traveller helps your business grow."
        }
        path="/business-model"
      />
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 text-center">
            {lang === "el" ? "Μέγιστη Αξία για την Επιχείρησή σας." : "Maximum Value for Your Business."}
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {lang === "el"
              ? "Στο About Traveller πιστεύουμε ότι οι επιχειρήσεις αξίζουν την καλύτερη προβολή. Προσφέρουμε ένα μοντέλο συνδρομής με απευθείας πρόσβαση σε χιλιάδες ταξιδιώτες."
              : "At About Traveller, we believe businesses deserve the best exposure. We offer a subscription model with direct access to thousands of travelers."}
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
