import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AnimatedContent } from "./animated-content";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <AnimatedContent>
          <main className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {children}
          </main>
        </AnimatedContent>
      </div>
    </div>
  );
}
