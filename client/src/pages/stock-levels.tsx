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
import { Package2, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockLevels() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "stock" | "value">("stock");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "stock") return b.stockLevel - a.stockLevel;
      return parseFloat(b.price) - parseFloat(a.price);
    });

  const totalValue = products.reduce((sum, p) => 
    sum + parseFloat(p.price) * p.stockLevel, 0
  );

  const avgStock = Math.round(
    products.reduce((sum, p) => sum + p.stockLevel, 0) / products.length
  );

  const lowStock = products.filter(p => 
    p.stockLevel <= (p.minStockLevel || 0)
  ).length;

  return (
    <PageLayout
      title={t("stockLevels")}
      description="Részletes készletszint információk"
    >
      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[
            {
              title: "Összes készletérték",
              icon: Package2,
              value: `${totalValue.toLocaleString()} Ft`,
              description: `${products.length} termék összértéke`
            },
            {
              title: "Átlagos készletszint",
              icon: avgStock > 100 ? ArrowUpRight : ArrowDownRight,
              value: `${avgStock} db`,
              description: "átlagosan termékenként",
              iconColor: avgStock > 100 ? "text-green-500" : "text-red-500"
            },
            {
              title: "Alacsony készlet",
              icon: AlertTriangle,
              value: `${lowStock} termék`,
              description: "minimum szint alatt",
              className: lowStock > 0 ? "bg-destructive/10" : undefined
            }
          ].map((stat, index) => (
            <Card key={index} className={stat.className}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.iconColor || "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedItem>

      <AnimatedItem>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Keresés név vagy cikkszám alapján..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
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