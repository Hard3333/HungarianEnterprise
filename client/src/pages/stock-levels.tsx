import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { t } from "@/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package2, AlertTriangle, ArrowUpRight, Filter, Save, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

// Filter types
type StockRange = "all" | "low" | "optimal" | "high" | "custom";
type StockFilter = { min: number; max: number };
type SortDirection = "asc" | "desc";
type SortField = "name" | "sku" | "stockLevel" | "value";

interface FilterState {
  search: string;
  stockRange: StockRange;
  stockLevels: StockFilter;
  categories: string[];
  sortBy: SortField;
  sortDirection: SortDirection;
  showLowStock: boolean;
  saveFilter?: string;
}

const defaultFilter: FilterState = {
  search: "",
  stockRange: "all",
  stockLevels: { min: 0, max: 1000 },
  categories: [],
  sortBy: "stock",
  sortDirection: "desc",
  showLowStock: false,
};

// Saved filters
const savedFilters: { id: string; name: string; filter: FilterState }[] = [
  {
    id: "low-stock",
    name: "Alacsony készlet",
    filter: { ...defaultFilter, stockRange: "low", showLowStock: true }
  },
  {
    id: "high-value",
    name: "Magas készletérték",
    filter: { ...defaultFilter, sortBy: "value", sortDirection: "desc" }
  },
  {
    id: "critical",
    name: "Kritikus termékek",
    filter: { ...defaultFilter, stockLevels: { min: 0, max: 50 }, showLowStock: true }
  }
];

