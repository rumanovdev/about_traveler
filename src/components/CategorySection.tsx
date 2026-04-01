import { useLanguage } from "@/hooks/useLanguage";
const catAccommodation = "/assets/cat-accommodation.jpg";
const catCarRental = "/assets/cat-car-rental.jpg";
const catRestaurants = "/assets/cat-restaurants.jpg";
const catActivities = "/assets/cat-activities.jpg";


const CategorySection = () => {
  const { lang } = useLanguage();

  const categoryData = [
    {
      title: lang === "el" ? "Διαμονή" : "Accommodation",
      slug: "diamonh",
      image: catAccommodation,
      description: lang === "el" ? "Ξενοδοχεία, βίλες & διαμερίσματα για κάθε γούστο" : "Hotels, villas & apartments for every taste",
    },
    {
      title: "Car & Moto",
      slug: "car-moto",
      image: catCarRental,
      description: lang === "el" ? "Αυτοκίνητα, μηχανές & σκούτερ για τις διαδρομές σας" : "Cars, motorcycles & scooters for your journeys",
    },
    {
      title: lang === "el" ? "Φαγητό & Ποτό" : "Food & Drink",
      slug: "restaurants",
      image: catRestaurants,
      description: lang === "el" ? "Γεύσεις που αξίζει να δοκιμάσετε σε κάθε προορισμό" : "Flavors worth trying at every destination",
    },
    {
      title: lang === "el" ? "Δραστηριότητες" : "Activities",
      slug: "activities",
      image: catActivities,
      description: lang === "el" ? "Εμπειρίες & περιπέτειες που δεν θα ξεχάσετε" : "Experiences & adventures you won't forget",
    },
  ];

  return (
    <section id="categories" className="py-16 md:py-24 bg-background">
      <div className="container max-w-[1400px]">
        <div className="mb-12">
          <h2 className="text-xl md:text-3xl font-display font-bold text-foreground tracking-tight uppercase">
            {lang === "el" ? "Δημοφιλείς Κατηγορίες" : "Popular Categories"}
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {categoryData.map((cat) => (
            <a
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group flex-shrink-0 w-[280px] md:w-auto snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[2/3]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={533}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-foreground/10" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-display font-bold text-primary-foreground">
                    {cat.title}
                  </h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
