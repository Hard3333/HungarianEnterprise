import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data, {
      onError: () => {
        // If login fails, try to register
        registerMutation.mutate(data);
      },
    });
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">ERP Rendszer</h1>
            <p className="text-sm text-gray-600 mt-2">
              Jelentkezzen be vagy regisztráljon automatikusan
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                {...form.register("username")}
                error={form.formState.errors.username?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                error={form.formState.errors.password?.message}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("login")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
