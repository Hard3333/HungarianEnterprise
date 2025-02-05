import { useState } from "react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Building2, Briefcase, CircleDollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";

const employeeSchema = z.object({
  name: z.string().min(1, "Kötelező mező"),
  email: z.string().email("Érvénytelen email cím"),
  position: z.string().min(1, "Kötelező mező"),
  department: z.string().min(1, "Kötelező mező"),
  startDate: z.string(),
  salary: z.string().min(1, "Kötelező mező"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function Employees() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  setTimeout(() => setIsLoading(false), 1000);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      position: "",
      department: "",
      startDate: new Date().toISOString().split('T')[0],
      salary: "",
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    console.log(data);
    setOpen(false);
    form.reset();
  };

  // Test data
  const employees = [
    {
      id: 1,
      name: "Nagy János",
      email: "janos.nagy@example.com",
      position: "Frontend Fejlesztő",
      department: "Fejlesztés",
      startDate: "2023-01-15",
      salary: 850000,
    },
    {
      id: 2,
      name: "Kiss Éva",
      email: "eva.kiss@example.com",
      position: "UI/UX Designer",
      department: "Design",
      startDate: "2023-03-01",
      salary: 780000,
    },
    {
      id: 3,
      name: "Szabó Péter",
      email: "peter.szabo@example.com",
      position: "DevOps Mérnök",
      department: "Infrastruktúra",
      startDate: "2023-05-20",
      salary: 950000,
    },
    {
      id: 4,
      name: "Kovács Anna",
      email: "anna.kovacs@example.com",
      position: "HR Menedzser",
      department: "HR",
      startDate: "2023-02-10",
      salary: 820000,
    },
  ];

  const departmentCounts = employees.reduce((acc, emp) => ({
    ...acc,
    [emp.department]: (acc[emp.department] || 0) + 1
  }), {} as Record<string, number>);

  const avgSalary = employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length;

  return (
    <PageLayout
      title={t("employees")}
      description="Alkalmazottak kezelése"
    >
      <AnimatedItem className="flex justify-between items-center mb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új alkalmazott
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új alkalmazott hozzáadása</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Név</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pozíció</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Részleg</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Válassz részleget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Fejlesztés">Fejlesztés</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Infrastruktúra">Infrastruktúra</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kezdési dátum</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fizetés (Ft)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Mentés
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </AnimatedItem>

      <AnimatedItem>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
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
                    Összes alkalmazott
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {employees.length} fő
                  </div>
                  <p className="text-xs text-muted-foreground">
                    aktív alkalmazott
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Részlegek száma
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(departmentCounts).length} db
                  </div>
                  <p className="text-xs text-muted-foreground">
                    aktív részleg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Átlag szolgálati idő
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    11.2 hó
                  </div>
                  <p className="text-xs text-muted-foreground">
                    átlagos munkaviszony
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Átlag fizetés
                  </CardTitle>
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgSalary.toLocaleString()} Ft
                  </div>
                  <p className="text-xs text-muted-foreground">
                    bruttó átlagfizetés
                  </p>
                </CardContent>
              </Card>
            </>
          )}
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
                <TableHead>Név</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pozíció</TableHead>
                <TableHead>Részleg</TableHead>
                <TableHead>Kezdés dátuma</TableHead>
                <TableHead className="text-right">Fizetés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {employee.name}
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.startDate}</TableCell>
                  <TableCell className="text-right">
                    {employee.salary.toLocaleString()} Ft
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