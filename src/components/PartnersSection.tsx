import { useLanguage } from "@/hooks/useLanguage";
const partnerWebhotelier = "/assets/partner-webhotelier.png";
const partnerHotelbrain = "/assets/partner-hotelbrain.png";
const partnerPlasis = "/assets/partner-plasis.png";

const partners = [
  { name: "Webhotelier", logo: partnerWebhotelier, className: "h-28 md:h-40" },
  { name: "HotelBrain", logo: partnerHotelbrain, className: "h-36 md:h-52" },
  { name: "Plasis", logo: partnerPlasis, className: "h-28 md:h-40" },
];

const PartnersSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-3">
            {lang === "el" ? "Οι Συνεργάτες μας" : "Our Partners"}
          </h2>
          <p className="text-xl text-foreground max-w-lg mx-auto">
            {lang === "el"
              ? "Συνεργαζόμαστε με τους καλύτερους στον κλάδο"
              : "We partner with the best in the industry"}
          </p>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-12 md:gap-24">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={`${partner.className} w-auto object-contain`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
