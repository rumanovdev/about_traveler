import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HostBanner from "@/components/HostBanner";
import CategorySection from "@/components/CategorySection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

import SEOHead from "@/components/SEOHead";
import FadeInSection from "@/components/FadeInSection";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "About Traveller",
    url: "https://aboutraveller.com",
    description: "Ανακαλύψτε διαμονή, car rental, εστιατόρια και ταξιδιωτικές υπηρεσίες σε όλη την Ελλάδα.",
    inLanguage: "el",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://aboutraveller.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "About Traveller",
    url: "https://aboutraveller.com",
    logo: "https://aboutraveller.com/white.png",
    sameAs: [
      "https://www.instagram.com/aboutraveller/",
      "https://www.facebook.com/abouttraveller",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@aboutraveller.com",
      contactType: "customer service",
      availableLanguage: ["Greek", "English"],
    },
  };

  return (
    <>
      <SEOHead
        title="About Traveller | Διαμονή, Car Rental, Εστιατόρια & Ταξίδια"
        description="Ανακαλύψτε διαμονή, car rental, εστιατόρια και ταξιδιωτικές υπηρεσίες σε όλη την Ελλάδα. Το About Traveller σας βοηθά να βρείτε τις καλύτερες επιλογές για το ταξίδι σας."
        path="/"
        jsonLd={[jsonLd, organizationLd]}
      />
      <Header />
      <main>
        <HeroSection />
        <FadeInSection>
          <HostBanner />
        </FadeInSection>
        <FadeInSection>
          <CategorySection />
        </FadeInSection>
        <FadeInSection>
          <WhyChooseUsSection />
        </FadeInSection>
        <FadeInSection>
          <HowItWorksSection />
        </FadeInSection>
        <FadeInSection>
          <TestimonialsSection />
        </FadeInSection>
      </main>
      <Footer />
    </>
  );
};

export default Index;
