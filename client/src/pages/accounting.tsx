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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Plus, CreditCard, TrendingUp, PiggyBank, CircleDollarSign } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Kötelező mező"),
  amount: z.string().min(1, "Kötelező mező"),
  date: z.string(),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function Accounting() {
  const [open, setOpen] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      category: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    console.log(data);
    setOpen(false);
    form.reset();
  };

  // Test data
  const transactions = [
    {
      id: 1,
      type: "income",
      category: "Értékesítés",
      amount: 1250000,
      date: "2024-02-01",
      description: "Nagyvállalati licensz értékesítés",
    },
    {
      id: 2,
      type: "expense",
      category: "Marketing",
      amount: 450000,
      date: "2024-02-02",
      description: "Google Ads kampány",
    },
    {
      id: 3,
      type: "income",
      category: "Szolgáltatás",
      amount: 780000,
      date: "2024-02-03",
      description: "Rendszerintegráció",
    },
    {
      id: 4,
      type: "expense",
      category: "Bérleti díj",
      amount: 650000,
      date: "2024-02-04",
      description: "Irodabérlés Q1",
    },
  ];

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const profitMargin = (balance / totalIncome) * 100;

  return (
    <PageLayout
      title={t("accounting")}
      description="Könyvelési műveletek és áttekintés"
    >
      <AnimatedItem className="flex justify-between items-center mb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új tranzakció
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új tranzakció rögzítése</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Típus</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Válassz típust" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Bevétel</SelectItem>
                          <SelectItem value="expense">Kiadás</SelectItem>
                        </SelectContent>
                      </Select>
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dátum</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leírás</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
      </AnimatedItem>

      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[
            {
              title: "Összes bevétel",
              icon: TrendingUp,
              value: `${totalIncome.toLocaleString()} Ft`,
              description: "az elmúlt 30 napban"
            },
            {
              title: "Összes kiadás",
              icon: CreditCard,
              value: `${totalExpense.toLocaleString()} Ft`,
              description: "az elmúlt 30 napban"
            },
            {
              title: "Egyenleg",
              icon: PiggyBank,
              value: `${balance.toLocaleString()} Ft`,
              description: "aktuális egyenleg"
            },
            {
              title: "Profit ráta",
              icon: CircleDollarSign,
              value: `${profitMargin.toFixed(1)}%`,
              description: "bevétel arányos nyereség"
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
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedItem>

      <AnimatedItem>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dátum</TableHead>
              <TableHead>Típus</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead>Leírás</TableHead>
              <TableHead className="text-right">Összeg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  <span className={
                    transaction.type === "income" 
                      ? "text-green-500" 
                      : "text-red-500"
                  }>
                    {transaction.type === "income" ? "Bevétel" : "Kiadás"}
                  </span>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-right">
                  {transaction.amount.toLocaleString()} Ft
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnimatedItem>
    </PageLayout>
  );
}