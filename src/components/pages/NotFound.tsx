
import { useEffect } from "react";
import { MapPin, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
  }, []);

  return (
    <>
      <SEOHead
        title="Σελίδα δεν βρέθηκε"
        description="Η σελίδα που ψάχνετε δεν υπάρχει. Επιστρέψτε στην αρχική σελίδα του About Traveller."
        path={typeof window !== 'undefined' ? window.location.pathname : '/404'}
        noindex
      />
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="mx-auto max-w-lg text-center">
          {/* Decorative icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-12 w-12 text-primary" />
          </div>

          <h1 className="mb-3 text-6xl font-bold text-foreground">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            Χάσαμε τον δρόμο!
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.
            Μην ανησυχείτε, μπορείτε να επιστρέψετε και να συνεχίσετε την εξερεύνηση.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href="/">
                <Home className="h-4 w-4" />
                Αρχική Σελίδα
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="/">
                <Search className="h-4 w-4" />
                Αναζήτηση Διαμονής
              </a>
            </Button>
          </div>

          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Επιστροφή στην προηγούμενη σελίδα
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;