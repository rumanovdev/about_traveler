import { Search, MessageCircle, Shield, Crosshair, Star, CreditCard } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const HowItWorksSection = () => {
  const { lang } = useLanguage();

  const travelerSteps = [
    {
      icon: Search,
      desc: lang === "el"
        ? "Ανακαλύψτε διαμονή, ενοικίαση αυτοκινήτου, μηχανής και εστιατόρια σε όλη την Ελλάδα. Φιλτράρετε ανά τοποθεσία και κατηγορία για να βρείτε ακριβώς αυτό που ψάχνετε."
        : "Discover accommodation, car rental, motorcycle rental and restaurants across Greece. Filter by location and category to find exactly what you need.",
    },
    {
      icon: MessageCircle,
      desc: lang === "el"
        ? "Επικοινωνήστε απευθείας με τους ιδιοκτήτες μέσω τηλεφώνου ή email. Κάντε ερωτήσεις για τις υπηρεσίες, τη διαθεσιμότητα και τις τιμές χωρίς ενδιάμεσους."
        : "Contact owners directly by phone or email. Ask questions about services, availability and prices without intermediaries.",
    },
    {
      icon: Shield,
      desc: lang === "el"
        ? "Περιηγηθείτε με ασφάλεια. Όλες οι επιχειρήσεις είναι επαληθευμένες και οι πληροφορίες ενημερωμένες. 0% προμήθεια για τους ταξιδιώτες."
        : "Browse safely. All businesses are verified and information is up to date. 0% commission for travelers.",
    },
  ];

  const businessSteps = [
    {
      icon: Crosshair,
      desc: lang === "el"
        ? "Προβάλετε την επιχείρησή σας σε χιλιάδες ταξιδιώτες. Δημιουργήστε μια επαγγελματική καταχώριση με φωτογραφίες, περιγραφή και στοιχεία επικοινωνίας."
        : "Showcase your business to thousands of travelers. Create a professional listing with photos, description and contact details.",
    },
    {
      icon: Star,
      desc: lang === "el"
        ? "Αυξήστε την ορατότητά σας με επαγγελματικές σελίδες που ξεχωρίζουν. Κάθε καταχώριση είναι σχεδιασμένη για να προσελκύει νέους πελάτες και να αναδεικνύει την επιχείρησή σας."
        : "Increase your visibility with professional pages that stand out. Every listing is designed to attract new customers and showcase your business.",
    },
    {
      icon: CreditCard,
      desc: lang === "el"
        ? "Απλή μηνιαία συνδρομή χωρίς κρυφές χρεώσεις. Διαχειριστείτε τις καταχωρίσεις σας μέσα από ένα εύχρηστο dashboard με στατιστικά."
        : "Simple monthly subscription with no hidden fees. Manage your listings through an easy-to-use dashboard with statistics.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Travelers Column */}
          <div className="flex flex-col">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center md:text-left">
              {lang === "el" ? "Ταξιδιώτες" : "Travelers"}
            </h3>
            <div className="space-y-6">
              {travelerSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 bg-muted/30 rounded-xl p-5">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground text-base leading-relaxed pt-1">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <a
                href="#categories"
                className="inline-block px-8 py-3.5 rounded-full bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-travel"
              >
                {lang === "el" ? "Εξερευνήστε Τώρα" : "Explore Now"}
              </a>
            </div>
          </div>

          {/* Business Column */}
          <div className="flex flex-col">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center md:text-left">
              {lang === "el" ? "Επιχειρήσεις" : "Businesses"}
            </h3>
            <div className="space-y-6">
              {businessSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 bg-muted/30 rounded-xl p-5">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground text-base leading-relaxed pt-1">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <a
                href="/partner-register"
                className="inline-block px-8 py-3.5 rounded-full bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-travel"
              >
                {lang === "el" ? "Εγγραφή Επιχείρησης" : "Business Registration"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
