import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Order, Product, VatRate, VatTransaction } from "@shared/schema";
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
  Legend,
} from "recharts";
import { ArrowUpRight, ChevronUp, Warehouse, Receipt, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#2196F3", "#4CAF50", "#FF9800"];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];

interface OrderItem {
  productId: number;
  quantity: number;
  price: string;
}

interface ProductPerformance {
  name: string;
  revenue: number;
  units: number;
}

interface MonthlyVatData {
  month: string;
  collectedVAT: number;
  transactions: number;
}

interface VatDistribution {
  name: string;
  value: number;
}

export default function Reports() {
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: vatRates = [], isLoading: isLoadingVatRates } = useQuery<VatRate[]>({
    queryKey: ["/api/vat-rates"],
  });

  const { data: vatTransactions = [], isLoading: isLoadingVatTransactions } = useQuery<VatTransaction[]>({
    queryKey: ["/api/vat-transactions"],
  });

  // Calculate monthly VAT data
  const monthlyVatData: MonthlyVatData[] = Array.from({ length: 12 }, (_, i) => {
    const month = monthNames[i];
    const monthTransactions = vatTransactions.filter(tx => {
      const txDate = new Date(tx.transactionDate);
      return txDate.getMonth() === i;
    });

    return {
      month,
      collectedVAT: monthTransactions.reduce((sum, tx) => sum + Number(tx.vatAmount), 0),
      transactions: monthTransactions.length,
    };
  });

  // Calculate VAT rate distribution
  const vatDistribution: VatDistribution[] = vatRates.map(rate => ({
    name: rate.name,
    value: vatTransactions
      .filter(tx => tx.vatRateId === rate.id)
      .reduce((sum, tx) => sum + Number(tx.vatAmount), 0),
  })).sort((a, b) => b.value - a.value);

  const totalVAT = vatTransactions.reduce((sum, tx) => sum + Number(tx.vatAmount), 0);
  const totalTransactions = vatTransactions.length;
  const averageVAT = totalTransactions > 0 ? totalVAT / totalTransactions : 0;

  // Calculate product performance
  const productPerformance: ProductPerformance[] = products
    .map(product => ({
      name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
      revenue: orders.reduce((sum, order) => {
        const orderItems = order.items as OrderItem[];
        const item = orderItems.find(item => item.productId === product.id);
        return sum + (item ? Number(item.price) * item.quantity : 0);
      }, 0),
      units: orders.reduce((sum, order) => {
        const orderItems = order.items as OrderItem[];
        const item = orderItems.find(item => item.productId === product.id);
        return sum + (item ? item.quantity : 0);
      }, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingVatRates || isLoadingVatTransactions;

  return (
    <PageLayout
      title={t("reports")}
      description={t("reportsDescription")}
    >
      {/* Summary Cards */}
      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
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
                    {t("totalVat")}
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalVAT.toLocaleString()} Ft
                  </div>
                  <div className="flex items-center text-sm text-green-500">
                    <ChevronUp className="h-4 w-4" />
                    {((totalVAT / (totalVAT - monthlyVatData[11].collectedVAT) - 1) * 100).toFixed(1)}% {t("comparedToPrevMonth")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("numberOfTransactions")}
                  </CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalTransactions} {t("pieces")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {averageVAT.toLocaleString()} Ft {t("averageVatPerTransaction")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("mostCommonVatRate")}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vatDistribution[0]?.name || "N/A"}
                  </div>
                  <div className="flex items-center text-sm text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                    {vatDistribution[0]?.value ? Math.round((vatDistribution[0].value / totalVAT) * 100) : 0}% {t("share")}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AnimatedItem>

      {/* Charts */}
      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("vatTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyVatData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} Ft`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="collectedVAT"
                        name={t("collectedVat")}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("vatDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vatDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) =>
                          `${name} (${Math.round((value / totalVAT) * 100)}%)`
                        }
                      >
                        {vatDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} Ft`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AnimatedItem>

      {/* Recent Transactions Table */}
      <AnimatedItem>
        <Card>
          <CardHeader>
            <CardTitle>{t("recentVatTransactions")}</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("netAmount")}</TableHead>
                    <TableHead>{t("vatRate")}</TableHead>
                    <TableHead>{t("vatAmount")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatTransactions
                    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
                    .slice(0, 5)
                    .map((tx) => {
                      const vatRate = vatRates.find(r => r.id === tx.vatRateId);

                      return (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {new Date(tx.transactionDate).toLocaleDateString("hu")}
                          </TableCell>
                          <TableCell>
                            {Number(tx.netAmount).toLocaleString()} Ft
                          </TableCell>
                          <TableCell>
                            {vatRate?.name} ({vatRate?.rate}%)
                          </TableCell>
                          <TableCell>
                            {Number(tx.vatAmount).toLocaleString()} Ft
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={tx.reported ? "bg-green-500" : "bg-yellow-500"}>
                              {tx.reported ? t("reported") : t("pending")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </AnimatedItem>

      {/* Product Performance and Stock Levels */}
      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("topProducts")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} Ft`}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("stockLevelStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableHead>{t("product")}</TableHead>
                      <TableHead>{t("stock")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
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
              )}
            </CardContent>
          </Card>
        </div>
      </AnimatedItem>
    </PageLayout>
  );
}