import { FileText, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DashboardInvoices = () => {
  const { lang } = useLanguage();
  const invoices: any[] = [];

  return (
    <div className="space-y-6">
      <Card className="shadow-travel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <FileText size={20} className="text-primary" />
            {lang === "el" ? "Τιμολόγια" : "Invoices"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-10">
              <FileText size={40} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {lang === "el" ? "Δεν υπάρχουν τιμολόγια ακόμα." : "No invoices yet."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === "el"
                  ? "Τα τιμολόγια θα εμφανιστούν αυτόματα μετά την πρώτη πληρωμή."
                  : "Invoices will appear automatically after your first payment."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === "el" ? "Ημερομηνία" : "Date"}</TableHead>
                  <TableHead>{lang === "el" ? "Αριθμός" : "Number"}</TableHead>
                  <TableHead>{lang === "el" ? "Ποσό" : "Amount"}</TableHead>
                  <TableHead>{lang === "el" ? "Κατάσταση" : "Status"}</TableHead>
                  <TableHead className="text-right">{lang === "el" ? "Ενέργειες" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {new Date(invoice.date).toLocaleDateString(lang === "el" ? "el-GR" : "en-US")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{invoice.number}</TableCell>
                    <TableCell>{invoice.amount}€</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {invoice.status === "paid"
                          ? (lang === "el" ? "Πληρωμένο" : "Paid")
                          : (lang === "el" ? "Εκκρεμές" : "Pending")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Download size={14} className="mr-1" />
                          PDF
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink size={14} className="mr-1" />
                          {lang === "el" ? "Προβολή" : "View"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInvoices;
