import { CreditCard, Rocket, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingName: string;
  onPayment: () => void;
  loading?: boolean;
}

const PaywallDialog = ({ open, onOpenChange, listingName, onPayment, loading }: PaywallDialogProps) => {
  const { lang } = useLanguage();

  const features = lang === "el"
    ? [
        "Εμφάνιση στις αναζητήσεις",
        "Στατιστικά προβολών & κλικ",
        "Μηνύματα & chat με πελάτες",
        "Προβολή σε όλες τις κατηγορίες",
      ]
    : [
        "Appear in search results",
        "View & click analytics",
        "Messages & chat with customers",
        "Visibility across all categories",
      ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center sm:text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
          <AlertDialogTitle className="text-xl font-display">
            {lang === "el" ? "Δημοσιεύστε την καταχώρισή σας" : "Publish your listing"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {lang === "el"
              ? `Η καταχώριση "${listingName}" είναι έτοιμη! Ενεργοποιήστε τη συνδρομή σας για να γίνει ορατή στους επισκέπτες.`
              : `Your listing "${listingName}" is ready! Activate your subscription to make it visible to visitors.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 my-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onPayment}
            disabled={loading}
            className="w-full bg-gradient-sky text-primary-foreground"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading
              ? (lang === "el" ? "Παρακαλώ περιμένετε..." : "Please wait...")
              : (lang === "el" ? "Ενεργοποίηση Συνδρομής" : "Activate Subscription")}
          </Button>
          <AlertDialogCancel className="w-full mt-0">
            {lang === "el" ? "Αργότερα" : "Later"}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaywallDialog;
