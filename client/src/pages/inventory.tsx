import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, insertProductSchema } from "@shared/schema";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, Filter, Save, Download, Upload, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

// Filter types
type StockRange = "all" | "low" | "optimal" | "high" | "custom";
type ValueRange = "all" | "low" | "medium" | "high" | "custom";
type StockFilter = { min: number; max: number };
type ValueFilter = { min: number; max: number };
type SortDirection = "asc" | "desc";
type SortField = "name" | "sku" | "price" | "stockLevel";

interface FilterState {
  search: string;
  stockRange: StockRange;
  valueRange: ValueRange;
  stockLevels: StockFilter;
  valueFilter: ValueFilter;
  categories: string[];
  sortBy: SortField;
  sortDirection: SortDirection;
  showLowStock: boolean;
  saveFilter?: string;
}

const defaultFilter: FilterState = {
  search: "",
  stockRange: "all",
  valueRange: "all",
  stockLevels: { min: 0, max: 1000 },
  valueFilter: { min: 0, max: 1000000 },
  categories: [],
  sortBy: "name",
  sortDirection: "asc",
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
    name: "Magas értékű termékek",
    filter: { ...defaultFilter, valueRange: "high" }
  },
  {
    id: "critical",
    name: "Kritikus termékek",
    filter: { ...defaultFilter, stockRange: "low", showLowStock: true }
  }
];

