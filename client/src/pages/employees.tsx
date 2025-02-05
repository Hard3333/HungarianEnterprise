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
import { Users, Plus, Building2, Briefcase, CircleDollarSign, Filter, Save, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isWithinInterval, parseISO, subDays, subMonths, subYears } from "date-fns";

// Form schemas
const employeeSchema = z.object({
  name: z.string().min(1, "Kötelező mező"),
  email: z.string().email("Érvénytelen email cím"),
  position: z.string().min(1, "Kötelező mező"),
  department: z.string().min(1, "Kötelező mező"),
  startDate: z.string(),
  salary: z.string().min(1, "Kötelező mező"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

// Filter types
type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year" | "custom";
type SalaryFilter = { min: number; max: number };
type SortDirection = "asc" | "desc";
type SortField = "name" | "department" | "position" | "startDate" | "salary";

interface FilterState {
  search: string;
  dateRange: DateRange;
  customDateStart?: string;
  customDateEnd?: string;
  salary: SalaryFilter;
  departments: string[];
  sortBy: SortField;
  sortDirection: SortDirection;
  saveFilter?: string;
}

const defaultFilter: FilterState = {
  search: "",
  dateRange: "all",
  salary: { min: 0, max: 2000000 },
  departments: [],
  sortBy: "name",
  sortDirection: "asc",
};

// Saved filters
const savedFilters: { id: string; name: string; filter: FilterState }[] = [
  { 
    id: "recent", 
    name: "Új belépők", 
    filter: { ...defaultFilter, dateRange: "month" } 
  },
  { 
    id: "high-salary", 
    name: "Magas fizetésűek", 
    filter: { ...defaultFilter, salary: { min: 1000000, max: 2000000 } } 
  },
  { 
    id: "it-dept", 
    name: "IT részleg", 
    filter: { ...defaultFilter, departments: ["Fejlesztés", "Infrastruktúra"] } 
  },
];

export default function Employees() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilter);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  // Filter functions
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

  const matchesSearch = (employee: any) => {
    if (!filterState.search) return true;
    const searchTerms = filterState.search.toLowerCase().split(" ");

    return searchTerms.every(term => {
      const searchString = [
        employee.name,
        employee.email,
        employee.position,
        employee.department,
      ].join(" ").toLowerCase();

      return searchString.includes(term);
    });
  };

  const matchesSalary = (salary: number) => {
    return salary >= filterState.salary.min && salary <= filterState.salary.max;
  };

  const matchesDepartment = (department: string) => {
    if (filterState.departments.length === 0) return true;
    return filterState.departments.includes(department);
  };

  // Filter application
  const filteredEmployees = employees.filter(employee => {
    if (!matchesSearch(employee)) return false;
    if (!isWithinDateRange(new Date(employee.startDate))) return false;
    if (!matchesSalary(employee.salary)) return false;
    if (!matchesDepartment(employee.department)) return false;
    return true;
  });

  return (
    <PageLayout
      title={t("employees")}
      description="Alkalmazottak kezelése"
    >
      <AnimatedItem className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="Keresés név, email vagy pozíció alapján..."
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
                  <h4 className="font-medium">Belépés ideje</h4>
                  <Select
                    value={filterState.dateRange}
                    onValueChange={(v) => setFilterState(prev => ({ ...prev, dateRange: v as DateRange }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz időszakot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes</SelectItem>
                      <SelectItem value="today">Mai</SelectItem>
                      <SelectItem value="week">Elmúlt 7 nap</SelectItem>
                      <SelectItem value="month">Elmúlt 30 nap</SelectItem>
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
                          onChange={(e) => setFilterState(prev => ({
                            ...prev,
                            customDateStart: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Záró dátum</label>
                        <Input
                          type="date"
                          value={filterState.customDateEnd}
                          onChange={(e) => setFilterState(prev => ({
                            ...prev,
                            customDateEnd: e.target.value
                          }))}
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
                      onValueChange={(value) => setFilterState(prev => ({ ...prev, sortBy: value as SortField }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rendezés alapja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Név</SelectItem>
                        <SelectItem value="department">Részleg</SelectItem>
                        <SelectItem value="position">Pozíció</SelectItem>
                        <SelectItem value="startDate">Belépés dátuma</SelectItem>
                        <SelectItem value="salary">Fizetés</SelectItem>
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
                  <h4 className="font-medium">Fizetési tartomány</h4>
                  <div className="px-2">
                    <Slider
                      defaultValue={[filterState.salary.min, filterState.salary.max]}
                      max={2000000}
                      step={50000}
                      onValueChange={([min, max]) => setFilterState(prev => ({
                        ...prev,
                        salary: { min, max }
                      }))}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{filterState.salary.min.toLocaleString()} Ft</span>
                    <span>{filterState.salary.max.toLocaleString()} Ft</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Részlegek</h4>
                  <div className="space-y-2">
                    {["Fejlesztés", "Design", "Infrastruktúra", "HR", "Marketing"].map((department) => (
                      <div key={department} className="flex items-center space-x-2">
                        <Checkbox
                          id={department}
                          checked={filterState.departments.includes(department)}
                          onCheckedChange={(checked) => {
                            setFilterState(prev => ({
                              ...prev,
                              departments: checked
                                ? [...prev.departments, department]
                                : prev.departments.filter(d => d !== department)
                            }));
                          }}
                        />
                        <label
                          htmlFor={department}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {department}
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
                    {filteredEmployees.length} fő
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
                    {Array.from(new Set(filteredEmployees.map(e => e.department))).length} db
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
                    {(filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0) / filteredEmployees.length).toLocaleString()} Ft
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
              {filteredEmployees.map((employee) => (
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