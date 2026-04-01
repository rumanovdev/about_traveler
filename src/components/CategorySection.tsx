import { useLanguage } from "@/hooks/useLanguage";

const categoryData = [
  { slug: "diamonh",    webp: "/assets/cat-accommodation.webp", jpg: "/assets/cat-accommodation.jpg" },
  { slug: "car-moto",  webp: "/assets/cat-car-rental.webp",    jpg: "/assets/cat-car-rental.jpg" },
  { slug: "restaurants",webp: "/assets/cat-restaurants.webp",  jpg: "/assets/cat-restaurants.jpg" },
  { slug: "activities", webp: "/assets/cat-activities.webp",   jpg: "/assets/cat-activities.jpg" },
];

const CategorySection = () => {
  const { lang } = useLanguage();

  const labels: Record<string, { title: string; description: string }> = {
    diamonh:     { title: lang === "el" ? "Διαμονή" : "Accommodation",     description: lang === "el" ? "Ξενοδοχεία, βίλες & διαμερίσματα για κάθε γούστο" : "Hotels, villas & apartments for every taste" },
    "car-moto":  { title: "Car & Moto",                                      description: lang === "el" ? "Αυτοκίνητα, μηχανές & σκούτερ για τις διαδρομές σας" : "Cars, motorcycles & scooters for your journeys" },
    restaurants: { title: lang === "el" ? "Φαγητό & Ποτό" : "Food & Drink", description: lang === "el" ? "Γεύσεις που αξίζει να δοκιμάσετε σε κάθε προορισμό" : "Flavors worth trying at every destination" },
    activities:  { title: lang === "el" ? "Δραστηριότητες" : "Activities",   description: lang === "el" ? "Εμπειρίες & περιπέτειες που δεν θα ξεχάσετε" : "Experiences & adventures you won't forget" },
  };

  return (
    <section id="categories" className="py-16 md:py-24 bg-background">
      <div className="container max-w-[1400px]">
        <div className="mb-12">
          <h2 className="text-xl md:text-3xl font-display font-bold text-foreground tracking-tight uppercase">
            {lang === "el" ? "Δημοφιλείς Κατηγορίες" : "Popular Categories"}
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {categoryData.map((cat) => {
            const label = labels[cat.slug];
            return (
              <a
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group flex-shrink-0 w-[280px] md:w-auto snap-start"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[2/3]">
                  <picture>
                    <source srcSet={cat.webp} type="image/webp" />
                    <img
                      src={cat.jpg}
                      alt={label.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={533}
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-foreground/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-display font-bold text-primary-foreground">
                      {label.title}
                    </h3>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
