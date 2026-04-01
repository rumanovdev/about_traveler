import { useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Download, Globe, Mail, Camera, Check } from "lucide-react";

const atrLogoWhite = "/assets/atr_full_lightblue.svg";
const atrLogoWhiteCyan = "/assets/atr_logo_whitecyan.png";
const presCover = "/assets/pres-cover.jpg";
const presClosing = "/assets/pres-closing.jpg";
const presCategories = "/assets/pres-categories.jpg";
const heroBg = "/assets/hero-bg.jpg";
const whyChooseBg = "/assets/why-choose-bg.jpg";
const presTarget = "/assets/pres-target.jpg";

const PresentationPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = contentRef.current;
    if (!element) return;

    (html2pdf() as any)
      .set({
        margin: 0,
        filename: "AboutTraveller-Presentation.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        pagebreak: { mode: ["css", "legacy"], before: ".pdf-page-break" },
      })
      .from(element)
      .save();
  };

  return (
    <>
      <SEOHead
        title="About Traveller | Παρουσίαση"
        description="Παρουσίαση της πλατφόρμας About Traveller."
        path="/presentation"
        noindex
      />
      <Header />
      <main className="min-h-screen pt-28 pb-20 bg-muted">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Download Button */}
          <div className="flex justify-end mb-6 print:hidden">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              <Download size={18} />
              Κατέβασε PDF
            </button>
          </div>

          {/* PDF Content */}
          <div ref={contentRef} className="bg-background rounded-2xl shadow-xl overflow-hidden">
            {/* Slide 1 — Cover with Santorini background */}
            <div className="relative flex flex-col items-center justify-center min-h-[560px] p-12 text-center bg-gradient-to-br from-primary via-primary/90 to-[hsl(var(--sky-light))]">
              <div className="relative z-10">
                <img src={atrLogoWhiteCyan} alt="About Traveller" className="h-16 mb-6 mx-auto drop-shadow-lg" />
                <p className="text-xl text-white/90 font-medium max-w-lg">
                  Η πλατφόρμα που συνδέει ταξιδιώτες με τοπικές επιχειρήσεις στην Ελλάδα
                </p>
              </div>
              <div className="absolute bottom-6 text-primary-foreground text-sm z-10">aboutraveller.com</div>
            </div>

            {/* Slide 2 — Τι είναι (with categories image) */}
            <div className="pdf-page-break min-h-[560px] flex flex-col justify-center">
              <div className="grid md:grid-cols-2 min-h-[560px]">
                <div className="p-10 md:p-14 flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3">01</span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 whitespace-nowrap">
                    Τι είναι το About Traveller;
                  </h2>
                  <p className="text-2xl font-bold text-primary mb-6">
                    Η πλατφόρμα κρατήσεων με 0% προμήθεια.
                  </p>
                  <div className="space-y-2.5">
                    {["Διαμονή (Ξενοδοχεία, Βίλες, Airbnb)", "Ενοικίαση Αυτοκινήτου", "Ενοικίαση Μηχανής/Scooter", "Εστιατόρια & Ταβέρνες", "Δραστηριότητες & Εκδρομές"].map((cat, i) => (
                      <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-2.5">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-foreground font-medium text-sm">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block relative">
                  <img src={presCategories} alt="Κατηγορίες" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Slide 3 — Πώς λειτουργεί (with background image) */}
            <div className="pdf-page-break relative min-h-[560px] flex flex-col justify-center overflow-hidden" style={{ pageBreakInside: 'avoid' }}>
              <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white/90" />
              <div className="relative z-10 p-10 md:p-14">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">02</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                  Πώς Λειτουργεί;
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {[
                    { num: "1", title: "Αναζήτηση", desc: "Ο ταξιδιώτης αναζητά ανά κατηγορία και τοποθεσία." },
                    { num: "2", title: "Επικοινωνία", desc: "Επικοινωνεί απευθείας με την επιχείρηση (τηλ, email, chat)." },
                    { num: "3", title: "Κράτηση", desc: "Κλείνει απευθείας χωρίς ενδιάμεσο και χωρίς προμήθεια." },
                  ].map((step) => (
                    <div key={step.num} className="rounded-xl p-6 border border-border shadow-md" style={{ flex: '1', backgroundColor: 'white', pageBreakInside: 'avoid' }}>
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                        {step.num}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-foreground text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                  <div className="rounded-xl p-6 border border-border" style={{ flex: '1', backgroundColor: 'white', pageBreakInside: 'avoid' }}>
                    <h3 className="font-bold text-foreground mb-2">Για Επιχειρήσεις</h3>
                    <p className="text-foreground text-sm">Εγγράφονται, δημιουργούν καταχώρηση με φωτογραφίες, περιγραφή και στοιχεία. Διαχείριση μέσω dashboard.</p>
                  </div>
                  <div className="rounded-xl p-6 border border-border" style={{ flex: '1', backgroundColor: 'white', pageBreakInside: 'avoid' }}>
                    <h3 className="font-bold text-foreground mb-2">Για Ταξιδιώτες</h3>
                    <p className="text-foreground text-sm">Δωρεάν αναζήτηση, αποθήκευση αγαπημένων, chat με επιχειρήσεις. 0% κόστος.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 4 — Πλεονεκτήματα */}
            <div className="pdf-page-break min-h-[560px] p-10 md:p-14 flex flex-col justify-center bg-gradient-to-br from-primary via-primary/95 to-[hsl(var(--ocean))]">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">03</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
                Πλεονεκτήματα About Traveller
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "0% Προμήθεια", desc: "Καμία χρέωση ανά κράτηση, σε αντίθεση με Booking.com (15-25%) ή Airbnb (3-15%)." },
                  { title: "Απευθείας Επικοινωνία", desc: "Η επιχείρηση έχει πλήρη έλεγχο στην επικοινωνία με τον πελάτη." },
                  { title: "Δίγλωσσο (GR/EN)", desc: "Προσέγγιση τόσο ελληνόφωνου κοινού όσο και διεθνών ταξιδιωτών." },
                  { title: "Analytics Dashboard", desc: "Στατιστικά προβολών, κλικ, emails. Real-time insights για τις καταχωρήσεις." },
                  { title: "Χαμηλό Κόστος Συνδρομής", desc: "Μηνιαία συνδρομή αντί τεράστιων προμηθειών. Σταθερό, προβλέψιμο κόστος." },
                  { title: "Chat & Μηνύματα", desc: "Ενσωματωμένο σύστημα μηνυμάτων μεταξύ ταξιδιωτών και επιχειρήσεων." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                      <p className="text-white font-bold text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide 5 — Ανταγωνισμός */}
            <div className="pdf-page-break min-h-[560px] p-10 md:p-14 flex flex-col justify-center bg-background">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3">04</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                Σύγκριση με Ανταγωνισμό
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left py-4 px-5 text-foreground font-bold">Χαρακτηριστικό</th>
                      <th className="text-center py-4 px-5 text-primary font-bold bg-primary/10">About Traveller</th>
                      <th className="text-center py-4 px-5 text-foreground font-bold">Booking.com</th>
                      <th className="text-center py-4 px-5 text-foreground font-bold">Airbnb</th>
                      <th className="text-center py-4 px-5 text-foreground font-bold">TripAdvisor</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {[
                      ["Προμήθεια", "0%", "15-25%", "3-15%", "Διαφημίσεις"],
                      ["Απευθείας Επικοινωνία", "✅", "❌", "❌", "Μερική"],
                      ["Κόστος για Ταξιδιώτη", "Δωρεάν", "Δωρεάν", "Service Fee", "Δωρεάν"],
                      ["SEO per Listing", "✅", "Περιορισμένο", "Περιορισμένο", "❌"],
                      ["Analytics Dashboard", "✅", "Βασικό", "Βασικό", "Πληρωμένο"],
                      ["Ελληνική Υποστήριξη", "✅", "Περιορισμένη", "Περιορισμένη", "❌"],
                      ["Chat", "✅", "❌", "✅", "❌"],
                      ["Κόστος Εισόδου", "Χαμηλή Συνδρομή", "Υψηλό", "Μέτριο", "Υψηλό"],
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-background" : "bg-muted/30"}`}>
                        <td className="py-3 px-5 font-medium text-foreground">{row[0]}</td>
                        <td className="py-3 px-5 text-center font-bold text-primary bg-primary/5">{row[1]}</td>
                        <td className="py-3 px-5 text-center">{row[2]}</td>
                        <td className="py-3 px-5 text-center">{row[3]}</td>
                        <td className="py-3 px-5 text-center">{row[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Slide 6 — Μειονεκτήματα Ανταγωνισμού (with subtle bg) */}
            <div className="pdf-page-break relative min-h-[560px] flex flex-col justify-center overflow-hidden">
              <img src={whyChooseBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white/95" />
              <div className="relative z-10 p-10 md:p-14">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">05</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                  Μειονεκτήματα Ανταγωνιστών
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm border border-destructive/20 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-3 text-lg">Booking.com</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li>• Προμήθεια 15-25% ανά κράτηση</li>
                      <li>• Δεν επιτρέπει απευθείας επικοινωνία</li>
                      <li>• Ελέγχει τη σχέση πελάτη-ξενοδόχου</li>
                      <li>• Πίεση για χαμηλές τιμές (rate parity)</li>
                      <li>• Εξάρτηση, δύσκολο να φύγεις</li>
                    </ul>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-destructive/20 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-3 text-lg">Airbnb</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li>• Service fee για τον ταξιδιώτη (14%+)</li>
                      <li>• Πολύ μεγάλη εξάρτηση από reviews</li>
                      <li>• Ακυρωτικές πολιτικές υπέρ ταξιδιωτών</li>
                      <li>• Δεν εστιάζει σε Ελληνική αγορά</li>
                      <li>• Μόνο καταλύματα, όχι car rental</li>
                    </ul>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-destructive/20 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-3 text-lg">TripAdvisor</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li>• Πληρωμένη προβολή (pay-to-play)</li>
                      <li>• Αδιαφανές σύστημα κατάταξης</li>
                      <li>• Fake reviews πρόβλημα</li>
                      <li>• Δεν υπάρχει booking, μόνο redirect</li>
                      <li>• Καμία εστίαση στον Ελληνικό χώρο</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 7 — Συνδρομή */}
            <div className="pdf-page-break min-h-[560px] p-10 md:p-14 flex flex-col justify-center bg-muted/50">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3">06</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                Μοντέλο Συνδρομής
              </h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div className="bg-background rounded-2xl p-8 border-2 border-border shadow-sm text-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">Δωρεάν για Ταξιδιώτες</h3>
                  <div className="text-4xl font-bold text-primary my-4">€0</div>
                  <ul className="space-y-2 text-sm text-foreground font-bold text-left">
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Απεριόριστη αναζήτηση</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Αγαπημένα & αποθήκευση</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Chat με επιχειρήσεις</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Χωρίς service fees</li>
                  </ul>
                </div>
                <div className="bg-background rounded-2xl p-8 border-2 border-primary shadow-lg text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Για Επιχειρήσεις
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Μηνιαία Συνδρομή</h3>
                  <div className="text-4xl font-bold text-primary my-4">€15/μήνα</div>
                  <ul className="space-y-2 text-sm text-foreground font-bold text-left">
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> 0% προμήθεια κρατήσεων</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Απεριόριστες καταχωρήσεις</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Analytics dashboard</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary flex-shrink-0" /> Απευθείας leads</li>
                  </ul>
                </div>
              </div>
              <p className="text-center text-foreground font-bold text-sm mt-8">
                Σταθερό, προβλέψιμο κόστος. Χωρίς κρυφές χρεώσεις.
              </p>
            </div>

            {/* Slide 8 — Target Market (split layout with image) */}
            <div className="pdf-page-break min-h-[560px] flex flex-col md:flex-row">
              <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3">07</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                  Target Market
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">Επιχειρήσεις</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        <span>Μικρομεσαίες τουριστικές επιχειρήσεις</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        <span>Ξενοδοχεία & καταλύματα σε όλη την Ελλάδα</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        <span>Rent a car & moto rental εταιρείες</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        <span>Εστιατόρια & ταβέρνες τουριστικών περιοχών</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">Ταξιδιώτες</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sky-light))] flex-shrink-0 mt-2" />
                        <span>Έλληνες που ψάχνουν τοπικές υπηρεσίες χωρίς μεσάζοντες</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sky-light))] flex-shrink-0 mt-2" />
                        <span>Ξένοι τουρίστες που ψάχνουν αυθεντικές εμπειρίες</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sky-light))] flex-shrink-0 mt-2" />
                        <span>Digital nomads & long-stay travelers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sky-light))] flex-shrink-0 mt-2" />
                        <span>Οικογένειες & ζευγάρια που σχεδιάζουν διακοπές</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="hidden md:block md:w-1/2 relative">
                <img src={presTarget} alt="Ελλάδα" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>

            {/* Slide 9 — Closing with harbor background */}
            <div className="pdf-page-break min-h-[560px] flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary via-primary/90 to-[hsl(var(--sky-light))]">
              <img src={atrLogoWhiteCyan} alt="About Traveller" className="h-12 mb-8 mx-auto drop-shadow-lg" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ευχαριστούμε!
              </h2>
              <p className="text-lg text-primary-foreground max-w-xl mb-8">
                Η πλατφόρμα που αλλάζει τον τρόπο που οι ταξιδιώτες ανακαλύπτουν την Ελλάδα.
              </p>
              <div className="space-y-4 text-primary-foreground text-base font-semibold">
                <p className="flex items-center justify-center gap-3"><Globe size={20} /> aboutraveller.com</p>
                <p className="flex items-center justify-center gap-3"><Mail size={20} /> info@aboutraveller.com</p>
                <p className="flex items-center justify-center gap-3"><Camera size={20} /> @aboutraveller</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PresentationPage;
