import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { Shield, Database, Share2, Lock, Clock, Cookie, UserCheck, AlertTriangle, RefreshCw, Mail } from "lucide-react";

const PrivacyPolicyPage = () => {
  const { lang } = useLanguage();
  const isGreek = lang === "el";

  const sections = isGreek
    ? [
        {
          icon: Shield,
          title: "1. Εισαγωγή",
          content:
            "Η ABOUT TRAVELLER λειτουργεί ως πλατφόρμα που συνδέει ταξιδιώτες με ιδιοκτήτες καταλυμάτων και επιχειρήσεις για τη διευκόλυνση κρατήσεων. Η πλατφόρμα μας λειτουργεί με 0% χρέωση για τους ταξιδιώτες, ενώ οι ιδιοκτήτες μπορούν να καταχωρίσουν τις υπηρεσίες τους με μηνιαία συνδρομή. Σεβόμαστε το απόρρητό σας και δεσμευόμαστε να προστατεύουμε τα προσωπικά δεδομένα ταξιδιωτών, ιδιοκτητών και επιχειρήσεων.",
        },
        {
          icon: Database,
          title: "2. Συλλογή και Χρήση Πληροφοριών",
          content:
            "Για Ταξιδιώτες: Συλλέγουμε προσωπικές πληροφορίες, όπως όνομα, στοιχεία επικοινωνίας, πληροφορίες πληρωμής και ιστορικό κρατήσεων, για τη διευκόλυνση κρατήσεων. Δεν αποθηκεύουμε στοιχεία πληρωμής· οι συναλλαγές επεξεργάζονται με ασφάλεια μέσω Stripe. Για Ιδιοκτήτες/Επιχειρήσεις: Συλλέγονται στοιχεία επικοινωνίας, πληροφορίες ακινήτου/επιχείρησης, τραπεζικά στοιχεία και στοιχεία συνδρομής.",
        },
        {
          icon: Share2,
          title: "3. Κοινοποίηση Πληροφοριών",
          content:
            "Δεν πουλάμε ούτε ενοικιάζουμε προσωπικές πληροφορίες σε τρίτους. Οι πληροφορίες μπορεί να κοινοποιηθούν: σε ιδιοκτήτες για τη διευκόλυνση κρατήσεων, σε επεξεργαστές πληρωμών (όπως η Stripe) για ασφαλείς συναλλαγές, και όταν απαιτείται από τον νόμο.",
        },
        {
          icon: Lock,
          title: "4. Μέτρα Ασφαλείας",
          content:
            "Εφαρμόζουμε μέτρα ασφαλείας σύμφωνα με τα πρότυπα της βιομηχανίας για την προστασία των προσωπικών δεδομένων από μη εξουσιοδοτημένη πρόσβαση, αλλοίωση ή καταστροφή.",
        },
        {
          icon: Clock,
          title: "5. Διατήρηση Δεδομένων",
          content:
            "Διατηρούμε τα προσωπικά δεδομένα για όσο χρόνο είναι απαραίτητο. Οι ταξιδιώτες μπορούν να διαγράψουν τον λογαριασμό τους, ενώ οι ιδιοκτήτες μπορούν να ζητήσουν διαγραφή λογαριασμού ή κατάργηση συνδρομής.",
        },
        {
          icon: Cookie,
          title: "6. Πολιτική Cookies",
          content:
            "Ο ιστότοπός μας χρησιμοποιεί cookies για τη βελτίωση της εμπειρίας χρήστη. Οι χρήστες μπορούν να διαχειριστούν τις προτιμήσεις cookies μέσω των ρυθμίσεων του προγράμματος περιήγησης. Υπηρεσίες τρίτων (π.χ. Google Analytics) μπορεί επίσης να χρησιμοποιούν cookies.",
        },
        {
          icon: UserCheck,
          title: "7. Δικαιώματα Χρηστών",
          content:
            "Οι ταξιδιώτες έχουν δικαίωμα πρόσβασης, ενημέρωσης ή διαγραφής των προσωπικών τους δεδομένων. Οι ιδιοκτήτες μπορούν να διαχειριστούν τις καταχωρίσεις τους και να ζητήσουν διαγραφή λογαριασμού.",
        },
        {
          icon: AlertTriangle,
          title: "8. Νομική Αποποίηση",
          content:
            "Η ABOUT TRAVELLER δεν ευθύνεται για τις ενέργειες ιδιοκτητών ή ταξιδιωτών στην πλατφόρμα. Οι χρήστες είναι υπεύθυνοι για την τήρηση των όρων και προϋποθέσεων.",
        },
        {
          icon: RefreshCw,
          title: "9. Αλλαγές στην Πολιτική Απορρήτου",
          content:
            "Διατηρούμε το δικαίωμα ενημέρωσης της πολιτικής απορρήτου. Οι χρήστες θα ειδοποιούνται για τυχόν αλλαγές και η συνέχιση χρήσης της πλατφόρμας συνιστά αποδοχή.",
        },
        {
          icon: Mail,
          title: "10. Στοιχεία Επικοινωνίας",
          content:
            "Για οποιαδήποτε ερώτηση σχετικά με την πολιτική απορρήτου, επικοινωνήστε μαζί μας στο info@aboutraveller.com.",
        },
      ]
    : [
        {
          icon: Shield,
          title: "1. Introduction",
          content:
            "ABOUT TRAVELLER operates a booking platform that connects travelers with property and business owners to facilitate accommodations and bookings. Our platform operates with a 0% fee on each booking for travelers, while property and business owners can list their offerings for a monthly fee. We respect your privacy and are committed to protecting the personal information of travelers, property owners, and businesses.",
        },
        {
          icon: Database,
          title: "2. Information Collection and Use",
          content:
            "For Travelers: We collect personal information, such as name, contact details, payment information, and booking history, to facilitate reservations. We do not store payment details; transactions are securely processed through Stripe. For Property and Business Owners: Information collected includes contact details, property/business details, banking information for payout, and subscription payment details.",
        },
        {
          icon: Share2,
          title: "3. Information Sharing",
          content:
            "We do not sell or rent personal information to third parties. Information may be shared: with property/business owners to facilitate bookings, with payment processors (such as Stripe) to process transactions securely, and when required by law or to protect our legal rights.",
        },
        {
          icon: Lock,
          title: "4. Security Measures",
          content:
            "We implement industry-standard security measures to protect personal data from unauthorized access, alteration, or destruction.",
        },
        {
          icon: Clock,
          title: "5. Data Retention",
          content:
            "We retain personal information for as long as necessary to fulfill the purposes outlined in this privacy policy. Travelers can delete their accounts to remove personal data, while property/business owners can request account deletion or unsubscribe from services.",
        },
        {
          icon: Cookie,
          title: "6. Cookie Policy",
          content:
            "Our website uses cookies to enhance user experience and track usage patterns. Users can manage cookie preferences through browser settings. Third-party services (e.g., Google Analytics) may also use cookies as per their respective policies.",
        },
        {
          icon: UserCheck,
          title: "7. User Rights",
          content:
            "Travelers have the right to access, update, or delete their personal information. Property/business owners can manage their listings, update information, and request account deletion.",
        },
        {
          icon: AlertTriangle,
          title: "8. Legal Disclaimer",
          content:
            "ABOUT TRAVELLER is not liable for the actions of property/business owners or travelers on the platform. Users are responsible for reviewing and complying with the terms and conditions of the platform.",
        },
        {
          icon: RefreshCw,
          title: "9. Changes to Privacy Policy",
          content:
            "We reserve the right to update our privacy policy. Users will be notified of any changes, and continued use of the platform after modifications constitute acceptance of the updated policy.",
        },
        {
          icon: Mail,
          title: "10. Contact Information",
          content:
            "For any inquiries or concerns regarding this privacy policy, please contact us at info@aboutraveller.com.",
        },
      ];

  return (
    <>
      <SEOHead
        title={isGreek ? "Πολιτική Απορρήτου - About Traveller" : "Privacy Policy - About Traveller"}
        description={isGreek ? "Πολιτική Απορρήτου της πλατφόρμας About Traveller." : "Privacy Policy for the About Traveller platform."}
        path="/privacy-policy"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {isGreek ? "Πολιτική Απορρήτου" : "Privacy Policy"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isGreek
                ? "Μάθετε πώς προστατεύουμε τα προσωπικά σας δεδομένα."
                : "Learn how we protect your personal data."}
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
              ? "Χρησιμοποιώντας το About Traveller, αποδέχεστε τους όρους αυτής της πολιτικής απορρήτου. Τελευταία ενημέρωση: Μάρτιος 2026"
              : "By using About Traveller, you agree to the terms outlined in this privacy policy. Last updated: March 2026"}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
