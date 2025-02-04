import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Plus, Receipt, BanknoteIcon, ArrowDownIcon } from "lucide-react";

const billSchema = z.object({
  supplierName: z.string().min(1, "Kötelező mező"),
  invoiceNumber: z.string().min(1, "Kötelező mező"),
  amount: z.string().min(1, "Kötelező mező"),
  dueDate: z.string(),
  category: z.string().min(1, "Kötelező mező"),
  notes: z.string().optional(),
});

type BillFormData = z.infer<typeof billSchema>;

export default function Bills() {
  const [open, setOpen] = useState(false);

  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      supplierName: "",
      invoiceNumber: "",
      amount: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      category: "",
      notes: "",
    },
  });

  const onSubmit = (data: BillFormData) => {
    console.log(data);
    setOpen(false);
    form.reset();
  };

  // Dummy data for demonstration
  const bills = [
    {
      id: 1,
      supplierName: "Tech Solutions Kft.",
      invoiceNumber: "TSK-2024-001",
      amount: 2499000,
      dueDate: "2024-02-20",
      category: "Hardware",
      notes: "Q1 laptop beszerzés",
    },
    {
      id: 2,
      supplierName: "PC Parts Hungary",
      invoiceNumber: "PPH-2024-015",
      amount: 1377000,
      dueDate: "2024-02-25",
      category: "Components",
      notes: "Alkatrész utánpótlás",
    },
    {
      id: 3,
      supplierName: "ITGlobal Trade",
      invoiceNumber: "IGT-2024-008",
      amount: 899000,
      dueDate: "2024-03-01",
      category: "Accessories",
      notes: "Tartozék csomag",
    },
  ];

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingCount = bills.length;
  const avgAmount = totalAmount / bills.length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("bills")}</h1>
              <p className="text-muted-foreground">
                Bejövő számlák kezelése
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Új számla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Új számla hozzáadása</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="supplierName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beszállító neve</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Számlaszám</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Összeg (Ft)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fizetési határidő</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategória</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Megjegyzések</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Mentés
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Összes kifizetendő
                </CardTitle>
                <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalAmount.toLocaleString()} Ft
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingCount} db számla
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Következő fizetés
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  2024.02.20
                </div>
                <p className="text-xs text-muted-foreground">
                  5 nap múlva esedékes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Átlagos számlaérték
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgAmount.toLocaleString()} Ft
                </div>
                <p className="text-xs text-muted-foreground">
                  az elmúlt 30 napban
                </p>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beszállító</TableHead>
                <TableHead>Számlaszám</TableHead>
                <TableHead>Összeg</TableHead>
                <TableHead>Fizetési határidő</TableHead>
                <TableHead>Kategória</TableHead>
                <TableHead>Megjegyzések</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.supplierName}</TableCell>
                  <TableCell>{bill.invoiceNumber}</TableCell>
                  <TableCell>{bill.amount.toLocaleString()} Ft</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>{bill.category}</TableCell>
                  <TableCell>{bill.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
}