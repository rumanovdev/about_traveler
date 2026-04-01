import { Menu, X, User, LogOut, ChevronDown, Globe } from "lucide-react";
const logo = "/assets/atr_full_white.svg";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, hasRole, signOut } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isHome = pathname === "/";
  const transparentPages = ["/", "/diamonh", "/car-moto", "/restaurants"];
  const isTransparent = transparentPages.includes(pathname);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-foreground/80 backdrop-blur-md shadow-lg" : isTransparent ? "bg-transparent" : "bg-foreground/70 backdrop-blur-md"}`}>
      <div className="container flex items-center justify-center md:justify-between h-16">
        <a href="/" className="flex items-center">
          <img src={logo} alt="About Traveller" className="h-8" />
        </a>

        <nav className="hidden md:flex items-center gap-1">
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-medium backdrop-blur-sm hover:bg-primary-foreground/25 transition-colors border border-primary-foreground/20">
              <Globe size={14} />
              {lang === "el" ? "EL" : "EN"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("el")}>🇬🇷 Ελληνικά</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")}>🇬🇧 English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-medium backdrop-blur-sm hover:bg-primary-foreground/25 transition-colors border border-primary-foreground/20">
                  <User size={16} />
                  <span className="max-w-[120px] truncate">{user.email?.split("@")[0]}</span>
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    {lang === "el" ? "Πίνακας Ελέγχου" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    {lang === "el" ? "Μηνύματα" : "Messages"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    {lang === "el" ? "Καταχωρήσεις" : "Entries"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    {lang === "el" ? "Αγαπημένα" : "Favorites"}
                  </DropdownMenuItem>
                  {hasRole("partner") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                        {lang === "el" ? "Listings" : "Listings"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                        {lang === "el" ? "Πληρωμές" : "Payouts"}
                      </DropdownMenuItem>
                    </>
                  )}
                  {hasRole("admin") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                        {t.admin}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    {lang === "el" ? "Στοιχεία λογαριασμού" : "Account details"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut size={14} className="mr-2" />
                    {t.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <a
                href="/partner-register"
                className="px-5 py-2 rounded-full bg-gradient-sky text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
              >
                {lang === "el" ? "Καταχώρησε την επιχείρησή σου" : "Host your place"}
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-medium backdrop-blur-sm hover:bg-primary-foreground/25 transition-colors border border-primary-foreground/20"
              >
                <User size={16} />
                {t.signIn}
              </a>
              <a
                href="/partner-register"
                className="px-5 py-2 rounded-full bg-gradient-sky text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
              >
                {lang === "el" ? "Καταχώρησε την επιχείρησή σου" : "Host your place"}
              </a>
            </div>
          )}
        </div>

        {/* Mobile hamburger removed - using bottom bar instead */}
      </div>
    </header>
  );
};

export default Header;
