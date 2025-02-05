import { useQuery } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
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
    <PageLayout
      title={t("incomingDeliveries")}
      description="Beérkező szállítmányok kezelése"
    >
      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[
            {
              title: "Várt szállítmányok",
              icon: Truck,
              value: isLoading ? <Skeleton className="h-8 w-20" /> : `${pendingDeliveries} db`,
              subtitle: "folyamatban lévő szállítás"
            },
            {
              title: "Összes beérkező termék",
              icon: Package,
              value: isLoading ? <Skeleton className="h-8 w-20" /> : `${totalItems} db`,
              subtitle: "várható mennyiség"
            },
            {
              title: "Várható összérték",
              icon: Clock,
              value: isLoading ? <Skeleton className="h-8 w-20" /> : `${totalValue.toLocaleString()} Ft`,
              subtitle: "beérkező termékek értéke"
            }
          ].map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
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
                            {items?.map((item, index) => {
                              const product = products.find(
                                p => p.id === item.productId
                              );
                              return (
                                <div key={index} className="flex justify-between text-sm">
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
      </AnimatedItem>
    </PageLayout>
  );
}