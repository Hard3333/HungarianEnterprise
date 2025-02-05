import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Users, Building2, Wallet, TrendingUp, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";

const customerSchema = z.object({
  name: z.string().min(1, "Kötelező mező"),
  email: z.string().email("Érvénytelen email cím"),
  phone: z.string().min(1, "Kötelező mező"),
  address: z.string().min(1, "Kötelező mező"),
  taxNumber: z.string().min(1, "Kötelező mező"),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  setTimeout(() => setIsLoading(false), 1000);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxNumber: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: API call to save customer
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log(data);
      setOpen(false);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test data
  const customers = [
    {
      id: 1,
      name: "Tech Solutions Kft.",
      email: "info@techsolutions.hu",
      phone: "+36 1 234 5678",
      address: "1052 Budapest, Váci utca 15.",
      taxNumber: "12345678-2-41",
      totalOrders: 12,
      totalSpent: 4500000,
      lastOrder: "2024-01-15",
      notes: "Kiemelt partner, IT szolgáltatások",
    },
    {
      id: 2,
      name: "Green Energy Zrt.",
      email: "contact@greenenergy.hu",
      phone: "+36 1 987 6543",
      address: "1134 Budapest, Lehel út 25.",
      taxNumber: "87654321-2-41",
      totalOrders: 8,
      totalSpent: 2800000,
      lastOrder: "2024-01-20",
      notes: "Megújuló energia szektor",
    },
    {
      id: 3,
      name: "Smart Manufacturing Kft.",
      email: "info@smartmanufacturing.hu",
      phone: "+36 1 555 1234",
      address: "1095 Budapest, Soroksári út 30-34.",
      taxNumber: "98765432-2-41",
      totalOrders: 15,
      totalSpent: 6700000,
      lastOrder: "2024-01-25",
      notes: "Ipari automatizálás",
    },
  ];

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <PageLayout
      title={t("customers")}
      description="Ügyfelek kezelése"
    >
      <AnimatedItem className="flex justify-between items-center mb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új ügyfél
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Új ügyfél hozzáadása</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Név</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefonszám</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adószám</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cím</FormLabel>
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
      </AnimatedItem>

      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[150px]" />
                  <Skeleton className="h-4 w-[100px] mt-1" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aktív ügyfelek
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {customers.length} cég
                  </div>
                  <p className="text-xs text-muted-foreground">
                    aktív partner
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Összes megrendelés
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {customers.reduce((sum, c) => sum + c.totalOrders, 0)} db
                  </div>
                  <p className="text-xs text-muted-foreground">
                    összes leadott rendelés
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Összes bevétel
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalRevenue.toLocaleString()} Ft
                  </div>
                  <p className="text-xs text-muted-foreground">
                    teljes forgalom
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Átlagos rendelés érték
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgOrderValue.toLocaleString()} Ft
                  </div>
                  <p className="text-xs text-muted-foreground">
                    átlagos kosárérték
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AnimatedItem>

      <AnimatedItem>
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
                <TableHead>Név</TableHead>
                <TableHead>Elérhetőség</TableHead>
                <TableHead>Adószám</TableHead>
                <TableHead>Megrendelések</TableHead>
                <TableHead>Utolsó rendelés</TableHead>
                <TableHead>Megjegyzések</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div>{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.address}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.taxNumber}</TableCell>
                  <TableCell>
                    {customer.totalOrders} db
                    <div className="text-sm text-muted-foreground">
                      {customer.totalSpent.toLocaleString()} Ft
                    </div>
                  </TableCell>
                  <TableCell>{customer.lastOrder}</TableCell>
                  <TableCell>{customer.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AnimatedItem>
    </PageLayout>
  );
}