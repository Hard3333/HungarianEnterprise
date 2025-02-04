import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { t } from "@/lib/i18n";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
import { FileText, TrendingUp, CreditCard, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
  });

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

  // Prepare chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const chartData = last30Days.map(date => {
    const dayInvoices = invoices.filter(invoice => 
      invoice.orderDate.split('T')[0] === date
    );
    return {
      date: new Date(date).toLocaleDateString('hu', { month: 'short', day: 'numeric' }),
      total: dayInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.total), 0),
    };
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t("invoices")}</h1>
            <p className="text-muted-foreground">
              Számlák kezelése és áttekintése
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Összes bevétel
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalRevenue.toLocaleString()} Ft
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter(i => i.status === "completed").length} teljesített számla
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Függőben lévő
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingRevenue.toLocaleString()} Ft
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter(i => i.status === "pending").length} kifizetetlen számla
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Késedelmes
                </CardTitle>
                <Calendar className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {overdueCount} db
                </div>
                <p className="text-xs text-muted-foreground">
                  15 napnál régebbi számla
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Átlagos fizetési idő
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  8.5 nap
                </div>
                <p className="text-xs text-muted-foreground">
                  az elmúlt 30 napban
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Bevételek alakulása</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))" 
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} Ft`}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#total)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
                        {isOverdue ? "Késedelmes" : t(invoice.status as any)}
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
        </main>
      </div>
    </div>
  );
}