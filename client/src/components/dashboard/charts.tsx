import { useQuery } from "@tanstack/react-query";
import { Order, Product } from "@shared/schema";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  BarChart, 
  Bar,
  CartesianGrid,
  Legend
} from "recharts";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const processOrderData = (orders: Order[]) => {
  // Sort orders by date first
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
  );

  // Process last 14 days of data
  const last14Days = sortedOrders.reduce((acc, order) => {
    const date = new Date(order.orderDate).toLocaleDateString("hu", { 
      month: 'short', 
      day: 'numeric' 
    });
    const total = parseFloat(order.total);

    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += total;
      existing.orders += 1;
    } else {
      acc.push({ date, total, orders: 1 });
    }
    return acc;
  }, [] as { date: string; total: number; orders: number }[]).slice(-14);

  // Calculate moving average
  const movingAverage = last14Days.map((day, index) => {
    const start = Math.max(0, index - 2);
    const end = index + 1;
    const slice = last14Days.slice(start, end);
    const avg = slice.reduce((sum, item) => sum + item.total, 0) / slice.length;
    return { ...day, average: Math.round(avg) };
  });

  return movingAverage;
};

const processStockData = (products: Product[]) => {
  return products
    .map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      készlet: product.stockLevel,
      minimum: product.minStockLevel || 0,
      raktáron: Math.max(0, product.stockLevel - (product.minStockLevel || 0))
    }))
    .sort((a, b) => b.készlet - a.készlet)
    .slice(0, 8);
};

export function Charts() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"]
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const orderData = processOrderData(orders);
  const stockData = processStockData(products);

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("salesChart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="hsl(var(--destructive))"
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stockLevels")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))" 
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="raktáron" 
                  fill="hsl(var(--primary))" 
                  stackId="stock"
                />
                <Bar 
                  dataKey="minimum" 
                  fill="hsl(var(--destructive))" 
                  stackId="stock"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}