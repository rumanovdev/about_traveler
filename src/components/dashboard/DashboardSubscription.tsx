import { useState } from "react";
import { CreditCard, CheckCircle, AlertCircle, Calendar, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardSubscriptionProps {
  subscription: any;
  onSubscriptionChange?: () => void;
}

const DashboardSubscription = ({ subscription, onSubscriptionChange }: DashboardSubscriptionProps) => {
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const { lang } = useLanguage();
  const [cancelling, setCancelling] = useState(false);

  const features = lang === "el"
    ? ["Απεριόριστες καταχωρίσεις", "Στατιστικά προβολών & κλικ", "Εμφάνιση στην αναζήτηση", "Υποστήριξη μέσω email"]
    : ["Unlimited listings", "Views & clicks statistics", "Search visibility", "Email support"];

  const handleCancel = async () => {
    const msg = lang === "el"
      ? "Είστε σίγουροι ότι θέλετε να ακυρώσετε τη συνδρομή σας; Οι καταχωρίσεις σας θα αποκρυφτούν."
      : "Are you sure you want to cancel your subscription? Your listings will be hidden.";
    if (!confirm(msg)) return;

    setCancelling(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to cancel");

      toast.success(lang === "el" ? "Η συνδρομή ακυρώθηκε" : "Subscription cancelled");
      onSubscriptionChange?.();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-travel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <CreditCard size={20} className="text-primary" />
            {lang === "el" ? "Τρέχον Πλάνο" : "Current Plan"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground">About Traveller Partner</h3>
              <p className="text-muted-foreground mt-1">15€ / {lang === "el" ? "μήνα" : "month"}</p>
              <div className="flex items-center gap-2 mt-3">
                {isActive ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {lang === "el" ? "Ενεργή Συνδρομή" : "Active Subscription"}
                    </span>
                  </>
                ) : isPastDue ? (
                  <>
                    <AlertCircle size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">
                      {lang === "el" ? "Εκκρεμής Πληρωμή" : "Payment Due"}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {lang === "el" ? "Ανενεργή" : "Inactive"}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {isActive ? (
                <>
                  <Button variant="outline" disabled>
                    {lang === "el" ? "Ενεργή" : "Active"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    <XCircle size={14} className="mr-1" />
                    {cancelling
                      ? (lang === "el" ? "Ακύρωση..." : "Cancelling...")
                      : (lang === "el" ? "Ακύρωση Συνδρομής" : "Cancel Subscription")}
                  </Button>
                </>
              ) : (
                <Button className="bg-gradient-sky text-primary-foreground">
                  {lang === "el" ? "Ενεργοποίηση Συνδρομής" : "Activate Subscription"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isActive && subscription && (
        <Card className="shadow-travel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Calendar size={20} className="text-primary" />
              {lang === "el" ? "Περίοδος Συνδρομής" : "Subscription Period"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{lang === "el" ? "Έναρξη Περιόδου" : "Period Start"}</p>
                <p className="font-medium text-foreground">
                  {subscription.current_period_start
                    ? new Date(subscription.current_period_start).toLocaleDateString(lang === "el" ? "el-GR" : "en-US")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{lang === "el" ? "Λήξη / Ανανέωση" : "End / Renewal"}</p>
                <p className="font-medium text-foreground">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString(lang === "el" ? "el-GR" : "en-US")
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-travel">
        <CardHeader>
          <CardTitle className="text-lg font-display">{lang === "el" ? "Τι περιλαμβάνει" : "What's included"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSubscription;
