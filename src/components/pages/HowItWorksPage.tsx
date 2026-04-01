import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Search,
  MessageCircle,
  Shield,
  Crosshair,
  Star,
  CreditCard,
  Users,
  MapPin,
  CheckCircle,
  ArrowRight,
  CalendarDays,
  Smartphone,
  Euro,
  Plane,
} from "lucide-react";


const HowItWorksPage = () => {
  const { lang } = useLanguage();

  const travelerSteps = [
    {
      icon: Search,
      title: lang === "el" ? "Αναζητήστε" : "Search",
      desc:
        lang === "el"
          ? "Ανακαλύψτε διαμονή, ενοικίαση αυτοκινήτου, μηχανής και εστιατόρια σε όλη την Ελλάδα. Φιλτράρετε ανά τοποθεσία και κατηγορία για να βρείτε ακριβώς αυτό που ψάχνετε."
          : "Discover accommodation, car rental, motorcycle rental and restaurants across Greece. Filter by location and category to find exactly what you need.",
    },
    {
      icon: MessageCircle,
      title: lang === "el" ? "Επικοινωνήστε" : "Contact",
      desc:
        lang === "el"
          ? "Επικοινωνήστε απευθείας με τους ιδιοκτήτες μέσω τηλεφώνου ή email. Κάντε ερωτήσεις για τις υπηρεσίες, τη διαθεσιμότητα και τις τιμές χωρίς ενδιάμεσους."
          : "Contact owners directly by phone or email. Ask questions about services, availability and prices without intermediaries.",
    },
    {
      icon: Shield,
      title: lang === "el" ? "Ταξιδέψτε" : "Travel",
      desc:
        lang === "el"
          ? "Περιηγηθείτε με ασφάλεια. Όλες οι επιχειρήσεις είναι επαληθευμένες και οι πληροφορίες ενημερωμένες. 0% προμήθεια για τους ταξιδιώτες."
          : "Browse safely. All businesses are verified and information is up to date. 0% commission for travelers.",
    },
  ];

  const businessSteps = [
    {
      icon: Crosshair,
      title: lang === "el" ? "Καταχωρήστε" : "List",
      desc:
        lang === "el"
          ? "Προβάλετε την επιχείρησή σας σε χιλιάδες ταξιδιώτες. Δημιουργήστε μια επαγγελματική καταχώριση με φωτογραφίες, περιγραφή και στοιχεία επικοινωνίας."
          : "Showcase your business to thousands of travelers. Create a professional listing with photos, description and contact details.",
    },
    {
      icon: Star,
      title: lang === "el" ? "Αναδειχθείτε" : "Stand Out",
      desc:
        lang === "el"
          ? "Αυξήστε την ορατότητά σας μέσω SEO-optimized σελίδων. Κάθε καταχώριση είναι βελτιστοποιημένη για να εμφανίζεται στις αναζητήσεις Google."
          : "Increase your visibility through SEO-optimized pages. Every listing is optimized to appear in Google searches.",
    },
    {
      icon: CreditCard,
      title: lang === "el" ? "Αναπτυχθείτε" : "Grow",
      desc:
        lang === "el"
          ? "Απλή μηνιαία συνδρομή χωρίς κρυφές χρεώσεις. Διαχειριστείτε τις καταχωρίσεις σας μέσα από ένα εύχρηστο dashboard με στατιστικά."
          : "Simple monthly subscription with no hidden fees. Manage your listings through an easy-to-use dashboard with statistics.",
    },
  ];

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: lang === "el" ? "Ταξιδιώτες" : "Travelers",
    },
    {
      icon: MapPin,
      value: "500+",
      label: lang === "el" ? "Προορισμοί" : "Destinations",
    },
    {
      icon: CheckCircle,
      value: "0%",
      label: lang === "el" ? "Προμήθεια" : "Commission",
    },
  ];

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Πώς Λειτουργεί | About Traveller" : "How It Works | About Traveller"}
        description={
          lang === "el"
            ? "Μάθετε πώς λειτουργεί η πλατφόρμα About Traveller για ταξιδιώτες και επιχειρήσεις."
            : "Learn how the About Traveller platform works for travelers and businesses."
        }
        path="/how-it-works"
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/90 to-sky-light overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="container relative text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6">
              {lang === "el" ? "Πώς Λειτουργεί;" : "How It Works?"}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground max-w-2xl mx-auto">
              {lang === "el"
                ? "Η πλατφόρμα που συνδέει ταξιδιώτες με τις καλύτερες τοπικές επιχειρήσεις στην Ελλάδα — απλά, γρήγορα και χωρίς προμήθεια."
                : "The platform that connects travelers with the best local businesses in Greece — simply, quickly and commission-free."}
            </p>
          </div>
        </section>

        {/* Quick Steps Strip */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 max-w-5xl mx-auto">
              {[
                {
                  icon: CalendarDays,
                  text: lang === "el"
                    ? <>Εσύ επιλέγεις το<br /><strong>που</strong> και το <strong>πότε</strong></>
                    : <>You choose<br /><strong>where</strong> & <strong>when</strong></>,
                },
                {
                  icon: MapPin,
                  text: lang === "el"
                    ? <>Εμείς σε<br />συνδέουμε</>
                    : <>We connect<br />you</>,
                },
                {
                  icon: Smartphone,
                  text: lang === "el"
                    ? <>Επικοινωνείς και<br />κάνεις δωρεάν<br />κρατήσεις</>
                    : <>Contact &<br />book for free</>,
                },
                {
                  icon: Euro,
                  text: lang === "el"
                    ? <>Καμία προμήθεια<br />Κανένα κόστος</>
                    : <>No commission<br />No cost</>,
                },
                {
                  icon: Plane,
                  text: lang === "el"
                    ? <>Καλό ταξίδι<br />traveller!</>
                    : <>Have a great<br />trip traveller!</>,
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <item.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  <p className="text-foreground font-bold text-sm md:text-base leading-snug">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Travelers Section */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container max-w-5xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                {lang === "el" ? "Για Ταξιδιώτες" : "For Travelers"}
              </h2>
            </div>
            <div className="space-y-6">
              {travelerSteps.map((step, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-6 p-7 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
                        {lang === "el" ? `Βήμα ${i + 1}` : `Step ${i + 1}`}
                      </span>
                      <h3 className="text-xl font-display font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-foreground leading-relaxed text-base">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a
                href="/#categories"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-sky-light text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-base"
              >
                {lang === "el" ? "Εξερευνήστε Τώρα" : "Explore Now"}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Businesses Section */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container max-w-5xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Crosshair className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                {lang === "el" ? "Για Επιχειρήσεις" : "For Businesses"}
              </h2>
            </div>
            <div className="space-y-6">
              {businessSteps.map((step, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-6 p-7 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
                        {lang === "el" ? `Βήμα ${i + 1}` : `Step ${i + 1}`}
                      </span>
                      <h3 className="text-xl font-display font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-foreground leading-relaxed text-base">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a
                href="/partner-register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-sky-light text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-base"
              >
                {lang === "el" ? "Εγγραφή Επιχείρησης" : "Business Registration"}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HowItWorksPage;