export default function StockLevels() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "stock" | "value">("stock");
  const [filterState, setFilterState] = useState<FilterState>(defaultFilter);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter functions
  const matchesSearch = (product: Product) => {
    if (!filterState.search) return true;
    const searchTerms = filterState.search.toLowerCase().split(" ");

    return searchTerms.every(term => {
      const searchString = [
        product.name,
        product.sku
      ].join(" ").toLowerCase();

      return searchString.includes(term);
    });
  };

  const matchesStockRange = (product: Product) => {
    const ratio = product.minStockLevel 
      ? (product.stockLevel / product.minStockLevel)
      : 1;

    switch (filterState.stockRange) {
      case "low":
        return ratio < 1;
      case "optimal":
        return ratio >= 1 && ratio <= 1.5;
      case "high":
        return ratio > 1.5;
      case "custom":
        return product.stockLevel >= filterState.stockLevels.min && 
               product.stockLevel <= filterState.stockLevels.max;
      default:
        return true;
    }
  };

  const matchesCategory = (product: Product) => {
    if (filterState.categories.length === 0) return true;
    // Itt most department-et használunk kategóriaként, de később lecserélhető
    return filterState.categories.includes(product.department);
  };

  // Filter application
  const filteredProducts = products
    .filter(p => 
      matchesSearch(p) &&
      matchesStockRange(p) &&
      matchesCategory(p)
    )
    .sort((a, b) => {
      if (filterState.sortBy === "name") {
        return filterState.sortDirection === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (filterState.sortBy === "stock") {
        return filterState.sortDirection === "asc"
          ? a.stockLevel - b.stockLevel
          : b.stockLevel - a.stockLevel;
      }
      // value sort
      const aValue = parseFloat(a.price) * a.stockLevel;
      const bValue = parseFloat(b.price) * b.stockLevel;
      return filterState.sortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue;
    });

  const totalValue = filteredProducts.reduce((sum, p) => 
    sum + parseFloat(p.price) * p.stockLevel, 0
  );

  const avgStock = Math.round(
    filteredProducts.reduce((sum, p) => sum + p.stockLevel, 0) / filteredProducts.length
  );

  const lowStock = filteredProducts.filter(p => 
    p.stockLevel <= (p.minStockLevel || 0)
  ).length;

  return (
    <PageLayout
      title={t("stockLevels")}
      description="Részletes készletszint információk"
    >
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
                    Összes készletérték
                  </CardTitle>
                  <Package2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalValue.toLocaleString()} Ft
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filteredProducts.length} termék összértéke
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Átlagos készletszint
                  </CardTitle>
                  <ArrowUpRight className={`h-4 w-4 ${avgStock > 100 ? "text-green-500" : "text-red-500"}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgStock} db
                  </div>
                  <div className="text-xs text-muted-foreground">
                    átlagosan termékenként
                  </div>
                </CardContent>
              </Card>

              <Card className={lowStock > 0 ? "bg-destructive/10" : undefined}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Alacsony készlet
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lowStock} termék
                  </div>
                  <div className="text-xs text-muted-foreground">
                    minimum szint alatt
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AnimatedItem>

      <AnimatedItem>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Keresés név vagy cikkszám alapján..."
            value={filterState.search}
            onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
            className="max-w-sm"
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
                      const saved = savedFilters.find(f => f.id === value);
                      if (saved) {
                        setFilterState(saved.filter);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz mentett szűrőt" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedFilters.map(filter => (
                        <SelectItem key={filter.id} value={filter.id}>
                          {filter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Készletszint</h4>
                  <Select
                    value={filterState.stockRange}
                    onValueChange={(v) => setFilterState(prev => ({ ...prev, stockRange: v as StockRange }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz készletszintet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes</SelectItem>
                      <SelectItem value="low">Alacsony készlet</SelectItem>
                      <SelectItem value="optimal">Optimális készlet</SelectItem>
                      <SelectItem value="high">Magas készlet</SelectItem>
                      <SelectItem value="custom">Egyéni tartomány</SelectItem>
                    </SelectContent>
                  </Select>

                  {filterState.stockRange === "custom" && (
                    <div className="space-y-2 mt-2">
                      <div className="px-2">
                        <Slider
                          defaultValue={[filterState.stockLevels.min, filterState.stockLevels.max]}
                          max={1000}
                          step={10}
                          onValueChange={([min, max]) => setFilterState(prev => ({
                            ...prev,
                            stockLevels: { min, max }
                          }))}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{filterState.stockLevels.min} db</span>
                        <span>{filterState.stockLevels.max} db</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Rendezés</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={filterState.sortBy}
                      onValueChange={(value) => setFilterState(prev => ({ ...prev, sortBy: value as SortField }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rendezés alapja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Név</SelectItem>
                        <SelectItem value="sku">Cikkszám</SelectItem>
                        <SelectItem value="stockLevel">Készletszint</SelectItem>
                        <SelectItem value="value">Készletérték</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterState.sortDirection}
                      onValueChange={(value) => setFilterState(prev => ({ ...prev, sortDirection: value as SortDirection }))}
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
                  <h4 className="font-medium">Kategóriák</h4>
                  <div className="space-y-2">
                    {["Alapanyag", "Késztermék", "Csomagolóanyag", "Alkatrész"].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filterState.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            setFilterState(prev => ({
                              ...prev,
                              categories: checked
                                ? [...prev.categories, category]
                                : prev.categories.filter(c => c !== category)
                            }));
                          }}
                        />
                        <label
                          htmlFor={category}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
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
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowFilterMenu(false)}
                  >
                    <Save className="h-4 w-4" />
                    Mentés
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rendezés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Név szerint</SelectItem>
              <SelectItem value="stock">Készlet szerint</SelectItem>
              <SelectItem value="value">Érték szerint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AnimatedItem>

      <AnimatedItem>
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
                <TableHead>{t("productName")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("stockLevel")}</TableHead>
                <TableHead>Készletszint</TableHead>
                <TableHead>{t("minStockLevel")}</TableHead>
                <TableHead>Készletérték</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockRatio = product.minStockLevel 
                  ? (product.stockLevel / product.minStockLevel) * 100
                  : 100;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {product.stockLevel} {product.unit}
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={stockRatio} 
                          className={stockRatio < 100 ? "text-destructive" : ""}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.round(stockRatio)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.minStockLevel || "-"}</TableCell>
                    <TableCell>
                      {(parseFloat(product.price) * product.stockLevel).toLocaleString()} Ft
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </AnimatedItem>
    </PageLayout>
  );
}