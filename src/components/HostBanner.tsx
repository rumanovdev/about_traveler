import { useLanguage } from "@/hooks/useLanguage";
import { ArrowRight } from "lucide-react";
const hostBg = "/assets/host-banner-bg.jpg";

const HostBanner = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-16">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Welcome text */}
        <p className="text-center text-lg md:text-xl lg:text-[1.28rem] text-foreground mb-8 max-w-4xl mx-auto">
          {lang === "el"
            ? "Καλώς ήρθατε στην πρώτη Ελληνική booking εταιρεία. Θέλοντας να έχετε την καλύτερη εμπειρία, σας βοηθάμε να βρείτε τις καλύτερες υπηρεσίες για το ταξίδι σας."
            : "Welcome to the first Greek booking company. We help you find the best services for your trip."}
        </p>
      </div>

      {/* Full-width banner */}
      <div className="relative overflow-hidden group">
          <img
            src={hostBg}
            alt="Host your place"
            className="w-full h-[480px] md:h-[560px] object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/50" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6 drop-shadow-lg">
              {lang === "el" ? "Ανέβασε την επιχείρησή σου" : "Host your place now"}
            </h2>
            <a
              href="/partner-register"
              className="inline-flex items-center gap-3 bg-gradient-sky text-primary-foreground px-9 py-4 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              {lang === "el" ? "Ξεκινήστε" : "Get Started"}
              <ArrowRight size={18} />
            </a>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4">
        <p className="text-center text-lg md:text-xl text-foreground mt-8 max-w-4xl mx-auto">
          {lang === "el" ? (
            <>
              Διαφημίστε την επιχείρησή σας και προσεγγίστε χιλιάδες ταξιδιώτες.{" "}
              <a href="/business-model" className="text-primary font-semibold hover:text-muted-foreground transition-colors">
                Μάθετε περισσότερα
              </a>
            </>
          ) : (
            <>
              Advertise your business and reach thousands of travelers.{" "}
              <a href="/business-model" className="text-primary font-semibold hover:text-muted-foreground transition-colors">
                Learn more
              </a>
            </>
          )}
        </p>
      </div>
    </section>
  );
};

export default HostBanner;
