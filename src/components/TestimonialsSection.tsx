import { Star } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const testimonials = {
  el: [
    {
      name: "Σοφία Παπαδοπούλου",
      role: "Λάτρης Περιπέτειας",
      text: "Οι εμπειρίες ήταν απολύτως απίστευτες! Η προσοχή στη λεπτομέρεια και η τοπική εξειδίκευση έκαναν το ταξίδι μας αξέχαστο. Ανυπομονούμε για την επόμενη περιπέτειά μας!",
    },
    {
      name: "Γιώργος Αλεξίου",
      role: "Travel Blogger",
      text: "Έχω ταξιδέψει εκτενώς, αλλά αυτή η πλατφόρμα προσφέρει κάτι πραγματικά μοναδικό. Οι επιμελημένες εμπειρίες είναι αυθεντικές και άρτια οργανωμένες. Το συστήνω ανεπιφύλακτα!",
    },
    {
      name: "Μαρία Κωνσταντίνου",
      role: "Οικογενειακά Ταξίδια",
      text: "Ιδανικό για οικογένειες! Οι δραστηριότητες ήταν ελκυστικές τόσο για παιδιά όσο και για ενήλικες. Η διαδικασία κράτησης ήταν ομαλή και η ομάδα υποστήριξης πολύ εξυπηρετική.",
    },
  ],
  en: [
    {
      name: "Sofia Papadopoulou",
      role: "Adventure Lover",
      text: "The experiences were absolutely incredible! The attention to detail and local expertise made our trip unforgettable. We can't wait for our next adventure!",
    },
    {
      name: "George Alexiou",
      role: "Travel Blogger",
      text: "I've traveled extensively, but this platform offers something truly unique. The curated experiences are authentic and perfectly organized. I highly recommend it!",
    },
    {
      name: "Maria Konstantinou",
      role: "Family Travel",
      text: "Perfect for families! The activities were engaging for both kids and adults. The booking process was smooth and the support team was very helpful.",
    },
  ],
};

const TestimonialsSection = () => {
  const { lang } = useLanguage();
  const items = testimonials[lang];

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-3">
            {lang === "el" ? "Τι Λένε οι Ταξιδιώτες μας" : "What Our Travelers Say"}
          </h2>
          <p className="text-lg text-foreground max-w-xl mx-auto">
            {lang === "el"
              ? "Ανακαλύψτε γιατί οι ταξιδιώτες μας επιλέγουν για αξέχαστες εμπειρίες στην Ελλάδα"
              : "Discover why our travelers choose us for unforgettable experiences in Greece"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border"
            >
              <div className="mb-4">
                <h4 className="font-display font-bold text-foreground text-lg">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                "{item.text}"
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-orange-400 text-orange-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
