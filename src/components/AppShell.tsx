import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
const MobileBottomBar = lazy(() => import("@/components/MobileBottomBar"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


const pages: Record<string, React.LazyExoticComponent<any>> = {
  Index: lazy(() => import("@/components/pages/Index")),
  AuthPage: lazy(() => import("@/components/pages/AuthPage")),
  CategoryPage: lazy(() => import("@/components/pages/CategoryPage")),
  ListingPage: lazy(() => import("@/components/pages/ListingPage")),
  BlogPage: lazy(() => import("@/components/pages/BlogPage")),
  BlogPostPage: lazy(() => import("@/components/pages/BlogPostPage")),
  PartnerDashboard: lazy(() => import("@/components/pages/PartnerDashboard")),
  AdminDashboard: lazy(() => import("@/components/pages/AdminDashboard")),
  VisitorDashboard: lazy(() => import("@/components/pages/VisitorDashboard")),
  PartnerRegisterPage: lazy(() => import("@/components/pages/PartnerRegisterPage")),
  ForgotPasswordPage: lazy(() => import("@/components/pages/ForgotPasswordPage")),
  ResetPasswordPage: lazy(() => import("@/components/pages/ResetPasswordPage")),
  PrivacyPolicyPage: lazy(() => import("@/components/pages/PrivacyPolicyPage")),
  HowItWorksPage: lazy(() => import("@/components/pages/HowItWorksPage")),
  CookiePolicyPage: lazy(() => import("@/components/pages/CookiePolicyPage")),
  TermsPage: lazy(() => import("@/components/pages/TermsPage")),
  BusinessModelPage: lazy(() => import("@/components/pages/BusinessModelPage")),
  PresentationPage: lazy(() => import("@/components/pages/PresentationPage")),
  NotFound: lazy(() => import("@/components/pages/NotFound")),
};

interface AppShellProps {
  page?: string;
  pageProps?: Record<string, any>;
  children?: ReactNode;
}

const AppShell = ({ page, pageProps = {}, children }: AppShellProps) => {

  const PageComponent = page ? pages[page] : null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={null}>
              {PageComponent ? <PageComponent {...pageProps} /> : children}
            </Suspense>
            <Suspense fallback={null}><MobileBottomBar /></Suspense>
            <Suspense fallback={null}><CookieConsent /></Suspense>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppShell;
