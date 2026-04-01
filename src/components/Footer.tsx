import { Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-gradient-sky py-12 mt-16 pb-24 md:pb-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-display font-bold text-primary-foreground mb-4">About Traveller</h3>
            <p className="text-base text-primary-foreground">{t.footerDescription}</p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-primary-foreground mb-4">{t.footerAboutUs}</h4>
            <nav className="flex flex-col gap-2">
              <a href="/how-it-works" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{lang === "el" ? "Πώς Λειτουργεί" : "How It Works"}</a>
              <a href="/privacy-policy" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{t.footerPrivacyPolicy}</a>
              <a href="/cookie-policy" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{lang === "el" ? "Πολιτική Cookies" : "Cookie Policy"}</a>
              <a href="/terms" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{lang === "el" ? "Όροι και Προϋποθέσεις" : "Terms & Conditions"}</a>
              <a href="/blog" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">Blog</a>

              <a href="/auth" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{t.footerRegister}</a>
            </nav>
          </div>
          <div>
            <h4 className="text-base font-semibold text-primary-foreground mb-4">{t.categories}</h4>
            <nav className="flex flex-col gap-2">
              <a href="/diamonh" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{t.accommodation}</a>
              <a href="/car-moto" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">Car & Moto</a>
              <a href="/restaurants" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{t.restaurants}</a>
              <a href="/activities" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">{t.activities}</a>
              
            </nav>
          </div>
          <div>
            <h4 className="text-base font-semibold text-primary-foreground mb-4">{t.contact}</h4>
            <a href="mailto:info@aboutraveller.com" className="text-sm text-primary-foreground mb-4 inline-block hover:underline transition-colors">info@aboutraveller.com</a>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/aboutraveller/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/abouttraveller" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row items-center sm:justify-between justify-center text-center sm:text-left gap-4">
          <p className="text-sm text-primary-foreground">© 2026 About Traveller. {t.allRights}</p>
          <a href="https://itdev.gr" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors">Developed by IT DEV</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
