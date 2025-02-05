import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, Contact, Product, VatRate, insertOrderSchema, TranslationKey, translationKeys } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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

  const { data: vatRates = [], isLoading: isLoadingVatRates } = useQuery<VatRate[]>({
    queryKey: ["/api/vat-rates"],
  });

  const isLoading = isLoadingOrders || isLoadingContacts || isLoadingProducts || isLoadingVatRates;

  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: selectedOrder || {
      contactId: 0,
      status: "pending",
      netTotal: "0",
      vatTotal: "0",
      grossTotal: "0",
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
      toast({ title: t(translationKeys.create as TranslationKey) });
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
      toast({ title: t(translationKeys.save as TranslationKey) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: t(translationKeys.save as TranslationKey) });
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
      title={t("orders" as TranslationKey)}
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
              {t("addOrder" as TranslationKey)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedOrder ? t("editOrder" as TranslationKey) : t("addOrder" as TranslationKey)}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(translationKeys.contact)}</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t(translationKeys.selectContact)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={String(contact.id)}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(translationKeys.status)}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t(translationKeys.selectStatus)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">{t(translationKeys.pending)}</SelectItem>
                          <SelectItem value="completed">{t(translationKeys.completed)}</SelectItem>
                          <SelectItem value="cancelled">{t(translationKeys.cancelled)}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="netTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(translationKeys.netTotal)}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vatTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(translationKeys.vatTotal)}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(translationKeys.grossTotal)}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(translationKeys.invoiceNumber)}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {selectedOrder ? t(translationKeys.save) : t(translationKeys.create)}
                </Button>
              </form>
            </Form>
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
                <TableHead>{t(translationKeys.invoiceNumber)}</TableHead>
                <TableHead>{t("contactName" as TranslationKey)}</TableHead>
                <TableHead>{t("orderDate" as TranslationKey)}</TableHead>
                <TableHead>{t(translationKeys.status)}</TableHead>
                <TableHead>{t(translationKeys.netTotal)}</TableHead>
                <TableHead>{t(translationKeys.vatTotal)}</TableHead>
                <TableHead>{t(translationKeys.grossTotal)}</TableHead>
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
                  <TableCell>
                    <Badge variant="secondary" className={
                      order.status === "completed" ? "bg-green-500" :
                      order.status === "cancelled" ? "bg-red-500" :
                      "bg-yellow-500"
                    }>
                      {t(order.status as TranslationKey)}
                    </Badge>
                  </TableCell>
                  <TableCell>{Number(order.netTotal).toLocaleString()} Ft</TableCell>
                  <TableCell>{Number(order.vatTotal).toLocaleString()} Ft</TableCell>
                  <TableCell>{Number(order.grossTotal).toLocaleString()} Ft</TableCell>
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