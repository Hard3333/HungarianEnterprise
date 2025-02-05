import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, Contact } from "@shared/schema";
import { t } from "@/lib/i18n";
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
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  FileText,
  TrendingUp,
  CreditCard,
  Calendar,
  Plus,
  Receipt,
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  Loader2
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AnimatedContent } from "@/components/layout/animated-content";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// Form schemas
const billSchema = z.object({
  supplierName: z.string().min(1, "Kötelező mező"),
  invoiceNumber: z.string().min(1, "Kötelező mező"),
  amount: z.string().min(1, "Kötelező mező"),
  dueDate: z.string(),
  category: z.string().min(1, "Kötelező mező"),
  notes: z.string().optional(),
});

type BillFormData = z.infer<typeof billSchema>;

export default function Invoices() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(data);
      setOpen(false);
      setIsSubmitting(false);
      form.reset();
    }, 1000);
  };

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const isLoading = isLoadingOrders || isLoadingContacts;

  // Outgoing invoices data
  const invoices = orders.filter(order => order.invoiceNumber);
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      contacts.find(c => c.id === invoice.contactId)?.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case "paid":
        return invoice.status === "completed";
      case "pending":
        return invoice.status === "pending";
      case "overdue":
        return invoice.status === "pending" && new Date(invoice.orderDate) < new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const totalRevenue = invoices.reduce((sum, invoice) =>
    invoice.status === "completed" ? sum + parseFloat(invoice.total) : sum, 0
  );

  const pendingRevenue = invoices.reduce((sum, invoice) =>
    invoice.status === "pending" ? sum + parseFloat(invoice.total) : sum, 0
  );

  const overdueCount = invoices.filter(invoice =>
    invoice.status === "pending" && new Date(invoice.orderDate) < new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  ).length;

  // Incoming bills data (test data)
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

  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingBillsCount = bills.length;
  const avgBillAmount = totalBills / bills.length;

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayInvoices = invoices.filter(invoice =>
      new Date(invoice.orderDate).toDateString() === date.toDateString()
    );
    return {
      date: date.toLocaleDateString('hu', { month: 'short', day: 'numeric' }),
      total: dayInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.total), 0),
    };
  }).reverse();

  return (
    <PageLayout
      title={t("invoices")}
      description="Számlák kezelése és áttekintése"
    >
      <AnimatedItem>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="outgoing">Kimenő számlák</TabsTrigger>
            <TabsTrigger value="incoming">Bejövő számlák</TabsTrigger>
          </TabsList>

          <TabsContent value="outgoing">
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              {[
                {
                  title: "Összes bevétel",
                  icon: TrendingUp,
                  value: isLoading ? <Skeleton className="h-8 w-24" /> : `${totalRevenue.toLocaleString()} Ft`,
                  subtitle: `${invoices.filter(i => i.status === "completed").length} teljesített számla`
                },
                {
                  title: "Függőben lévő",
                  icon: CreditCard,
                  value: isLoading ? <Skeleton className="h-8 w-24" /> : `${pendingRevenue.toLocaleString()} Ft`,
                  subtitle: `${invoices.filter(i => i.status === "pending").length} kifizetetlen számla`
                },
                {
                  title: "Késedelmes",
                  icon: Calendar,
                  value: isLoading ? <Skeleton className="h-8 w-24" /> : `${overdueCount} db`,
                  subtitle: "15 napnál régebbi számla"
                },
                {
                  title: "Átlagos fizetési idő",
                  icon: FileText,
                  value: isLoading ? <Skeleton className="h-8 w-24" /> : "8.5 nap",
                  subtitle: "az elmúlt 30 napban"
                }
              ].map((stat, index) => (
                <AnimatedItem key={index}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedItem>
              ))}
            </div>

            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Keresés számlaszám vagy ügyfél alapján..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Státusz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes számla</SelectItem>
                  <SelectItem value="paid">Kifizetett</SelectItem>
                  <SelectItem value="pending">Függőben</SelectItem>
                  <SelectItem value="overdue">Késedelmes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Számlaszám</TableHead>
                    <TableHead>Ügyfél</TableHead>
                    <TableHead>Dátum</TableHead>
                    <TableHead>Státusz</TableHead>
                    <TableHead>Összeg</TableHead>
                    <TableHead>Fizetési határidő</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const customer = contacts.find(c => c.id === invoice.contactId);
                    const dueDate = new Date(invoice.orderDate);
                    dueDate.setDate(dueDate.getDate() + 15);
                    const isOverdue = invoice.status === "pending" && dueDate < new Date();

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{customer?.name}</TableCell>
                        <TableCell>
                          {new Date(invoice.orderDate).toLocaleDateString("hu")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={invoice.status === "completed" ? "default" : "secondary"}
                            className={isOverdue ? "bg-destructive" : undefined}
                          >
                            {isOverdue ? "Késedelmes" : invoice.status === "completed" ? "Kifizetett" : "Függőben"}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseFloat(invoice.total).toLocaleString()} Ft</TableCell>
                        <TableCell>
                          {dueDate.toLocaleDateString("hu")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="incoming">
            <div className="flex justify-end mb-6">
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
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mentés...
                          </>
                        ) : (
                          'Mentés'
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <AnimatedItem>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Összes kifizetendő
                    </CardTitle>
                    <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalBills.toLocaleString()} Ft
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pendingBillsCount} db számla
                    </p>
                  </CardContent>
                </Card>
              </AnimatedItem>

              <AnimatedItem>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Következő fizetés
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
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
              </AnimatedItem>

              <AnimatedItem>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Átlagos számlaérték
                    </CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {avgBillAmount.toLocaleString()} Ft
                    </div>
                    <p className="text-xs text-muted-foreground">
                      az elmúlt 30 napban
                    </p>
                  </CardContent>
                </Card>
              </AnimatedItem>
            </div>

            <AnimatedItem>
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
            </AnimatedItem>
          </TabsContent>
        </Tabs>
      </AnimatedItem>
    </PageLayout>
  );
}