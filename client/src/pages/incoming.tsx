import { useState } from "react";
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
import { Truck, Package, Calendar, Clock, Filter, Save, Trash2 } from "lucide-react";
import { Contact, Delivery, DeliveryItem, Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isWithinInterval, parseISO, subDays, subMonths, subYears } from "date-fns";

// Filter types
type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year" | "custom";
type StatusFilter = ("pending" | "in_transit" | "received" | "cancelled")[];
type SortDirection = "asc" | "desc";
type SortField = "supplier" | "expectedDate" | "status" | "items";

interface FilterState {
  search: string;
  dateRange: DateRange;
  customDateStart?: string;
  customDateEnd?: string;
  statuses: StatusFilter;
  sortBy: SortField;
  sortDirection: SortDirection;
  saveFilter?: string;
}

const defaultFilter: FilterState = {
  search: "",
  dateRange: "all",
  statuses: ["pending", "in_transit", "received", "cancelled"],
  sortBy: "expectedDate",
  sortDirection: "desc",
};

// Saved filters
const savedFilters: { id: string; name: string; filter: FilterState }[] = [
  {
    id: "pending",
    name: "Függőben lévő",
    filter: { ...defaultFilter, statuses: ["pending"] },
  },
  {
    id: "in-transit",
    name: "Úton lévő",
    filter: { ...defaultFilter, statuses: ["in_transit"] },
  },
  {
    id: "recent",
    name: "Közelmúlt",
    filter: { ...defaultFilter, dateRange: "month" },
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "in_transit":
      return "bg-blue-500";
    case "received":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "Függőben";
    case "in_transit":
      return "Úton";
    case "received":
      return "Megérkezett";
    case "cancelled":
      return "Törölve";
    default:
      return status;
  }
}

