import { useQuery } from "@tanstack/react-query";
import { Order, Product } from "@shared/schema";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const processOrderData = (orders: Order[]) => {
  return orders.reduce((acc, order) => {
    const date = new Date(order.orderDate).toLocaleDateString("hu");
    const total = parseFloat(order.total);
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += total;
    } else {
      acc.push({ date, total });
    }
    return acc;
  }, [] as { date: string; total: number }[]);
};

const processStockData = (products: Product[]) => {
  return products
    .map(product => ({
      name: product.name,
      stock: product.stockLevel,
      min: product.minStockLevel || 0
    }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10);
};

export function Charts() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"]
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const orderData = processOrderData(orders.slice(-7)); // Last 7 days
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
              <LineChart data={orderData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
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
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="stock" fill="hsl(var(--primary))" />
                <Bar dataKey="min" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
