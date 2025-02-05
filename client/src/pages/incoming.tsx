import { useQuery } from "@tanstack/react-query";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Calendar, Clock } from "lucide-react";
import { Contact, Delivery, DeliveryItem, Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'in_transit':
      return 'bg-blue-500';
    case 'received':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'Függőben';
    case 'in_transit':
      return 'Úton';
    case 'received':
      return 'Megérkezett';
    case 'cancelled':
      return 'Törölve';
    default:
      return status;
  }
}

export default function IncomingDeliveries() {
  const { data: deliveries = [], isLoading: isLoadingDeliveries } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const isLoading = isLoadingDeliveries || isLoadingContacts || isLoadingProducts;

  const totalValue = deliveries.reduce((sum, delivery) => {
    return sum + (delivery.items as DeliveryItem[])?.reduce((itemSum, item) => 
      itemSum + parseFloat(item.price) * item.quantity, 0
    ) || 0;
  }, 0);

  const totalItems = deliveries.reduce((sum, delivery) => {
    return sum + (delivery.items as DeliveryItem[])?.reduce((itemSum, item) => 
      itemSum + item.quantity, 0
    ) || 0;
  }, 0);

  const pendingDeliveries = deliveries.filter(d => 
    d.status === 'pending' || d.status === 'in_transit'
  ).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("incomingDeliveries")}
            </h1>
            <p className="text-muted-foreground">
              Beérkező szállítmányok kezelése
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Várt szállítmányok
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {pendingDeliveries} db
                    </div>
                    <p className="text-xs text-muted-foreground">
                      folyamatban lévő szállítás
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Összes beérkező termék
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {totalItems} db
                    </div>
                    <p className="text-xs text-muted-foreground">
                      várható mennyiség
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Várható összérték
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {totalValue.toLocaleString()} Ft
                    </div>
                    <p className="text-xs text-muted-foreground">
                      beérkező termékek értéke
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beszállító</TableHead>
                <TableHead>Várható érkezés</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead>Termékek</TableHead>
                <TableHead>Megjegyzés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex justify-center py-4">
                      <div className="space-y-2 w-full max-w-lg">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    Nincsenek beérkező szállítmányok
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => {
                  const supplier = contacts.find(c => c.id === delivery.supplierId);
                  const items = delivery.items as DeliveryItem[];

                  return (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger className="font-medium">
                            {supplier?.name}
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">
                                {supplier?.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Tel: {supplier?.phone}
                              </p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        {new Date(delivery.expectedDate).toLocaleDateString("hu", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(delivery.status)}
                        >
                          {getStatusText(delivery.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger>
                            {items?.length || 0} termék
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-1">
                              {items?.map(item => {
                                const product = products.find(
                                  p => p.id === item.productId
                                );
                                return (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span>{product?.name}</span>
                                    <span>{item.quantity} db</span>
                                  </div>
                                );
                              })}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>{delivery.notes}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
}