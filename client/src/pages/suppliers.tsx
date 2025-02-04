import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { t } from "@/lib/i18n";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Building2, Plus, TruckIcon, PackageIcon, WalletIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const supplierSchema = z.object({
  name: z.string().min(1, "Kötelező mező"),
  email: z.string().email("Érvénytelen email cím"),
  phone: z.string().min(1, "Kötelező mező"),
  address: z.string().min(1, "Kötelező mező"),
  taxNumber: z.string().min(1, "Kötelező mező"),
  category: z.string().min(1, "Kötelező mező"),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function Suppliers() {
  const [open, setOpen] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxNumber: "",
      category: "",
      notes: "",
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    console.log(data);
    setOpen(false);
    form.reset();
  };

  // Test data
  const suppliers = [
    {
      id: 1,
      name: "TechComponents Kft.",
      email: "info@techcomponents.hu",
      phone: "+36 1 234 5678",
      address: "1052 Budapest, Váci utca 10.",
      taxNumber: "12345678-2-41",
      category: "Hardware",
      activeOrders: 3,
      totalSpent: 12500000,
      notes: "Megbízható alkatrész beszállító",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Office Solutions Bt.",
      email: "sales@officesolutions.hu",
      phone: "+36 1 987 6543",
      address: "1134 Budapest, Lehel út 15.",
      taxNumber: "87654321-1-41",
      category: "Office Supplies",
      activeOrders: 1,
      totalSpent: 4800000,
      notes: "Irodai kellékek és bútorok",
      rating: 4.5,
    },
    {
      id: 3,
      name: "Global IT Services",
      email: "contact@globalit.hu",
      phone: "+36 1 555 1234",
      address: "1061 Budapest, Andrássy út 20.",
      taxNumber: "98765432-2-41",
      category: "Software",
      activeOrders: 2,
      totalSpent: 8900000,
      notes: "Szoftver licenszek és szolgáltatások",
      rating: 4.9,
    },
  ];

  const totalActive = suppliers.reduce((sum, s) => sum + s.activeOrders, 0);
  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("suppliers")}</h1>
              <p className="text-muted-foreground">
                Beszállítók kezelése
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Új beszállító
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Új beszállító hozzáadása</DialogTitle>
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

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktív beszállítók
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {suppliers.length} cég
                </div>
                <p className="text-xs text-muted-foreground">
                  aktuális partnerek
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Folyamatban lévő rendelések
                </CardTitle>
                <TruckIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalActive} db
                </div>
                <p className="text-xs text-muted-foreground">
                  aktív megrendelés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Összes kiadás
                </CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalSpent.toLocaleString()} Ft
                </div>
                <p className="text-xs text-muted-foreground">
                  az elmúlt 12 hónapban
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Átlagos értékelés
                </CardTitle>
                <PackageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgRating.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  beszállítói minősítés
                </p>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Kategória</TableHead>
                <TableHead>Kapcsolat</TableHead>
                <TableHead>Adószám</TableHead>
                <TableHead>Aktív rendelések</TableHead>
                <TableHead>Értékelés</TableHead>
                <TableHead>Megjegyzések</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {supplier.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {supplier.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{supplier.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {supplier.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{supplier.taxNumber}</TableCell>
                  <TableCell>{supplier.activeOrders} db</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className="bg-green-500"
                    >
                      {supplier.rating.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{supplier.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
}