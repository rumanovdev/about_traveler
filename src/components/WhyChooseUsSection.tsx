import { useLanguage } from "@/hooks/useLanguage";
const whyChooseBg = "/assets/why-choose-bg.jpg";

const WhyChooseUsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="relative min-h-[500px] flex items-center">
      <img
        src={whyChooseBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        width={1200}
        height={500}
      />
      <div className="absolute inset-0 bg-foreground/70" />
      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
            <span className="text-primary-foreground">
              {lang === "el" ? "Γιατί" : "Why"}
            </span>{" "}
            {lang === "el" ? "να μας επιλέξετε" : "choose us"}
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-primary-foreground/90 mb-8">
            {lang === "el"
              ? "Προσφέρουμε επιλεγμένες, premium εμπειρίες σχεδιασμένες να μετατρέψουν τις διακοπές σας σε κάτι πραγματικά αξέχαστο. Κάθε δραστηριότητα είναι προσεκτικά επιμελημένη για να εξασφαλίσει αυθεντικότητα, εξαιρετική εξυπηρέτηση και αξέχαστες στιγμές. Είτε αναζητάτε περιπέτεια, χαλάρωση ή πολιτιστική εμβάθυνση, η πλατφόρμα μας σας συνδέει με τις καλύτερες εμπειρίες, με επαγγελματισμό και τοπική γνώση."
              : "We offer curated, premium experiences designed to transform your holidays into something truly unforgettable. Every activity is carefully selected to ensure authenticity, excellent service, and memorable moments. Whether you're seeking adventure, relaxation, or cultural immersion, our platform connects you with the best experiences, with professionalism and local knowledge."}
          </p>
          <a
            href="#categories"
            className="inline-block px-8 py-3 rounded-lg bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {lang === "el" ? "Εξερευνήστε Τώρα" : "Explore Now"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
