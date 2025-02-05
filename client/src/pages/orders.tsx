import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, Contact, Product, insertOrderSchema } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const isLoading = isLoadingOrders || isLoadingContacts || isLoadingProducts;

  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: selectedOrder || {
      contactId: 0,
      status: "pending",
      total: "",
      items: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Order) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: t("success") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Order) => {
      const res = await apiRequest(
        "PATCH",
        `/api/orders/${selectedOrder?.id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setDialogOpen(false);
      setSelectedOrder(null);
      form.reset();
      toast({ title: t("success") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: t("success") });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (selectedOrder) {
      updateMutation.mutate(data as Order);
    } else {
      createMutation.mutate(data as Order);
    }
  });

  return (
    <PageLayout
      title={t("orders")}
      description="Rendelések kezelése"
    >
      <AnimatedItem className="flex justify-between items-center mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedOrder(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addOrder")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedOrder ? t("editOrder") : t("addOrder")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("contacts")}</Label>
                <Select
                  defaultValue={String(form.getValues("contactId"))}
                  onValueChange={(value) =>
                    form.setValue("contactId", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={String(contact.id)}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select
                  defaultValue={form.getValues("status")}
                  onValueChange={(value) => form.setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                    <SelectItem value="completed">{t("completed")}</SelectItem>
                    <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("total")}</Label>
                <Input
                  type="text"
                  {...form.register("total")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("invoiceNumber")}</Label>
                <Input {...form.register("invoiceNumber")} />
              </div>

              <Button type="submit" className="w-full">
                {selectedOrder ? t("editOrder") : t("addOrder")}
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
                <TableHead>{t("invoiceNumber")}</TableHead>
                <TableHead>{t("contactName")}</TableHead>
                <TableHead>{t("orderDate")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("total")}</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.invoiceNumber}</TableCell>
                  <TableCell>
                    {contacts.find((c) => c.id === order.contactId)?.name}
                  </TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString("hu")}
                  </TableCell>
                  <TableCell>{t(order.status as any)}</TableCell>
                  <TableCell>{order.total} Ft</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order);
                          form.reset(order);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(order.id)}
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