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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("stockLevel")}</TableHead>
                <TableHead>{t("unit")}</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
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