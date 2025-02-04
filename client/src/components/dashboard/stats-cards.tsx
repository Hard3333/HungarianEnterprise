import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Product, Contact, Order } from "@shared/schema";

export function StatsCards() {
  const { data: products = [] } = useQuery<Product[]>({ 
    queryKey: ["/api/products"]
  });
  
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"]
  });
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"]
  });

  const lowStock = products.filter(p => p.stockLevel <= p.minStockLevel).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Termékek</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendelések</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kapcsolatok</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{contacts.length}</div>
        </CardContent>
      </Card>

      <Card className={lowStock > 0 ? "bg-destructive/10" : undefined}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alacsony készlet</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStock}</div>
        </CardContent>
      </Card>
    </div>
  );
}