export default function IncomingDeliveries() {
  const [filterState, setFilterState] = useState<FilterState>(defaultFilter);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  // Filter functions
  const matchesSearch = (delivery: Delivery) => {
    if (!filterState.search) return true;
    const searchTerms = filterState.search.toLowerCase().split(" ");
    const supplier = contacts.find((c) => c.id === delivery.supplierId);

    return searchTerms.every((term) => {
      const searchString = [
        supplier?.name,
        supplier?.email,
        delivery.notes,
        delivery.status,
      ].join(" ").toLowerCase();

      return searchString.includes(term);
    });
  };

  const isWithinDateRange = (date: Date) => {
    switch (filterState.dateRange) {
      case "today":
        return format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      case "week":
        return isWithinInterval(date, {
          start: subDays(new Date(), 7),
          end: new Date(),
        });
      case "month":
        return isWithinInterval(date, {
          start: subMonths(new Date(), 1),
          end: new Date(),
        });
      case "quarter":
        return isWithinInterval(date, {
          start: subMonths(new Date(), 3),
          end: new Date(),
        });
      case "year":
        return isWithinInterval(date, {
          start: subYears(new Date(), 1),
          end: new Date(),
        });
      case "custom":
        if (filterState.customDateStart && filterState.customDateEnd) {
          return isWithinInterval(date, {
            start: parseISO(filterState.customDateStart),
            end: parseISO(filterState.customDateEnd),
          });
        }
        return true;
      default:
        return true;
    }
  };

  // Filter application
  const filteredDeliveries = deliveries
    .filter((delivery) =>
      matchesSearch(delivery) &&
      isWithinDateRange(new Date(delivery.expectedDate)) &&
      filterState.statuses.includes(delivery.status as any)
    )
    .sort((a, b) => {
      const direction = filterState.sortDirection === "asc" ? 1 : -1;

      switch (filterState.sortBy) {
        case "supplier":
          const supplierA = contacts.find((c) => c.id === a.supplierId)?.name || "";
          const supplierB = contacts.find((c) => c.id === b.supplierId)?.name || "";
          return direction * supplierA.localeCompare(supplierB);
        case "expectedDate":
          return direction * (new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());
        case "status":
          return direction * a.status.localeCompare(b.status);
        case "items":
          const itemsA = (a.items as DeliveryItem[])?.length || 0;
          const itemsB = (b.items as DeliveryItem[])?.length || 0;
          return direction * (itemsA - itemsB);
        default:
          return 0;
      }
    });

  const totalValue = filteredDeliveries.reduce((sum, delivery) => {
    return (
      sum +
      (delivery.items as DeliveryItem[])?.reduce((itemSum, item) => itemSum + parseFloat(item.price) * item.quantity, 0) || 0
    );
  }, 0);

  const totalItems = filteredDeliveries.reduce((sum, delivery) => {
    return (
      sum +
      (delivery.items as DeliveryItem[])?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0
    );
  }, 0);

  const pendingDeliveries = filteredDeliveries.filter((d) => d.status === "pending" || d.status === "in_transit").length;

  return (
    <PageLayout title={t("incomingDeliveries")} description="Beérkező szállítmányok kezelése">
      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[
            {
              title: "Várt szállítmányok",
              icon: Truck,
              value: isLoading ? <Skeleton className="h-8 w-20" /> : `${pendingDeliveries} db`,
              subtitle: "folyamatban lévő szállítás",
            },
            {
              title: "Összes beérkező termék",
              icon: Package,
              value: isLoading ? <Skeleton className="h-8 w-20" /> : `${totalItems} db`,
              subtitle: "várható mennyiség",
            },
            {
              title: "Várható összérték",
              icon: Clock,
              value: isLoading ? <Skeleton className="h-8 w-20" /> : `${totalValue.toLocaleString()} Ft`,
              subtitle: "beérkező termékek értéke",
            },
          ].map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedItem>

      <AnimatedItem>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Keresés beszállító vagy megjegyzés alapján..."
            value={filterState.search}
            onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
            className="w-96"
          />

          <Popover open={showFilterMenu} onOpenChange={setShowFilterMenu}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Szűrők
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Mentett szűrők</h4>
                  <Select
                    value={filterState.saveFilter}
                    onValueChange={(value) => {
                      const saved = savedFilters.find((f) => f.id === value);
                      if (saved) {
                        setFilterState(saved.filter);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz mentett szűrőt" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedFilters.map((filter) => (
                        <SelectItem key={filter.id} value={filter.id}>
                          {filter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Időszak</h4>
                  <Select
                    value={filterState.dateRange}
                    onValueChange={(v) =>
                      setFilterState((prev) => ({ ...prev, dateRange: v as DateRange }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz időszakot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes</SelectItem>
                      <SelectItem value="today">Mai</SelectItem>
                      <SelectItem value="week">Elmúlt 7 nap</SelectItem>
                      <SelectItem value="month">Elmúlt 30 nap</SelectItem>
                      <SelectItem value="quarter">Elmúlt 3 hónap</SelectItem>
                      <SelectItem value="year">Elmúlt 1 év</SelectItem>
                      <SelectItem value="custom">Egyéni időszak</SelectItem>
                    </SelectContent>
                  </Select>

                  {filterState.dateRange === "custom" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-sm text-muted-foreground">Kezdő dátum</label>
                        <Input
                          type="date"
                          value={filterState.customDateStart}
                          onChange={(e) =>
                            setFilterState((prev) => ({ ...prev, customDateStart: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Záró dátum</label>
                        <Input
                          type="date"
                          value={filterState.customDateEnd}
                          onChange={(e) =>
                            setFilterState((prev) => ({ ...prev, customDateEnd: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Rendezés</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={filterState.sortBy}
                      onValueChange={(value) =>
                        setFilterState((prev) => ({ ...prev, sortBy: value as SortField }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rendezés alapja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier">Beszállító</SelectItem>
                        <SelectItem value="expectedDate">Várható érkezés</SelectItem>
                        <SelectItem value="status">Státusz</SelectItem>
                        <SelectItem value="items">Termékek száma</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterState.sortDirection}
                      onValueChange={(value) =>
                        setFilterState((prev) => ({ ...prev, sortDirection: value as SortDirection }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Irány" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Növekvő</SelectItem>
                        <SelectItem value="desc">Csökkenő</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Státusz</h4>
                  <div className="space-y-2">
                    {[
                      { value: "pending", label: "Függőben" },
                      { value: "in_transit", label: "Úton" },
                      { value: "received", label: "Megérkezett" },
                      { value: "cancelled", label: "Törölve" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={value}
                          checked={filterState.statuses.includes(value as any)}
                          onCheckedChange={(checked) => {
                            setFilterState((prev) => ({
                              ...prev,
                              statuses: checked
                                ? [...prev.statuses, value as any]
                                : prev.statuses.filter((s) => s !== value),
                            }));
                          }}
                        />
                        <label
                          htmlFor={value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setFilterState(defaultFilter)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Alaphelyzet
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => setShowFilterMenu(false)}>
                    <Save className="h-4 w-4" />
                    Mentés
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
            ) : filteredDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                  Nincsenek beérkező szállítmányok
                </TableCell>
              </TableRow>
            ) : (
              filteredDeliveries.map((delivery) => {
                const supplier = contacts.find((c) => c.id === delivery.supplierId);
                const items = delivery.items as DeliveryItem[];

                return (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger className="font-medium">{supplier?.name}</HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{supplier?.name}</h4>
                            <p className="text-sm text-muted-foreground">Tel: {supplier?.phone}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      {new Date(delivery.expectedDate).toLocaleDateString("hu", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(delivery.status)}>
                        {getStatusText(delivery.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger>{items?.length || 0} termék</HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-1">
                            {items?.map((item, index) => {
                              const product = products.find((p) => p.id === item.productId);
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