export default function Inventory() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilter);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: selectedProduct || {
      name: "",
      sku: "",
      price: "",
      stockLevel: 0,
      minStockLevel: 0,
      unit: "db",
    },
  });

  // Batch operations
  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await apiRequest("DELETE", "/api/products/batch", { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setSelectedItems([]);
      toast({ title: t("success") });
    },
  });

  const batchUpdateMutation = useMutation({
    mutationFn: async (data: { ids: number[]; updates: Partial<Product> }) => {
      const res = await apiRequest("PATCH", "/api/products/batch", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setSelectedItems([]);
      toast({ title: t("success") });
    },
  });

  // File operations
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const products = JSON.parse(e.target?.result as string);
        await apiRequest("POST", "/api/products/import", { products });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        toast({ title: t("importSuccess") });
      } catch (error) {
        toast({ 
          title: t("importError"),
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const exportData = selectedItems.length > 0
      ? products.filter(p => selectedItems.includes(p.id))
      : products;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  const matchesValueRange = (product: Product) => {
    const value = parseFloat(product.price) * product.stockLevel;

    switch (filterState.valueRange) {
      case "low":
        return value < 100000;
      case "medium":
        return value >= 100000 && value <= 500000;
      case "high":
        return value > 500000;
      case "custom":
        return value >= filterState.valueFilter.min && 
               value <= filterState.valueFilter.max;
      default:
        return true;
    }
  };

  const matchesCategory = (product: Product) => {
    if (filterState.categories.length === 0) return true;
    return filterState.categories.includes(product.department);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => 
      matchesSearch(p) &&
      matchesStockRange(p) &&
      matchesValueRange(p) &&
      matchesCategory(p)
    )
    .sort((a, b) => {
      const direction = filterState.sortDirection === "asc" ? 1 : -1;

      switch (filterState.sortBy) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "sku":
          return direction * a.sku.localeCompare(b.sku);
        case "price":
          return direction * (parseFloat(a.price) - parseFloat(b.price));
        case "stockLevel":
          return direction * (a.stockLevel - b.stockLevel);
        default:
          return 0;
      }
    });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: Product) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: t("success") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Product) => {
      const res = await apiRequest(
        "PATCH",
        `/api/products/${selectedProduct?.id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDialogOpen(false);
      setSelectedProduct(null);
      form.reset();
      toast({ title: t("success") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: t("success") });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (selectedProduct) {
      updateMutation.mutate(data as Product);
    } else {
      createMutation.mutate(data as Product);
    }
  });

  return (
    <PageLayout
      title={t("inventory")}
      description="Készletkezelés és termékinformációk"
    >
      <AnimatedItem className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Keresés név vagy cikkszám alapján..."
            value={filterState.search}
            onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
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
                    onValueChange={(v) => setFilterState(prev => ({ 
                      ...prev, 
                      stockRange: v as StockRange 
                    }))}
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
                  <h4 className="font-medium">Készletérték</h4>
                  <Select
                    value={filterState.valueRange}
                    onValueChange={(v) => setFilterState(prev => ({ 
                      ...prev, 
                      valueRange: v as ValueRange 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz értéktartományt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes</SelectItem>
                      <SelectItem value="low">Alacsony érték</SelectItem>
                      <SelectItem value="medium">Közepes érték</SelectItem>
                      <SelectItem value="high">Magas érték</SelectItem>
                      <SelectItem value="custom">Egyéni tartomány</SelectItem>
                    </SelectContent>
                  </Select>

                  {filterState.valueRange === "custom" && (
                    <div className="space-y-2 mt-2">
                      <div className="px-2">
                        <Slider
                          defaultValue={[filterState.valueFilter.min, filterState.valueFilter.max]}
                          max={1000000}
                          step={10000}
                          onValueChange={([min, max]) => setFilterState(prev => ({
                            ...prev,
                            valueFilter: { min, max }
                          }))}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{filterState.valueFilter.min.toLocaleString()} Ft</span>
                        <span>{filterState.valueFilter.max.toLocaleString()} Ft</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Rendezés</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={filterState.sortBy}
                      onValueChange={(value) => setFilterState(prev => ({ 
                        ...prev, 
                        sortBy: value as SortField 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rendezés alapja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Név</SelectItem>
                        <SelectItem value="sku">Cikkszám</SelectItem>
                        <SelectItem value="price">Ár</SelectItem>
                        <SelectItem value="stockLevel">Készletszint</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterState.sortDirection}
                      onValueChange={(value) => setFilterState(prev => ({ 
                        ...prev, 
                        sortDirection: value as SortDirection 
                      }))}
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
        </div>

        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(t("confirmBatchDelete"))) {
                    batchDeleteMutation.mutate(selectedItems);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteSelected")} ({selectedItems.length})
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("exportSelected")}
              </Button>
            </>
          )}

          <label htmlFor="file-import">
            <Button variant="outline" size="sm" asChild>
              <div>
                <Upload className="h-4 w-4 mr-2" />
                {t("import")}
              </div>
            </Button>
          </label>
          <input
            id="file-import"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileImport}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("exportAll")}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedProduct(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                {t("addProduct")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedProduct ? t("editProduct") : t("addProduct")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("productName")}</Label>
                  <Input {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">{t("sku")}</Label>
                  <Input {...form.register("sku")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t("price")}</Label>
                    <Input
                      type="text"
                      {...form.register("price")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">{t("unit")}</Label>
                    <Input {...form.register("unit")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockLevel">{t("stockLevel")}</Label>
                    <Input
                      type="number"
                      {...form.register("stockLevel", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">{t("minStockLevel")}</Label>
                    <Input
                      type="number"
                      {...form.register("minStockLevel", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {selectedProduct ? t("editProduct") : t("addProduct")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedItems.length > 0 &&
                      selectedItems.length === filteredProducts.length
                    }
                    onCheckedChange={(checked) => {
                      setSelectedItems(
                        checked
                          ? filteredProducts.map((p) => p.id)
                          : []
                      );
                    }}
                  />
                </TableHead>
                <TableHead>{t("productName")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("stockLevel")}</TableHead>
                <TableHead>{t("unit")}</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow 
                  key={product.id}
                  className={
                    selectedItems.includes(product.id)
                      ? "bg-accent/50"
                      : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(product.id)}
                      onCheckedChange={(checked) => {
                        setSelectedItems(
                          checked
                            ? [...selectedItems, product.id]
                            : selectedItems.filter((id) => id !== product.id)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.price} Ft</TableCell>
                  <TableCell>
                    <span
                      className={
                        product.stockLevel <= (product.minStockLevel || 0)
                          ? "text-destructive"
                          : ""
                      }
                    >
                      {product.stockLevel} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product);
                          form.reset(product);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AnimatedItem>
    </PageLayout>
  );
}