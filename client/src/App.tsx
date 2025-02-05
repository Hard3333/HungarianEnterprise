import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { AnimatePresence } from "framer-motion";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Orders from "@/pages/orders";
import Contacts from "@/pages/contacts";
import StockLevels from "@/pages/stock-levels";
import IncomingDeliveries from "@/pages/incoming";
import Invoices from "@/pages/invoices";
import Customers from "@/pages/customers";
import Bills from "@/pages/bills";
import Reports from "@/pages/reports";
import Accounting from "@/pages/accounting";
import Employees from "@/pages/employees";
import Suppliers from "@/pages/suppliers";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/inventory" component={Inventory} />
        <ProtectedRoute path="/orders" component={Orders} />
        <ProtectedRoute path="/contacts" component={Contacts} />
        <ProtectedRoute path="/stock-levels" component={StockLevels} />
        <ProtectedRoute path="/incoming" component={IncomingDeliveries} />
        <ProtectedRoute path="/invoices" component={Invoices} />
        <ProtectedRoute path="/customers" component={Customers} />
        <ProtectedRoute path="/bills" component={Bills} />
        <ProtectedRoute path="/reports" component={Reports} />
        <ProtectedRoute path="/accounting" component={Accounting} />
        <ProtectedRoute path="/employees" component={Employees} />
        <ProtectedRoute path="/suppliers" component={Suppliers} />
        <ProtectedRoute path="/settings" component={Settings} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="erp-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;