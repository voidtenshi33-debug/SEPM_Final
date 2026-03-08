
import type { Metadata } from "next";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import "./globals.css";

export const metadata: Metadata = {
  title: "StartupOS | Growth Intelligence Engine",
  description: "Guarding Growth, Preventing Failure. Integrated startup management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseClientProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/50 backdrop-blur-md sticky top-0 z-40">
                <SidebarTrigger className="-ml-1" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-muted-foreground">Command Center</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold text-accent">LIFELINE: ACTIVE</span>
                    <span className="text-[10px] text-muted-foreground">Version 1.0.4-beta</span>
                  </div>
                </div>
              </header>
              <main className="p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
