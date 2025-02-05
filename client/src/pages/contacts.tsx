import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Contact, insertContactSchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function Contacts() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const form = useForm({
    resolver: zodResolver(insertContactSchema),
    defaultValues: selectedContact || {
      name: "",
      type: "customer",
      email: "",
      phone: "",
      address: "",
      taxNumber: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Contact) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: t("success") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Contact) => {
      const res = await apiRequest(
        "PATCH",
        `/api/contacts/${selectedContact?.id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setDialogOpen(false);
      setSelectedContact(null);
      form.reset();
      toast({ title: t("success") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: t("success") });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (selectedContact) {
      updateMutation.mutate(data as Contact);
    } else {
      createMutation.mutate(data as Contact);
    }
  });

  return (
    <PageLayout
      title={t("contacts")}
      description="Kapcsolatok kezelése"
    >
      <AnimatedItem className="flex justify-between items-center mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedContact(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addContact")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedContact ? t("editContact") : t("addContact")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("contactName")}</Label>
                <Input {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input {...form.register("email")} type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Input {...form.register("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">{t("taxNumber")}</Label>
                <Input {...form.register("taxNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea {...form.register("notes")} />
              </div>
              <Button type="submit" className="w-full">
                {selectedContact ? t("editContact") : t("addContact")}
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
                <TableHead>{t("contactName")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>{t("taxNumber")}</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.taxNumber}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedContact(contact);
                          form.reset(contact);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(contact.id)}
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