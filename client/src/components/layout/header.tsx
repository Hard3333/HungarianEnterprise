import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-6 gap-4">
        <div className="flex-1" />
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="font-medium">
          {user?.username}
        </div>
      </div>
    </header>
  );
}
