import { lazy, Suspense, useEffect, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { PostHogProvider } from "@posthog/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import MobileBottomBar from "@/components/MobileBottomBar";
import CookieConsent from "@/components/CookieConsent";

const queryClient = new QueryClient();

const posthogOptions = {
  api_host: "https://eu.i.posthog.com",
  defaults: "2026-01-30",
} as const;

let sentryInitialized = false;

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
  useEffect(() => {
    if (!sentryInitialized) {
      Sentry.init({
        dsn: "https://a11bcd378564faf302387b6358699253@o4511047411826688.ingest.de.sentry.io/4511047418511440",
        sendDefaultPii: true,
      });
      sentryInitialized = true;
    }
  }, []);

  const PageComponent = page ? pages[page] : null;

  return (
    <PostHogProvider apiKey="phc_8pP0vGQ32TIW8gr2Luymg4VT0Qwvc5w8eF0Tbwgdrpb" options={posthogOptions}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<div className="min-h-screen" />}>
                {PageComponent ? <PageComponent {...pageProps} /> : children}
              </Suspense>
              <MobileBottomBar />
              <CookieConsent />
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
};

export default AppShell;
