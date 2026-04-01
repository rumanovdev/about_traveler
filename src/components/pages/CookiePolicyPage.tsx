import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { Cookie, Shield, Settings, Eye, ToggleRight, Mail } from "lucide-react";

const CookiePolicyPage = () => {
  const { lang } = useLanguage();
  const isGreek = lang === "el";

  const sections = isGreek
    ? [
        {
          icon: Cookie,
          title: "1. Τι είναι τα Cookies;",
          content:
            "Τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στη συσκευή σας όταν επισκέπτεστε τον ιστότοπό μας. Μας βοηθούν να κατανοήσουμε πώς χρησιμοποιείτε την πλατφόρμα About Traveller και να βελτιώσουμε την εμπειρία σας.",
        },
        {
          icon: Settings,
          title: "2. Τύποι Cookies που Χρησιμοποιούμε",
          content:
            "Απαραίτητα Cookies: Είναι απαραίτητα για τη λειτουργία του ιστότοπου, όπως η σύνδεση στον λογαριασμό σας και η πλοήγηση στις κατηγορίες (Διαμονή, Ενοικίαση Αυτοκινήτου, κ.λπ.). Cookies Ανάλυσης: Μας βοηθούν να κατανοήσουμε πώς οι χρήστες αλληλεπιδρούν με την πλατφόρμα μας, ώστε να βελτιώσουμε τις υπηρεσίες μας. Cookies Λειτουργικότητας: Αποθηκεύουν τις προτιμήσεις σας, όπως τη γλώσσα και τις αγαπημένες αναζητήσεις.",
        },
        {
          icon: Shield,
          title: "3. Πώς Χρησιμοποιούμε τα Cookies",
          content:
            "Χρησιμοποιούμε τα cookies για να διασφαλίσουμε την ασφαλή λειτουργία της πλατφόρμας, να θυμόμαστε τις προτιμήσεις σας, να αναλύουμε την επισκεψιμότητα και να βελτιώνουμε τις υπηρεσίες μας προς ταξιδιώτες και συνεργάτες.",
        },
        {
          icon: Eye,
          title: "4. Cookies Τρίτων",
          content:
            "Ενδέχεται να χρησιμοποιούμε cookies από τρίτους παρόχους, όπως εργαλεία ανάλυσης και κοινωνικά δίκτυα (Instagram, Facebook), για να βελτιώσουμε την εμπειρία σας και να μετρήσουμε την αποτελεσματικότητα της πλατφόρμας μας.",
        },
        {
          icon: ToggleRight,
          title: "5. Διαχείριση Cookies",
          content:
            "Μπορείτε να ελέγχετε και να διαγράφετε τα cookies μέσω των ρυθμίσεων του προγράμματος περιήγησής σας. Σημειώστε ότι η απενεργοποίηση ορισμένων cookies μπορεί να επηρεάσει τη λειτουργικότητα της πλατφόρμας.",
        },
        {
          icon: Mail,
          title: "6. Επικοινωνία",
          content:
            "Για οποιαδήποτε ερώτηση σχετικά με την πολιτική cookies, επικοινωνήστε μαζί μας στο info@aboutraveller.com.",
        },
      ]
    : [
        {
          icon: Cookie,
          title: "1. What Are Cookies?",
          content:
            "Cookies are small text files stored on your device when you visit our website. They help us understand how you use the About Traveller platform and improve your experience.",
        },
        {
          icon: Settings,
          title: "2. Types of Cookies We Use",
          content:
            "Essential Cookies: Required for the website to function, such as logging into your account and navigating categories (Accommodation, Car Rental, etc.). Analytics Cookies: Help us understand how users interact with our platform so we can improve our services. Functional Cookies: Store your preferences, such as language and saved searches.",
        },
        {
          icon: Shield,
          title: "3. How We Use Cookies",
          content:
            "We use cookies to ensure secure platform operation, remember your preferences, analyze traffic, and improve our services for both travelers and partners.",
        },
        {
          icon: Eye,
          title: "4. Third-Party Cookies",
          content:
            "We may use cookies from third-party providers, such as analytics tools and social networks (Instagram, Facebook), to enhance your experience and measure platform effectiveness.",
        },
        {
          icon: ToggleRight,
          title: "5. Managing Cookies",
          content:
            "You can control and delete cookies through your browser settings. Note that disabling certain cookies may affect platform functionality.",
        },
        {
          icon: Mail,
          title: "6. Contact",
          content:
            "For any questions about our cookie policy, please contact us at info@aboutraveller.com.",
        },
      ];

  return (
    <>
      <SEOHead
        title={isGreek ? "Πολιτική Cookies - About Traveller" : "Cookie Policy - About Traveller"}
        description={isGreek ? "Πολιτική Cookies της πλατφόρμας About Traveller." : "Cookie Policy for the About Traveller platform."}
        path="/cookie-policy"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {isGreek ? "Πολιτική Cookies" : "Cookie Policy"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isGreek
                ? "Μάθετε πώς χρησιμοποιούμε τα cookies για να βελτιώσουμε την εμπειρία σας."
                : "Learn how we use cookies to improve your experience."}
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

export default CookiePolicyPage;
