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
import { format, isWithinInterval, parseISO, subDays, subMonths, subYears, subQuarters } from "date-fns";
import {
  FileText,
  TrendingUp,
  CreditCard,
  Calendar,
  Plus,
  Receipt,
  BanknoteIcon,
  Loader2,
  Filter,
  Save,
  Trash2,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

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

// Enhanced filter types
type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year" | "custom";
type AmountFilter = { min: number; max: number };
type StatusFilter = ("completed" | "pending" | "overdue")[];
type SortDirection = "asc" | "desc";
type SortField = "date" | "amount" | "dueDate" | "status" | "customer";

interface FilterState {
  search: string;
  dateRange: DateRange;
  customDateStart?: string;
  customDateEnd?: string;
  amount: AmountFilter;
  statuses: StatusFilter;
  categories: string[];
  sortBy: SortField;
  sortDirection: SortDirection;
  saveFilter?: string;
}

const defaultFilter: FilterState = {
  search: "",
  dateRange: "all",
  amount: { min: 0, max: 10000000 },
  statuses: ["completed", "pending", "overdue"],
  categories: [],
  sortBy: "date",
  sortDirection: "desc",
};

export default function Invoices() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  const [filterState, setFilterState] = useState<FilterState>(defaultFilter);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Form handling
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
    setTimeout(() => {
      console.log(data);
      setOpen(false);
      setIsSubmitting(false);
      form.reset();
    }, 1000);
  };

  // Data fetching
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const isLoading = isLoadingOrders || isLoadingContacts;

  // Filter functions
  const isWithinDateRange = (date: Date) => {
    switch (filterState.dateRange) {
      case "today":
        return format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      case "week":
        return isWithinInterval(date, {
          start: subDays(new Date(), 7),
          end: new Date(),
        });
      case "month":
        return isWithinInterval(date, {
          start: subMonths(new Date(), 1),
          end: new Date(),
        });
      case "quarter":
        return isWithinInterval(date, {
          start: subQuarters(new Date(), 1),
          end: new Date(),
        });
      case "year":
        return isWithinInterval(date, {
          start: subYears(new Date(), 1),
          end: new Date(),
        });
      case "custom":
        if (filterState.customDateStart && filterState.customDateEnd) {
          return isWithinInterval(date, {
            start: parseISO(filterState.customDateStart),
            end: parseISO(filterState.customDateEnd),
          });
        }
        return true;
      default:
        return true;
    }
  };

  const matchesSearch = (invoice: any, contacts: Contact[]) => {
    if (!filterState.search) return true;
    const searchTerms = filterState.search.toLowerCase().split(" ");
    const customer = contacts.find(c => c.id === invoice.contactId);

    return searchTerms.every(term => {
      const searchString = [
        invoice.invoiceNumber,
        customer?.name,
        customer?.email,
        customer?.phone,
        invoice.status,
        invoice.total,
      ].join(" ").toLowerCase();

      return searchString.includes(term);
    });
  };

  const matchesAmount = (amount: number) => {
    return amount >= filterState.amount.min && amount <= filterState.amount.max;
  };

  // Filter application
  const invoices = orders.filter(order => order.invoiceNumber);
  const filteredInvoices = invoices.filter(invoice => {
    if (!matchesSearch(invoice, contacts)) return false;
    if (!isWithinDateRange(new Date(invoice.orderDate))) return false;
    if (!matchesAmount(parseFloat(invoice.total))) return false;

    const dueDate = new Date(invoice.orderDate);
    dueDate.setDate(dueDate.getDate() + 15);
    const isOverdue = invoice.status === "pending" && dueDate < new Date();
    const currentStatus = isOverdue ? "overdue" : invoice.status;

    return filterState.statuses.includes(currentStatus as any);
  });

  // Stats calculations
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

  // Update the savedFilters array type definition
  const savedFilters: { id: string; name: string; filter: FilterState }[] = [
    { id: "recent", name: "Recent Invoices", filter: { ...defaultFilter, dateRange: "week" } },
    { id: "overdue", name: "Overdue Only", filter: { ...defaultFilter, statuses: ["overdue"] } },
    { id: "high-value", name: "High Value", filter: { ...defaultFilter, amount: { min: 1000000, max: 10000000 } } },
  ];


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
                <Card key={index}>
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
              ))}
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Keresés számlaszám, ügyfél név, email vagy telefonszám alapján..."
                  value={filterState.search}
                  onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <Popover open={showFilterMenu} onOpenChange={setShowFilterMenu}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Szűrők
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Mentett szűrők</h4>
                      <Select
                        value={filterState.saveFilter}
                        onValueChange={(value) => {
                          const saved = savedFilters.find(f => f.id === value);
                          if (saved) {
                            setFilterState(saved.filter);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Válassz mentett szűrőt" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedFilters.map(filter => (
                            <SelectItem key={filter.id} value={filter.id}>
                              {filter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Időszak</h4>
                      <Select
                        value={filterState.dateRange}
                        onValueChange={(v) => setFilterState(prev => ({ ...prev, dateRange: v as DateRange }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Válassz időszakot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Összes</SelectItem>
                          <SelectItem value="today">Mai</SelectItem>
                          <SelectItem value="week">Elmúlt 7 nap</SelectItem>
                          <SelectItem value="month">Elmúlt 30 nap</SelectItem>
                          <SelectItem value="quarter">Elmúlt 3 hónap</SelectItem>
                          <SelectItem value="year">Elmúlt 1 év</SelectItem>
                          <SelectItem value="custom">Egyéni időszak</SelectItem>
                        </SelectContent>
                      </Select>

                      {filterState.dateRange === "custom" && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="text-sm text-muted-foreground">Kezdő dátum</label>
                            <Input
                              type="date"
                              value={filterState.customDateStart}
                              onChange={(e) => setFilterState(prev => ({
                                ...prev,
                                customDateStart: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Záró dátum</label>
                            <Input
                              type="date"
                              value={filterState.customDateEnd}
                              onChange={(e) => setFilterState(prev => ({
                                ...prev,
                                customDateEnd: e.target.value
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Rendezés</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={filterState.sortBy}
                          onValueChange={(value) => setFilterState(prev => ({ ...prev, sortBy: value as SortField }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Rendezés alapja" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Dátum</SelectItem>
                            <SelectItem value="amount">Összeg</SelectItem>
                            <SelectItem value="dueDate">Fizetési határidő</SelectItem>
                            <SelectItem value="status">Státusz</SelectItem>
                            <SelectItem value="customer">Ügyfél</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={filterState.sortDirection}
                          onValueChange={(value) => setFilterState(prev => ({ ...prev, sortDirection: value as SortDirection }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Irány" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Növekvő</SelectItem>
                            <SelectItem value="desc">Csökkenő</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Összeg tartomány</h4>
                      <div className="px-2">
                        <Slider
                          defaultValue={[filterState.amount.min, filterState.amount.max]}
                          max={10000000}
                          step={10000}
                          onValueChange={([min, max]) => setFilterState(prev => ({
                            ...prev,
                            amount: { min, max }
                          }))}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{filterState.amount.min.toLocaleString()} Ft</span>
                        <span>{filterState.amount.max.toLocaleString()} Ft</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Státusz</h4>
                      <div className="space-y-2">
                        {["completed", "pending", "overdue"].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={status}
                              checked={filterState.statuses.includes(status as any)}
                              onCheckedChange={(checked) => {
                                setFilterState(prev => ({
                                  ...prev,
                                  statuses: checked
                                    ? [...prev.statuses, status as any]
                                    : prev.statuses.filter(s => s !== status)
                                }));
                              }}
                            />
                            <label
                              htmlFor={status}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {status === "completed" ? "Kifizetett" : status === "pending" ? "Függőben" : "Késedelmes"}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setFilterState(defaultFilter)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Alaphelyzet
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setShowFilterMenu(false)}
                      >
                        <Save className="h-4 w-4" />
                        Mentés
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
          </TabsContent>
        </Tabs>
      </AnimatedItem>
    </PageLayout>
  );
}