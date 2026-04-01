import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { FileText, Users, Store, CreditCard, AlertTriangle, Scale, Mail } from "lucide-react";

const TermsPage = () => {
  const { lang } = useLanguage();
  const isGreek = lang === "el";

  const sections = isGreek
    ? [
        {
          icon: FileText,
          title: "1. Γενικοί Όροι",
          content:
            "Η πλατφόρμα About Traveller παρέχει υπηρεσίες ανακάλυψης και σύνδεσης ταξιδιωτών με τοπικές επιχειρήσεις στην Ελλάδα, όπως καταλύματα, ενοικιάσεις αυτοκινήτων και μηχανών, και εστιατόρια. Η χρήση της πλατφόρμας συνεπάγεται αποδοχή των παρόντων όρων.",
        },
        {
          icon: Users,
          title: "2. Χρήστες / Ταξιδιώτες",
          content:
            "Οι ταξιδιώτες μπορούν να αναζητούν και να επικοινωνούν απευθείας με επιχειρήσεις μέσω της πλατφόρμας χωρίς καμία χρέωση. Η About Traveller δεν χρεώνει προμήθεια στους ταξιδιώτες. Οι χρήστες είναι υπεύθυνοι για την ακρίβεια των στοιχείων τους.",
        },
        {
          icon: Store,
          title: "3. Συνεργάτες / Επιχειρήσεις",
          content:
            "Οι επιχειρήσεις μπορούν να εγγραφούν ως συνεργάτες και να δημιουργήσουν καταχωρίσεις στις κατηγορίες Διαμονή, Ενοικίαση Αυτοκινήτου, Ενοικίαση Μηχανής και Εστιατόρια. Κάθε συνεργάτης είναι υπεύθυνος για την ακρίβεια των πληροφοριών της καταχώρισής του.",
        },
        {
          icon: CreditCard,
          title: "4. Συνδρομές & Πληρωμές",
          content:
            "Η πρόσβαση στην πλατφόρμα για συνεργάτες γίνεται μέσω μηνιαίας συνδρομής. Η About Traveller λειτουργεί με 0% προμήθεια για τους ταξιδιώτες. Οι πληρωμές επεξεργάζονται με ασφάλεια μέσω Stripe.",
        },
        {
          icon: AlertTriangle,
          title: "5. Πολιτική Περιεχομένου",
          content:
            "Απαγορεύεται η δημοσίευση spam, παραπλανητικού ή παράνομου περιεχομένου. Η About Traveller διατηρεί το δικαίωμα να αφαιρέσει ή να απόκρυψη καταχωρίσεις που παραβιάζουν τους όρους χρήσης, χωρίς προειδοποίηση.",
        },
        {
          icon: Scale,
          title: "6. Περιορισμός Ευθύνης",
          content:
            "Η About Traveller λειτουργεί ως πλατφόρμα σύνδεσης και δεν φέρει ευθύνη για τις συναλλαγές μεταξύ ταξιδιωτών και επιχειρήσεων. Δεν εγγυόμαστε την ακρίβεια των πληροφοριών που παρέχουν οι συνεργάτες.",
        },
        {
          icon: Mail,
          title: "7. Επικοινωνία",
          content:
            "Για οποιαδήποτε ερώτηση σχετικά με τους όρους χρήσης, επικοινωνήστε μαζί μας στο info@aboutraveller.com.",
        },
      ]
    : [
        {
          icon: FileText,
          title: "1. General Terms",
          content:
            "The About Traveller platform provides discovery and connection services between travelers and local businesses in Greece, including accommodation, car and motorcycle rentals, and restaurants. Using the platform implies acceptance of these terms.",
        },
        {
          icon: Users,
          title: "2. Users / Travelers",
          content:
            "Travelers can search and contact businesses directly through the platform at no charge. About Traveller does not charge commission to travelers. Users are responsible for the accuracy of their information.",
        },
        {
          icon: Store,
          title: "3. Partners / Businesses",
          content:
            "Businesses can register as partners and create listings in categories: Accommodation, Car Rental, Moto Rental, and Restaurants. Each partner is responsible for the accuracy of their listing information.",
        },
        {
          icon: CreditCard,
          title: "4. Subscriptions & Payments",
          content:
            "Partner access to the platform is through a monthly subscription. About Traveller operates with 0% commission for travelers. Payments are securely processed via Stripe.",
        },
        {
          icon: AlertTriangle,
          title: "5. Content Policy",
          content:
            "Publishing spam, misleading, or illegal content is prohibited. About Traveller reserves the right to remove or hide listings that violate the terms of use, without prior notice.",
        },
        {
          icon: Scale,
          title: "6. Limitation of Liability",
          content:
            "About Traveller operates as a connection platform and is not responsible for transactions between travelers and businesses. We do not guarantee the accuracy of information provided by partners.",
        },
        {
          icon: Mail,
          title: "7. Contact",
          content:
            "For any questions about the terms of use, please contact us at info@aboutraveller.com.",
        },
      ];

  return (
    <>
      <SEOHead
        title={isGreek ? "Όροι και Προϋποθέσεις - About Traveller" : "Terms & Conditions - About Traveller"}
        description={isGreek ? "Όροι και προϋποθέσεις χρήσης της πλατφόρμας About Traveller." : "Terms and conditions for the About Traveller platform."}
        path="/terms"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {isGreek ? "Όροι και Προϋποθέσεις" : "Terms & Conditions"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isGreek
                ? "Διαβάστε τους όρους χρήσης της πλατφόρμας About Traveller."
                : "Read the terms of use for the About Traveller platform."}
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8 flex gap-5 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-2">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-10">
            {isGreek
              ? "Τελευταία ενημέρωση: Μάρτιος 2026"
              : "Last updated: March 2026"}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsPage;
