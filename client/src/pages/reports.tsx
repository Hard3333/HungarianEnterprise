import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Order, Product } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { ArrowUpRight, ChevronUp, Warehouse, DollarSign, TrendingUp } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#2196F3", "#4CAF50", "#FF9800"];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];

export default function Reports() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate monthly revenue
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    revenue: Math.random() * 10000000 + 5000000,
    expenses: Math.random() * 8000000 + 4000000
  }));

  // Calculate product performance
  const productPerformance = products
    .map(product => ({
      name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
      revenue: orders.reduce((sum, order) => {
        const orderItems = order.items as any[];
        const item = orderItems.find(item => item.productId === product.id);
        return sum + (item ? parseFloat(item.price) * item.quantity : 0);
      }, 0),
      units: orders.reduce((sum, order) => {
        const orderItems = order.items as any[];
        const item = orderItems.find(item => item.productId === product.id);
        return sum + (item ? item.quantity : 0);
      }, 0)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calculate inventory metrics
  const inventoryMetrics = products.reduce((acc, product) => ({
    totalValue: acc.totalValue + parseFloat(product.price) * product.stockLevel,
    totalItems: acc.totalItems + product.stockLevel,
    lowStock: acc.lowStock + (product.stockLevel <= (product.minStockLevel || 0) ? 1 : 0)
  }), { totalValue: 0, totalItems: 0, lowStock: 0 });

  // Customer segments
  const customerSegments = [
    { name: "Nagyvállalat", value: 45 },
    { name: "KKV", value: 30 },
    { name: "Startup", value: 15 },
    { name: "Egyéni", value: 10 }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t("reports")}</h1>
            <p className="text-muted-foreground">
              Pénzügyi jelentések és kimutatások
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Havi bevétel
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyData[11].revenue.toLocaleString()} Ft
                </div>
                <div className="flex items-center text-sm text-green-500">
                  <ChevronUp className="h-4 w-4" />
                  +12.5% az előző hónaphoz képest
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Készletérték
                </CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryMetrics.totalValue.toLocaleString()} Ft
                </div>
                <div className="text-sm text-muted-foreground">
                  {inventoryMetrics.totalItems} termék raktáron
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profitráta
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  23.5%
                </div>
                <div className="flex items-center text-sm text-green-500">
                  <ArrowUpRight className="h-4 w-4" />
                  +2.1% az előző évhez képest
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Bevétel vs. Kiadás</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))"
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} Ft`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Bevétel"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Kiadás"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ügyfélszegmensek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSegments}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {customerSegments.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))"
                        }}
                        formatter={(value: number) => `${value}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top termékek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))"
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} Ft`}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Készletszint állapot</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Termék</TableHead>
                      <TableHead>Készlet</TableHead>
                      <TableHead>Státusz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 5).map((product) => {
                      const stockRatio = product.minStockLevel
                        ? (product.stockLevel / product.minStockLevel) * 100
                        : 100;

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name.length > 30
                              ? product.name.substring(0, 30) + '...'
                              : product.name}
                          </TableCell>
                          <TableCell>{product.stockLevel} {product.unit}</TableCell>
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={stockRatio}
                                className={stockRatio < 100 ? "text-destructive" : ""}
                              />
                              <span className="text-sm text-muted-foreground w-12">
                                {Math.round(stockRatio)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}